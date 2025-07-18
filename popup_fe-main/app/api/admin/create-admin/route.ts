import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, name, mobile } = body;

    // Validate input
    if (!username || !email || !password || !name || !mobile) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if username or email already exists
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

    // Create admin user
    const userId = Date.now().toString();
    await executeQuery(
      'INSERT INTO users (id, username, email, password, name, mobile, role, credits) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, username, email, password, name, mobile, 'admin', 200]
    );

    // Get the created admin user
    const newUsers = await executeQuery(
      'SELECT id, username, email, name, mobile, role, credits, createdAt FROM users WHERE id = ?',
      [userId]
    ) as any[];

    const newUser = newUsers[0];

    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'Admin user created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 