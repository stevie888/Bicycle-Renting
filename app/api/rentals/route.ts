import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeTransaction } from '@/lib/database';

interface CreateRentalRequest {
  userId: string;
  umbrellaId: string;
  startTime: string;
  endTime?: string;
}

// GET - Get rentals (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    let query = 'SELECT * FROM rentals';
    const params: any[] = [];

    // Build WHERE clause dynamically
    const conditions = [];
    if (userId) {
      conditions.push('userId = ?');
      params.push(userId);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY createdAt DESC';

    const rentals = await executeQuery(query, params) as any[];

    return NextResponse.json({
      success: true,
      rentals,
      count: rentals.length
    });

  } catch (error) {
    console.error('Get rentals error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new rental
export async function POST(request: NextRequest) {
  try {
    const body: CreateRentalRequest = await request.json();
    const { userId, umbrellaId, startTime, endTime } = body;

    // Validate input
    if (!userId || !umbrellaId || !startTime) {
      return NextResponse.json(
        { error: 'User ID, umbrella ID, and start time are required' },
        { status: 400 }
      );
    }

    // Check if umbrella exists and is available
    const umbrellas = await executeQuery(
      'SELECT * FROM umbrellas WHERE id = ?',
      [umbrellaId]
    ) as any[];

    if (umbrellas.length === 0) {
      return NextResponse.json(
        { error: 'Umbrella not found' },
        { status: 404 }
      );
    }

    const umbrella = umbrellas[0];

    if (umbrella.status !== 'available') {
      return NextResponse.json(
        { error: 'Umbrella is not available for rent' },
        { status: 409 }
      );
    }

    // Check if user already has an active rental
    const activeRentals = await executeQuery(
      'SELECT id FROM rentals WHERE userId = ? AND status = "active"',
      [userId]
    ) as any[];

    if (activeRentals.length > 0) {
      return NextResponse.json(
        { error: 'User already has an active rental' },
        { status: 409 }
      );
    }

    // Calculate total amount (simplified calculation)
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date(start.getTime() + 24 * 60 * 60 * 1000); // Default 24 hours
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const totalAmount = hours * umbrella.hourlyRate;

    // Create rental and update umbrella status in a transaction
    const rentalId = Date.now().toString();
    const rentalEndTime = endTime || end.toISOString();

    await executeTransaction([
      {
        query: 'INSERT INTO rentals (id, userId, umbrellaId, startTime, endTime, totalAmount) VALUES (?, ?, ?, ?, ?, ?)',
        params: [rentalId, userId, umbrellaId, startTime, rentalEndTime, totalAmount]
      },
      {
        query: 'UPDATE umbrellas SET status = "rented" WHERE id = ?',
        params: [umbrellaId]
      }
    ]);

    // Get the created rental
    const newRentals = await executeQuery(
      'SELECT * FROM rentals WHERE id = ?',
      [rentalId]
    ) as any[];

    const newRental = newRentals[0];

    return NextResponse.json({
      success: true,
      rental: newRental,
      message: 'Rental created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create rental error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 