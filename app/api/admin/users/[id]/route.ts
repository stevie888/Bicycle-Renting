import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// PUT - Update user (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { username, email, name, mobile, role } = body;

    // Validate input
    if (!username || !email || !name || !mobile || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await executeQuery(
      'SELECT id FROM users WHERE id = ?',
      [id]
    ) as any[];

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if username or email already exists for other users
    const duplicateUsers = await executeQuery(
      'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
      [username, email, id]
    ) as any[];

    if (duplicateUsers.length > 0) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      );
    }

    // Update user
    await executeQuery(
      'UPDATE users SET username = ?, email = ?, name = ?, mobile = ?, role = ? WHERE id = ?',
      [username, email, name, mobile, role, id]
    );

    // Get the updated user
    const updatedUsers = await executeQuery(
      'SELECT id, username, email, name, mobile, role, createdAt FROM users WHERE id = ?',
      [id]
    ) as any[];

    const updatedUser = updatedUsers[0];

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if user exists
    const existingUser = await executeQuery(
      'SELECT id FROM users WHERE id = ?',
      [id]
    ) as any[];

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user (this will also delete related rentals due to CASCADE)
    await executeQuery('DELETE FROM users WHERE id = ?', [id]);

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