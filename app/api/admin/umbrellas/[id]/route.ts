import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// PUT - Update umbrella (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { description, location, status } = body;

    // Validate input
    if (!description || !location || !status) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    if (status !== 'available' && status !== 'rented') {
      return NextResponse.json(
        { error: 'Status must be available or rented' },
        { status: 400 }
      );
    }

    // Check if umbrella exists
    const existingUmbrella = await executeQuery(
      'SELECT id FROM umbrellas WHERE id = ?',
      [id]
    ) as any[];

    if (existingUmbrella.length === 0) {
      return NextResponse.json(
        { error: 'Umbrella not found' },
        { status: 404 }
      );
    }

    // Update umbrella
    await executeQuery(
      'UPDATE umbrellas SET description = ?, location = ?, status = ? WHERE id = ?',
      [description, location, status, id]
    );

    // Get the updated umbrella
    const updatedUmbrellas = await executeQuery(
      'SELECT id, description, location, status FROM umbrellas WHERE id = ?',
      [id]
    ) as any[];

    const updatedUmbrella = updatedUmbrellas[0];

    return NextResponse.json({
      success: true,
      umbrella: updatedUmbrella,
      message: 'Umbrella updated successfully'
    });

  } catch (error) {
    console.error('Update umbrella error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete umbrella (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if umbrella exists
    const existingUmbrella = await executeQuery(
      'SELECT id FROM umbrellas WHERE id = ?',
      [id]
    ) as any[];

    if (existingUmbrella.length === 0) {
      return NextResponse.json(
        { error: 'Umbrella not found' },
        { status: 404 }
      );
    }

    // Check if umbrella is currently rented
    const activeRentals = await executeQuery(
      'SELECT id FROM rentals WHERE umbrellaId = ? AND status = "active"',
      [id]
    ) as any[];

    if (activeRentals.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete umbrella that is currently rented' },
        { status: 400 }
      );
    }

    // Delete umbrella (this will also delete related rentals due to CASCADE)
    await executeQuery('DELETE FROM umbrellas WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Umbrella deleted successfully'
    });

  } catch (error) {
    console.error('Delete umbrella error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 