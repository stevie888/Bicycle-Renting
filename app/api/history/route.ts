import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    // Join rental_history with stations to get station name
    const history = await executeQuery(
      `SELECT rh.*, s.name AS station_name
       FROM rental_history rh
       LEFT JOIN stations s ON rh.station_id = s.id
       WHERE rh.user_id = ?
       ORDER BY rh.rented_at DESC`,
      [userId]
    );
    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
} 