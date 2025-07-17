import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeTransaction } from '@/lib/database';

// POST - Auto-update expired rentals
export async function POST(request: NextRequest) {
  try {
    // Find all active rentals that have passed their return deadline
    const expiredRentals = await executeQuery(`
      SELECT rh.*, u.inventory as umbrella_inventory, u.status as umbrella_status
      FROM rental_history rh
      JOIN umbrellas u ON rh.umbrella_id = u.id
      WHERE rh.status = 'active' 
      AND rh.returned_at IS NOT NULL 
      AND rh.returned_at < NOW()
    `) as any[];

    if (expiredRentals.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired rentals found',
        updatedCount: 0
      });
    }

    // Update each expired rental
    const updateQueries = [];
    
    for (const rental of expiredRentals) {
      const newInventory = rental.umbrella_inventory + 1;
      const newStatus = newInventory > 0 ? 'available' : 'out_of_stock';
      
      updateQueries.push(
        {
          query: 'UPDATE rental_history SET status = ? WHERE id = ?',
          params: ['completed', rental.id]
        },
        {
          query: 'UPDATE umbrellas SET inventory = ?, status = ? WHERE id = ?',
          params: [newInventory, newStatus, rental.umbrella_id]
        }
      );
    }

    // Execute all updates in a transaction
    await executeTransaction(updateQueries);

    return NextResponse.json({
      success: true,
      message: `${expiredRentals.length} expired rentals updated to completed`,
      updatedCount: expiredRentals.length,
      updatedRentals: expiredRentals.map(r => ({ id: r.id, umbrella_id: r.umbrella_id }))
    });

  } catch (error) {
    console.error('Auto-update expired rentals error:', error);
    return NextResponse.json(
      { error: (error as any).message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Check for expired rentals
export async function GET(request: NextRequest) {
  try {
    const expiredRentals = await executeQuery(`
      SELECT rh.id, rh.user_name, rh.rented_at, rh.returned_at, 
             u.description as umbrella_description, u.location
      FROM rental_history rh
      JOIN umbrellas u ON rh.umbrella_id = u.id
      WHERE rh.status = 'active' 
      AND rh.returned_at IS NOT NULL 
      AND rh.returned_at < NOW()
      ORDER BY rh.returned_at ASC
    `) as any[];

    return NextResponse.json({
      success: true,
      expiredRentals,
      count: expiredRentals.length
    });

  } catch (error) {
    console.error('Check expired rentals error:', error);
    return NextResponse.json(
      { error: (error as any).message || 'Internal server error' },
      { status: 500 }
    );
  }
} 