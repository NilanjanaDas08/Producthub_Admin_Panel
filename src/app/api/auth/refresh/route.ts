import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

import {
  verifyRefreshToken,
  createAccessToken,
  createRefreshToken,
} from "@/lib/auth/jwt";

export async function POST() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const cookieStore = await cookies();

    const refreshToken =
      cookieStore.get("app-refresh-token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token missing" },
        { status: 401 }
      );
    }

    // Verify refresh token
    let payload;

    try {
      payload = await verifyRefreshToken(refreshToken);
    } catch {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const { data: session, error: sessionError } =
      await supabaseAdmin
        .from("sessions")
        .select("*")
        .eq("token_hash", refreshTokenHash)
        .gt("expires_at", new Date().toISOString())
        .is("revoked_at", null)
        .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Session expired" },
        { status: 401 }
      );
    }

    const { data: user, error: userError } =
      await supabaseAdmin
        .from("users")
        .select("*,roles(name)")
        .eq("id", session.user_id)
        .single();

    if (userError || !user || !user.is_active) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      );
    }

    const roleName = Array.isArray(user.roles)
      ? user.roles[0]?.name
      : user.roles?.name;

    const newAccessToken =
      await createAccessToken({
        sub: user.id,
        email: user.email,
        role_id: user.role_id,
        role_name: roleName,
      });

    const newRefreshToken =
      await createRefreshToken(user.id);

    const newRefreshHash = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    const { error: updateError } =
      await supabaseAdmin
        .from("sessions")
        .update({
          token_hash: newRefreshHash,
          expires_at: new Date(
            Date.now() +
              30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        })
        .eq("id", session.id);

    if (updateError) throw updateError;

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set(
      "app-access-token",
      newAccessToken,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60,
        path: "/",
      }
    );

    response.cookies.set(
      "app-refresh-token",
      newRefreshToken,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60,
        path: "/api/auth/refresh",
      }
    );

    return response;
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message,
      },
      {
        status: 500,
      }
    );
  }
}