// import {NextResponse} from  'next/server';
// import {createClient} from '@supabase/supabase-js'
// import {cookies} from 'next/headers';
// import { use } from 'react';
// import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'
// import crypto from 'crypto';

// export async function POST(req: Request) {
//   try {
//     const supabaseAdmin = createClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.SUPABASE_SERVICE_ROLE_KEY!
//     );

//     // FIX: Read cookie using next/headers instead of req.cookies
//    const cookieStore = await cookies();

//     const refreshToken = cookieStore.get('app-refresh-token')?.value;

//     if (!refreshToken) {
//       return NextResponse.json({ error: 'Session rotation token missing' }, { status: 401 });
//     }
//     const refreshTokenHash = crypto
//   .createHash('sha256')
//   .update(refreshToken)
//   .digest('hex');

//     try {
//       jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
//     } catch {
//       return NextResponse.json({ error: 'Invalid token architecture pattern' }, { status: 401 });
//     }

//     const { data: storedToken, error } = await supabaseAdmin
//       .from('sessions')
//       .select('*, users(*, roles(name))')
//       .eq('token_hash', refreshTokenHash)
//       .gt('expires_at', new Date().toISOString())
//       .single();

//     if (error || !storedToken) {
//       return NextResponse.json(
//         { error: 'Revoked or unrecognized session token.' },
//         { status: 401 }
//       );
//     }

//     const user = storedToken.users;

//     // FIX: Safe parsing for nested user roles data
//     const roleName = Array.isArray(user?.roles) ? user?.roles[0]?.name : user?.roles?.name;

//     const newAccessToken = jwt.sign(
//       {
//         sub: user.id,
//         email: user.email,
//         role_id: user.role_id,
//         role_name: roleName,
//         aud: 'authenticated',
//         role: 'authenticated',
//       },
//       process.env.JWT_SECRET!,
//       { expiresIn: '15m' }
//     );

//     const response = NextResponse.json({ success: true });
//     response.cookies.set('app-access-token', newAccessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       maxAge: 15 * 60,
//       path: '/',
//     });

//     return response;
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }


// }



import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export async function POST() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const cookieStore = await cookies();

    const refreshToken =
      cookieStore.get('app-refresh-token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token missing' },
        { status: 401 }
      );
    }

    // Verify refresh token JWT
    try {
      jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      );
    } catch {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Hash incoming refresh token
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    // Find active session
    const { data: session, error: sessionError } =
      await supabaseAdmin
        .from('sessions')
        .select('*')
        .eq('token_hash', refreshTokenHash)
        .gt('expires_at', new Date().toISOString())
        .is('revoked_at', null)
        .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 401 }
      );
    }

    // Fetch user
    const { data: user, error: userError } =
      await supabaseAdmin
        .from('users')
        .select('*, roles(name)')
        .eq('id', session.user_id)
        .single();

    if (userError || !user || !user.is_active) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      );
    }

    const roleName = Array.isArray(user.roles)
      ? user.roles[0]?.name
      : user.roles?.name;

    // New access token
    const newAccessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role_id: user.role_id,
        role_name: roleName,
        aud: 'authenticated',
        role: 'authenticated',
      },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    // New refresh token (ROTATION)
    const newRefreshToken = jwt.sign(
      { sub: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '30d' }
    );

    // Hash new refresh token
    const newRefreshTokenHash = crypto
      .createHash('sha256')
      .update(newRefreshToken)
      .digest('hex');

    // Update session with new hash
    const { error: updateError } =
      await supabaseAdmin
        .from('sessions')
        .update({
          token_hash: newRefreshTokenHash,
          expires_at: new Date(
            Date.now() +
              30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        })
        .eq('id', session.id);

    if (updateError) {
      throw updateError;
    }

    const response = NextResponse.json({
      success: true,
    });

    // Access token cookie
    response.cookies.set(
      'app-access-token',
      newAccessToken,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60,
        path: '/',
      }
    );

    // Refresh token cookie
    response.cookies.set(
      'app-refresh-token',
      newRefreshToken,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/api/auth/refresh',
      }
    );

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}