import {NextResponse} from  'next/server';
import {createClient} from '@supabase/supabase-js'
import {cookies} from 'next/headers';
import { use } from 'react';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import {
  createAccessToken,
  createRefreshToken,
} from "@/lib/auth/jwt";

export async function POST(req:Request){
    try{
        const supabaseAdmin=createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
  const { email,  password } = await req.json();
  if (!email || !password) {
  return NextResponse.json(
    { error: 'Email and password are required' },
    { status: 400 }
  );
}
        const {data:user,error}=await supabaseAdmin.from('users').select('*,roles(name)').eq('email',email).single()

        if(error || !user || !user.is_active){
            return NextResponse.json({error:"Authentication credentials mismatch or incorrect"},{status:401})
        }
        const passwordMatch=await bcrypt.compare(password,user.password_hash

        )
        if(!passwordMatch){
           return NextResponse.json({ error: 'Authentication credentials mismatch' }, { status: 401 }); // FIX: .json instead of .JSON
    }
    const roleName=Array.isArray(user.roles)?user.roles[0]?.name:user.roles?.name
    const tokenPayload={
         sub: user.id,
      email: user.email,
      role_id: user.role_id,
      role_name: roleName, // Matches your uppercase table records (e.g. 'SUPER_ADMIN')
      aud: 'authenticated',
      role: 'authenticated',
    }
   const accessToken = await createAccessToken({
  sub: user.id,
  email: user.email,
  role_id: user.role_id,
  role_name: roleName,
});
 
   const refreshToken = await createRefreshToken(
  user.id
);
   const refreshTokenHash = crypto
  .createHash('sha256')
  .update(refreshToken)
  .digest('hex');
const deviceId = crypto.randomUUID();

const { error: sessionError } = await supabaseAdmin
  .from('sessions')
  .insert({
    user_id: user.id,
    device_id: deviceId,
    token_hash: refreshTokenHash,
    expires_at: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
  });

if (sessionError) throw sessionError;

    const response = NextResponse.json({
      success: true,
      user: { name: user.name, email: user.email },
    });

    // FIX: Set path to '/' so the token is accessible on your frontend /dashboard routes!
    response.cookies.set('app-access-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60,
      path: '/',
    });

    // FIX: Also drop the refresh token into a cookie scoped to the refresh API endpoint
    response.cookies.set('app-refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60,
      path: '/api/auth/refresh',
    });

    return response;
        }
    catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
