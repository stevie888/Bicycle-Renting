import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

interface Umbrella {
  id: string;
  description: string;
  location: string;
  status: 'available' | 'rented';
  inventory?: number;
  created_at?: string;
  updated_at?: string;
}

interface CreateUmbrellaRequest {
  quantity: number;
  location: string;
  status: 'available' | 'rented';
}

// GET - Get all umbrellas with admin features
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const location = searchParams.get('location');
    const search = searchParams.get('search');

    let query = 'SELECT id, description, location, status, inventory, created_at, updated_at FROM umbrellas';
    const params: any[] = [];

    // Build WHERE clause dynamically
    const conditions = [];
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (location) {
      conditions.push('location LIKE ?');
      params.push(`%${location}%`);
    }
    if (search) {
      conditions.push('(description LIKE ? OR location LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY id DESC';

    const umbrellas = await executeQuery(query, params) as Umbrella[];

    // Get statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'rented' THEN 1 ELSE 0 END) as rented
      FROM umbrellas
    `;
    const stats = await executeQuery(statsQuery) as any[];

    return NextResponse.json({
      success: true,
      umbrellas,
      count: umbrellas.length,
      stats: stats[0]
    });

  } catch (error) {
    console.error('Get umbrellas error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new umbrella (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, quantity, location, status } = body;

    // Validate input
    if (!description || !quantity || !location || !status) {
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

    // Check if an umbrella already exists at this station
    const existingUmbrella = await executeQuery(
      'SELECT id, inventory FROM umbrellas WHERE description = ? AND location = ?',
      [description, location]
    ) as any[];

    let umbrellaId: string;
    let message: string;

    if (existingUmbrella.length > 0) {
      // Update existing umbrella inventory
      const existing = existingUmbrella[0];
      const newInventory = existing.inventory + quantity;
      
      await executeQuery(
        'UPDATE umbrellas SET inventory = ?, status = ? WHERE id = ?',
        [newInventory, status, existing.id]
      );

      umbrellaId = existing.id;
      message = `Inventory updated successfully! Added ${quantity} umbrellas to ${description}. Total inventory: ${newInventory}`;
    } else {
      // Create new umbrella
      umbrellaId = Date.now().toString();
      await executeQuery(
        'INSERT INTO umbrellas (id, description, inventory, location, status) VALUES (?, ?, ?, ?, ?)',
        [umbrellaId, description, quantity, location, status]
      );

      message = `Umbrella created successfully! Added ${quantity} umbrellas to ${description} at ${location}`;
    }

    // Get the updated/created umbrella
    const newUmbrellas = await executeQuery(
      'SELECT id, description, inventory, location, status, created_at, updated_at FROM umbrellas WHERE id = ?',
      [umbrellaId]
    ) as any[];

    const newUmbrella = newUmbrellas[0];

    return NextResponse.json({
      success: true,
      umbrella: newUmbrella,
      message: message
    }, { status: 201 });

  } catch (error) {
    console.error('Create umbrella error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 