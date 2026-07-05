import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcrypt";
import crypto from "crypto";
import * as jose from "jose";
import { loginSchema } from "./schemas/auth.schema";
import { createClient } from "@supabase/supabase-js";

// Ensure the JWT secret is loaded and encoded for jose edge-runtime compatibility
const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- Core Token Utilities ---
interface JWTPayload {
  sub: string;
  email: string;
  role_id?: string;
  role_name?: string;
}

async function createAccessToken(payload: JWTPayload): Promise<string> {
  return await new jose.SignJWT({
    email: payload.email,
    role_id: payload.role_id,
    role_name: payload.role_name,
    aud: "authenticated",
    role: "authenticated",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("15m") // 15 Minute short-lived access token
    .sign(JWT_SECRET);
}

async function createRefreshToken(): Promise<string> {
  return crypto.randomUUID(); // Opaque secure unique token identifier
}

// --- NextAuth Setup Configuration ---
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials);
        if (!parsedCredentials.success) return null;

        const { email, password } = parsedCredentials.data;

        const { data: user, error } = await supabaseAdmin
          .from("users")
          .select("*, roles(name)")
          .eq("email", email)
          .single();

        if (error || !user || !user.is_active) return null;

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) return null;

        const roleName = Array.isArray(user.roles) ? user.roles[0]?.name : user.roles?.name;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role_id: user.role_id,
          role_name: roleName,
        };
      },
    }),
  ],

  callbacks: {
    // 1. Hook into Sign In to provision/upsert raw social profiles to DB
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true;

      if (account?.provider === "google") {
        try {
          let { data: dbUser } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("email", user.email!)
            .single();

          if (!dbUser) {
            // Provide a default Role ID matching your system configurations
            const defaultRoleId = "your-default-user-role-id"; 

            const { data: newUser, error: insertError } = await supabaseAdmin
              .from("users")
              .insert({
                name: user.name,
                email: user.email,
                is_active: true,
                role_id: defaultRoleId,
              })
              .select()
              .single();

            if (insertError) throw insertError;
            dbUser = newUser;
          }
          return true;
        } catch (err) {
          console.error("Error provisioning OAuth account in database:", err);
          return false;
        }
      }
      return false;
    },

    // 2. Manage stateless application custom tokens and DB tracked sessions
    async jwt({ token, user, account }) {
      // Flow Path A: Initial Sign-In (Credential verification or Google callback)
      if (account && user) {
        let finalUser = {
          id: user.id!,
          name: user.name,
          email: user.email,
          role_id: user.role_id,
          role_name: user.role_name,
        };

        // If Google authentication, complement baseline schema with relational database roles
        if (account.provider === "google") {
          const { data: dbUser } = await supabaseAdmin
            .from("users")
            .select("*, roles(name)")
            .eq("email", user.email!)
            .single();

          if (dbUser) {
            const roleName = Array.isArray(dbUser.roles) ? dbUser.roles[0]?.name : dbUser.roles?.name;
            finalUser = {
              id: dbUser.id,
              name: dbUser.name,
              email: dbUser.email,
              role_id: dbUser.role_id,
              role_name: roleName,
            };
          }
        }

        // Generate application security tokens
        const accessToken = await createAccessToken({
          sub: finalUser.id,
          email: finalUser.email!,
          role_id: finalUser.role_id,
          role_name: finalUser.role_name,
        });

        const refreshToken = await createRefreshToken();
        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
        const deviceId = crypto.randomUUID();

        // Log session explicitly into database
        const { error: sessionError } = await supabaseAdmin
          .from("sessions")
          .insert({
            user_id: finalUser.id,
            device_id: deviceId,
            token_hash: refreshTokenHash,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 Days
          });

        if (sessionError) throw sessionError;

        return {
          accessToken,
          refreshToken,
          accessTokenExpires: Date.now() + 15 * 60 * 1000, 
          user: finalUser,
        };
      }

      // Flow Path B: Return token if access token has not expired yet
      if (Date.now() < (token.accessTokenExpires ?? 0)) {
        return token;
      }

      // Flow Path C: Token Expired -> Invalidate, verify DB, and execute RTR
      try {
        if (!token.refreshToken) throw new Error("Missing active refresh token identifier");

        const currentTokenHash = crypto.createHash("sha256").update(token.refreshToken).digest("hex");

        const { data: session, error: sessionError } = await supabaseAdmin
          .from("sessions")
          .select("*, users(*, roles(name))")
          .eq("token_hash", currentTokenHash)
          .single();

        if (sessionError || !session || new Date(session.expires_at) < new Date()) {
          throw new Error("Invalid, blacklisted, or expired database session row");
        }

        const dbUser = session.users;
        const roleName = Array.isArray(dbUser.roles) ? dbUser.roles[0]?.name : dbUser.roles?.name;

        const newAccessToken = await createAccessToken({
          sub: dbUser.id,
          email: dbUser.email,
          role_id: dbUser.role_id,
          role_name: roleName,
        });

        const newRefreshToken = await createRefreshToken();
        const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

        // Rotate hash to prevent token reuse vulnerabilities
        await supabaseAdmin
          .from("sessions")
          .update({
            token_hash: newRefreshTokenHash,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", session.id);

        return {
          ...token,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          accessTokenExpires: Date.now() + 15 * 60 * 1000,
        };
      } catch (err) {
        console.error("Token background rotation error:", err);
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },

    async session({ session, token }) {
      if (token.user) {
        session.user.id = token.user.id;
        session.user.role_id = token.user.role_id;
        session.user.role_name = token.user.role_name;
      }
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },

  events: {
    async signOut(message) {
      const token = (message as any).token;
      if (token?.refreshToken) {
        try {
          const tokenHash = crypto.createHash("sha256").update(token.refreshToken).digest("hex");
          // Remove the session from your database so the refresh token is instantly voided
          await supabaseAdmin.from("sessions").delete().eq("token_hash", tokenHash);
        } catch (err) {
          console.error("Failed to delete database session during signout event:", err);
        }
      }
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
});