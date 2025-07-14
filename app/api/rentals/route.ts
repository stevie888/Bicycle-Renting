import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeTransaction } from '@/lib/database';

interface CreateRentalRequest {
  userId: string;
  umbrellaId: string;
  startTime: string;
  endTime?: string;
}

// Helper to convert JS date string to MySQL DATETIME format
function toMySQLDatetime(dateString: string) {
  const d = new Date(dateString);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

// GET - Get rental history (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    let query = 'SELECT * FROM rental_history';
    const params: any[] = [];

    // Build WHERE clause dynamically
    const conditions = [];
    if (userId) {
      conditions.push('user_id = ?');
      params.push(userId);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY rented_at DESC';

    const rentals = await executeQuery(query, params) as any[];

    return NextResponse.json({
      success: true,
      rentals,
      count: rentals.length
    });

  } catch (error) {
    console.error('Get rental history error:', error);
    return NextResponse.json(
      { error: (error as any).message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new rental history entry
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

    // Check inventory
    if (umbrella.inventory === undefined || umbrella.inventory <= 0) {
      return NextResponse.json(
        { error: 'No umbrellas available for rent at this location' },
        { status: 409 }
      );
    }

    if (umbrella.status !== 'available') {
      return NextResponse.json(
        { error: 'Umbrella is not available for rent' },
        { status: 409 }
      );
    }

    // Check if user already has an active rental
    const activeRentals = await executeQuery(
      'SELECT id FROM rental_history WHERE user_id = ? AND status = "active"',
      [userId]
    ) as any[];

    if (activeRentals.length > 0) {
      return NextResponse.json(
        { error: 'User already has an active rental' },
        { status: 409 }
      );
    }

    // Insert into rental_history and update inventory/status
    const rentalId = null; // auto_increment
    const rentedAt = toMySQLDatetime(startTime);
    const returnedAt = endTime ? toMySQLDatetime(endTime) : null;
    const statusValue = 'active';

    // Calculate new inventory and status
    const newInventory = umbrella.inventory - 1;
    const newStatus = newInventory === 0 ? 'out_of_stock' : 'available';

    await executeTransaction([
      {
        query: 'INSERT INTO rental_history (user_id, umbrella_id, station_id, rented_at, returned_at, status) VALUES (?, ?, ?, ?, ?, ?)',
        params: [userId, umbrellaId, null, rentedAt, returnedAt, statusValue]
      },
      {
        query: 'UPDATE umbrellas SET inventory = ?, status = ? WHERE id = ?',
        params: [newInventory, newStatus, umbrellaId]
      }
    ]);

    // Get the created rental
    const newRentals = await executeQuery(
      'SELECT * FROM rental_history WHERE user_id = ? AND umbrella_id = ? AND rented_at = ?',
      [userId, umbrellaId, rentedAt]
    ) as any[];

    const newRental = newRentals[0];

    return NextResponse.json({
      success: true,
      rental: newRental,
      message: 'Rental created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create rental history error:', error);
    return NextResponse.json(
      { error: (error as any).message || 'Internal server error' },
      { status: 500 }
    );
  }
} 