import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// POST - Reset umbrellas to exactly 3 stations
export async function POST(request: NextRequest) {
  try {
    // Delete all existing umbrellas
    await executeQuery('DELETE FROM umbrellas');
    
    // Insert exactly 3 stations
    const stations = [
      {
        id: 'station-1',
        description: 'Station 1',
        location: 'Kathmandu',
        status: 'available',
        inventory: 5
      },
      {
        id: 'station-2', 
        description: 'Station 2',
        location: 'Lalitpur',
        status: 'available',
        inventory: 3
      },
      {
        id: 'station-3',
        description: 'Station 3', 
        location: 'Bhaktapur',
        status: 'available',
        inventory: 4
      }
    ];

    for (const station of stations) {
      await executeQuery(
        'INSERT INTO umbrellas (id, description, location, status, inventory) VALUES (?, ?, ?, ?, ?)',
        [station.id, station.description, station.location, station.status, station.inventory]
      );
    }

    // Get the new umbrellas
    const newUmbrellas = await executeQuery(
      'SELECT id, description, location, status, inventory FROM umbrellas ORDER BY description'
    ) as any[];

    return NextResponse.json({
      success: true,
      message: 'Reset to exactly 3 stations: Station 1, 2, and 3',
      umbrellas: newUmbrellas,
      count: newUmbrellas.length
    });

  } catch (error) {
    console.error('Reset umbrellas error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 