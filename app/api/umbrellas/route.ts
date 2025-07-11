import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

interface Umbrella {
  id: string;
  description: string;
  location: string;
  status: 'available' | 'rented';
}

interface CreateUmbrellaRequest {
  description: string;
  location: string;
  status: 'available' | 'rented';
}

// GET - Get all umbrellas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const location = searchParams.get('location');

    let query = 'SELECT id, description, location, status FROM umbrellas';
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

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const umbrellas = await executeQuery(query, params) as Umbrella[];

    return NextResponse.json({
      success: true,
      umbrellas,
      count: umbrellas.length
    });

  } catch (error) {
    console.error('Get umbrellas error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new umbrella
export async function POST(request: NextRequest) {
  try {
    const body: CreateUmbrellaRequest = await request.json();
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

    // Create new umbrella
    const umbrellaId = Date.now().toString();
    await executeQuery(
      'INSERT INTO umbrellas (id, description, location, status) VALUES (?, ?, ?, ?)',
      [umbrellaId, description, location, status]
    );

    // Get the created umbrella
    const newUmbrellas = await executeQuery(
      'SELECT id, description, location, status FROM umbrellas WHERE id = ?',
      [umbrellaId]
    ) as Umbrella[];

    const newUmbrella = newUmbrellas[0];

    return NextResponse.json({
      success: true,
      umbrella: newUmbrella,
      message: 'Umbrella created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create umbrella error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 