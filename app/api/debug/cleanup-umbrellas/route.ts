import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// GET - Show current umbrellas
export async function GET(request: NextRequest) {
  try {
    const umbrellas = await executeQuery(
      'SELECT id, description, location, status, inventory FROM umbrellas ORDER BY location, description'
    ) as any[];

    return NextResponse.json({
      success: true,
      umbrellas,
      count: umbrellas.length
    });

  } catch (error) {
    console.error('Cleanup umbrellas error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Keep only Station 1, 2, and 3, remove all others
export async function POST(request: NextRequest) {
  try {
    // First, get all umbrellas
    const umbrellas = await executeQuery(
      'SELECT id, description, location, status, inventory FROM umbrellas ORDER BY location, description'
    ) as any[];

    console.log('Current umbrellas:', umbrellas);

    // Keep only umbrellas with description "Station 1", "Station 2", "Station 3"
    const umbrellasToKeep = umbrellas.filter(umbrella => 
      umbrella.description === 'Station 1' || 
      umbrella.description === 'Station 2' || 
      umbrella.description === 'Station 3'
    );

    const umbrellasToDelete = umbrellas.filter(umbrella => 
      umbrella.description !== 'Station 1' && 
      umbrella.description !== 'Station 2' && 
      umbrella.description !== 'Station 3'
    );

    console.log('Umbrellas to keep:', umbrellasToKeep);
    console.log('Umbrellas to delete:', umbrellasToDelete);

    // Delete all umbrellas except Station 1, 2, 3
    if (umbrellasToDelete.length > 0) {
      const placeholders = umbrellasToDelete.map(() => '?').join(',');
      await executeQuery(
        `DELETE FROM umbrellas WHERE id IN (${placeholders})`,
        umbrellasToDelete.map(u => u.id)
      );
    }

    // Get the cleaned up umbrellas
    const cleanedUmbrellas = await executeQuery(
      'SELECT id, description, location, status, inventory FROM umbrellas ORDER BY description'
    ) as any[];

    return NextResponse.json({
      success: true,
      message: `Removed ${umbrellasToDelete.length} extra umbrellas, kept only Station 1, 2, and 3`,
      deletedCount: umbrellasToDelete.length,
      remainingUmbrellas: cleanedUmbrellas,
      remainingCount: cleanedUmbrellas.length
    });

  } catch (error) {
    console.error('Cleanup umbrellas error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 