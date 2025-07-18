import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    // Join rental_history with umbrellas to get umbrella details
    const history = await executeQuery(
      `SELECT 
        rh.*,
        u.description AS umbrella_description,
        u.location AS umbrella_location,
        u.status AS umbrella_status
       FROM rental_history rh
       LEFT JOIN umbrellas u ON rh.umbrella_id = u.id
       WHERE rh.user_id = ?
       ORDER BY rh.rented_at DESC`,
      [userId]
    );
    return NextResponse.json({ history });
  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
} 