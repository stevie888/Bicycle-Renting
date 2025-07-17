import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeTransaction } from '@/lib/database';

// PATCH - Mark rental as returned
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rentalId = params.id;

    // Get the rental details
    const rentals = await executeQuery(
      'SELECT * FROM rental_history WHERE id = ?',
      [rentalId]
    ) as any[];

    if (rentals.length === 0) {
      return NextResponse.json(
        { error: 'Rental not found' },
        { status: 404 }
      );
    }

    const rental = rentals[0];

    // Check if rental is already completed
    if (rental.status === 'completed') {
      return NextResponse.json(
        { error: 'Rental is already completed' },
        { status: 400 }
      );
    }

    // Get umbrella details
    const umbrellas = await executeQuery(
      'SELECT * FROM umbrellas WHERE id = ?',
      [rental.umbrella_id]
    ) as any[];

    if (umbrellas.length === 0) {
      return NextResponse.json(
        { error: 'Umbrella not found' },
        { status: 404 }
      );
    }

    const umbrella = umbrellas[0];

    // Calculate new inventory and status
    const newInventory = umbrella.inventory + 1;
    const newStatus = newInventory > 0 ? 'available' : 'out_of_stock';

    // Update rental and umbrella inventory
    await executeTransaction([
      {
        query: 'UPDATE rental_history SET status = ?, returned_at = NOW() WHERE id = ?',
        params: ['completed', rentalId]
      },
      {
        query: 'UPDATE umbrellas SET inventory = ?, status = ? WHERE id = ?',
        params: [newInventory, newStatus, rental.umbrella_id]
      }
    ]);

    // Get the updated rental
    const updatedRentals = await executeQuery(
      'SELECT * FROM rental_history WHERE id = ?',
      [rentalId]
    ) as any[];

    return NextResponse.json({
      success: true,
      rental: updatedRentals[0],
      message: 'Umbrella returned successfully'
    });

  } catch (error) {
    console.error('Return rental error:', error);
    return NextResponse.json(
      { error: (error as any).message || 'Internal server error' },
      { status: 500 }
    );
  }
} 