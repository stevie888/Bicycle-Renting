import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

interface UpdateProfileRequest {
  name?: string;
  email?: string;
  mobile?: string;
  profileImage?: string;
  password?: string;
  oldPassword?: string;
}

// GET - Get user profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const users = await executeQuery(
      'SELECT id, username, email, name, mobile, profileImage, role, credits, total_rentals, createdAt FROM users WHERE id = ?',
      [userId]
    ) as any[];

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Return user data (password is already excluded from query)
    const userData = user;
    
    return NextResponse.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const body: UpdateProfileRequest = await request.json();
    const { name, email, mobile, profileImage, password, oldPassword } = body;

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

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (mobile !== undefined) {
      updateFields.push('mobile = ?');
      updateValues.push(mobile);
    }
    if (profileImage !== undefined) {
      updateFields.push('profileImage = ?');
      updateValues.push(profileImage);
    }

    // Password change logic
    if (password !== undefined) {
      // Check old password
      const userRows = await executeQuery(
        'SELECT password FROM users WHERE id = ?',
        [userId]
      ) as any[];
      if (userRows.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      if (!oldPassword || userRows[0].password !== oldPassword) {
        return NextResponse.json(
          { error: 'Old password incorrect' },
          { status: 401 }
        );
      }
      updateFields.push('password = ?');
      updateValues.push(password);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Add userId to the end for WHERE clause
    updateValues.push(userId);

    // Update user
    await executeQuery(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Get updated user
    const updatedUsers = await executeQuery(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    ) as any[];

    const updatedUser = updatedUsers[0];

    // Return updated user data (without password)
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 