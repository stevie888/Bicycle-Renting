import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

interface SignupRequest {
  username: string;
  email: string;
  password: string;
  name: string;
  mobile: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json();
    const { username, email, password, name, mobile } = body;

    // Validate input
    if (!username || !email || !password || !name || !mobile) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUsers = await executeQuery(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    ) as any[];

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const userId = Date.now().toString();
    await executeQuery(
      'INSERT INTO users (id, username, email, password, name, mobile) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, username, email, password, name, mobile]
    );

    // Get the created user
    const newUsers = await executeQuery(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    ) as any[];

    const newUser = newUsers[0];

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = newUser;
    
    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'User registered successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 