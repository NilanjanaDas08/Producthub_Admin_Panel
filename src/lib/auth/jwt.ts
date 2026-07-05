import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET!);

interface JWTPayload {
  sub: string;
  email: string;
  role_id?: string;
  role_name?: string;
}

export async function createAccessToken(payload: JWTPayload): Promise<string> {
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
    .setExpirationTime("15m") // 15-minute expiration
    .sign(JWT_SECRET);
}

export async function createRefreshToken(userId: string): Promise<string> {
  // Generates a random secure string to act as an opaque refresh token identifier
  return crypto.randomUUID();
}