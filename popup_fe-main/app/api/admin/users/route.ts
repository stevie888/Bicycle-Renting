import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  mobile: string;
  role: 'user' | 'admin';
  createdAt: string;
}

// GET - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    let query = 'SELECT id, username, email, name, mobile, role, createdAt FROM users';
    const params: any[] = [];

    // Build WHERE clause dynamically
    const conditions = [];
    if (role) {
      conditions.push('role = ?');
      params.push(role);
    }
    if (search) {
      conditions.push('(username LIKE ? OR email LIKE ? OR name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY createdAt DESC';

    const users = await executeQuery(query, params) as User[];

    return NextResponse.json({
      success: true,
      users,
      count: users.length
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, name, mobile, role = 'user' } = body;

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

    // Create new user
    const userId = Date.now().toString();
    await executeQuery(
      'INSERT INTO users (id, username, email, password, name, mobile, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, username, email, password, name, mobile, role]
    );

    // Get the created user
    const newUsers = await executeQuery(
      'SELECT id, username, email, name, mobile, role, createdAt FROM users WHERE id = ?',
      [userId]
    ) as User[];

    const newUser = newUsers[0];

    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'User created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 