import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { email, name, password } = await req.json();

    // Validation
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name and password are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingUser, error: existingUserError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

      console.log({
  existingUser,
  existingUserError,
});
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    // Allow registration only if no users exist
    const { count,error:countError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });
console.log({
  count,
  countError,
});
    if (count && count > 0) {
      return NextResponse.json(
        { error: 'Registration locked. System already initialized.' },
        { status: 403 }
      );
    }

    // Get SUPER_ADMIN role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', 'SUPER_ADMIN')
      .single();
console.log({
  roleData,
  roleError,
});
    if (roleError || !roleData) {
      return NextResponse.json(
        { error: 'SUPER_ADMIN role not found' },
        { status: 500 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        name,
        role_id: roleData.id,
        is_active: true,
        password_hash: hashedPassword,
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    return NextResponse.json(
      {
        message: 'Super Admin created successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
  console.error("REGISTER ERROR");
  console.error(err);

  return NextResponse.json(
    {
      error: err?.message || "Internal Error",
    },
    { status: 500 }
  );
}
}