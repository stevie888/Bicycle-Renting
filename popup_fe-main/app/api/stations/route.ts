import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Get all stations with their inventory data
    const stationsQuery = `
      SELECT 
        u.id,
        u.description as station_name,
        u.location,
        u.inventory as total_umbrellas,
        COUNT(CASE WHEN rh.status = 'active' THEN 1 END) as rented_umbrellas,
        (u.inventory - COUNT(CASE WHEN rh.status = 'active' THEN 1 END)) as available_umbrellas
      FROM umbrellas u
      LEFT JOIN rental_history rh ON u.id = rh.umbrella_id AND rh.status = 'active'
      WHERE u.description LIKE 'Station %'
      GROUP BY u.id, u.description, u.location, u.inventory
      ORDER BY u.description
    `;
    
    const stations = await executeQuery(stationsQuery) as any[];
    
    // Transform the data to match the expected format
    const formattedStations = stations.map((station, index) => ({
      id: index + 1, // Use index + 1 as station ID
      name: station.station_name,
      location: station.location,
      distance: `${Math.floor(Math.random() * 20) + 1} km`, // Random distance for demo
      available: station.available_umbrellas || 0,
      occupied: station.rented_umbrellas || 0,
      total: station.total_umbrellas || 0
    }));
    
    return NextResponse.json(formattedStations);
  } catch (error) {
    console.error('Get stations error:', error);
    return NextResponse.json({ error: 'Failed to fetch stations' }, { status: 500 });
  }
} 