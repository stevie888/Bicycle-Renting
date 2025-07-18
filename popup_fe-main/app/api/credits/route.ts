import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// GET - Get user's credit balance
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
      'SELECT credits, total_rentals FROM users WHERE id = ?',
      [userId]
    ) as any[];

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];

    return NextResponse.json({
      success: true,
      credits: user.credits,
      totalRentals: user.total_rentals
    });

  } catch (error) {
    console.error('Get credits error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add/remove credits (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, credits, action, reason } = body;

    // Validate input
    if (!userId || !credits || !action) {
      return NextResponse.json(
        { error: 'User ID, credits, and action are required' },
        { status: 400 }
      );
    }

    if (action !== 'add' && action !== 'remove') {
      return NextResponse.json(
        { error: 'Action must be "add" or "remove"' },
        { status: 400 }
      );
    }

    if (credits <= 0) {
      return NextResponse.json(
        { error: 'Credits must be greater than 0' },
        { status: 400 }
      );
    }

    // Check if user exists
    const users = await executeQuery(
      'SELECT credits FROM users WHERE id = ?',
      [userId]
    ) as any[];

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const currentCredits = users[0].credits;
    let newCredits: number;

    if (action === 'add') {
      newCredits = currentCredits + credits;
    } else {
      // Check if user has enough credits to remove
      if (currentCredits < credits) {
        return NextResponse.json(
          { error: `User only has ${currentCredits} credits, cannot remove ${credits} credits` },
          { status: 400 }
        );
      }
      newCredits = currentCredits - credits;
    }

    // Update user credits
    await executeQuery(
      'UPDATE users SET credits = ? WHERE id = ?',
      [newCredits, userId]
    );

    // Log the credit transaction (optional - you could create a credits_log table)
    console.log(`Credit ${action}: User ${userId}, Amount: ${credits}, Reason: ${reason || 'No reason provided'}`);

    return NextResponse.json({
      success: true,
      message: `${credits} credits ${action}ed successfully`,
      newBalance: newCredits,
      action,
      reason
    });

  } catch (error) {
    console.error('Update credits error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 