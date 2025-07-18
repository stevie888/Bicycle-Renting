import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// GET - Get current logged in user
export async function GET(request: NextRequest) {
  try {
    // Get user from cookies or headers
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User not authenticated',
        message: 'Please log in to book umbrellas'
      });
    }

    // Get user from database
    const users = await executeQuery(
      'SELECT id, username, email, name, mobile, role, credits FROM users WHERE id = ?',
      [userId]
    ) as any[];

    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        message: 'Please log in to book umbrellas'
      });
    }

    const user = users[0];

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
        credits: user.credits
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 