import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Get all users to check their roles
    const users = await executeQuery(
      'SELECT id, username, email, name, role, createdAt FROM users ORDER BY createdAt DESC',
      []
    ) as any[];

    return NextResponse.json({
      success: true,
      users,
      message: 'Debug: All users with roles'
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 