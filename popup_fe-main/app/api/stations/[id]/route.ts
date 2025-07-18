import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// GET - Get station inventory data by station ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stationId = params.id;
    
    // Get station data and inventory
    const stationQuery = `
      SELECT 
        u.id,
        u.description as station_name,
        u.location,
        u.inventory as total_umbrellas,
        COUNT(CASE WHEN rh.status = 'active' THEN 1 END) as rented_umbrellas,
        (u.inventory - COUNT(CASE WHEN rh.status = 'active' THEN 1 END)) as available_umbrellas
      FROM umbrellas u
      LEFT JOIN rental_history rh ON u.id = rh.umbrella_id AND rh.status = 'active'
      WHERE u.description = ?
      GROUP BY u.id, u.description, u.location, u.inventory
    `;
    
    const stations = await executeQuery(stationQuery, [`Station ${stationId}`]) as any[];
    
    if (stations.length === 0) {
      return NextResponse.json(
        { error: 'Station not found' },
        { status: 404 }
      );
    }
    
    const station = stations[0];
    
    return NextResponse.json({
      success: true,
      station: {
        id: station.id,
        name: station.station_name,
        location: station.location,
        totalUmbrellas: station.total_umbrellas || 0,
        rentedUmbrellas: station.rented_umbrellas || 0,
        availableUmbrellas: station.available_umbrellas || 0
      }
    });

  } catch (error) {
    console.error('Get station inventory error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 