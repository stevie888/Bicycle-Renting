import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// GET - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    const users = await executeQuery(
      'SELECT id, username, email, name, mobile, role, credits, total_rentals, createdAt FROM users WHERE id = ?',
      [userId]
    ) as any[];

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: users[0]
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update user (promote to admin, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const body = await request.json();
    const { role } = body;

    // Validate input
    if (!role || !['user', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Valid role (user or admin) is required' },
        { status: 400 }
      );
    }

    // Update user role
    await executeQuery(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, userId]
    );

    // Get the updated user
    const updatedUsers = await executeQuery(
      'SELECT id, username, email, name, mobile, role, credits, total_rentals, createdAt FROM users WHERE id = ?',
      [userId]
    ) as any[];

    if (updatedUsers.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: updatedUsers[0],
      message: `User role updated to ${role}`
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    // Check if user exists
    const existingUsers = await executeQuery(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    ) as any[];

    if (existingUsers.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user
    await executeQuery(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 