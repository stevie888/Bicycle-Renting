import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// GET - Get admin dashboard statistics
export async function GET(request: NextRequest) {
  try {
    console.log('Dashboard API called - fetching statistics...');
    
    // Get user statistics
    const userStats = await executeQuery(`
      SELECT 
        COUNT(*) as totalUsers,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as adminUsers,
        SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as regularUsers
      FROM users
    `) as any[];
    
    console.log('User stats:', userStats);

    // Get umbrella statistics
    const umbrellaStats = await executeQuery(`
      SELECT 
        COUNT(*) as totalUmbrellas,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as availableUmbrellas,
        SUM(CASE WHEN status = 'out_of_stock' THEN 1 ELSE 0 END) as outOfStockUmbrellas
      FROM umbrellas
    `) as any[];
    
    console.log('Umbrella stats:', umbrellaStats);

    // Get rental statistics
    const rentalStats = await executeQuery(`
      SELECT 
        COUNT(*) as totalRentals,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeRentals,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedRentals,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelledRentals
      FROM rental_history
    `) as any[];
    
    console.log('Rental stats:', rentalStats);

    // Get recent activities
    const recentUsers = await executeQuery(`
      SELECT id, username, email, name, role, createdAt 
      FROM users 
      ORDER BY createdAt DESC 
      LIMIT 5
    `) as any[];

    const recentUmbrellas = await executeQuery(`
      SELECT id, description, location, status 
      FROM umbrellas 
      ORDER BY id DESC 
      LIMIT 5
    `) as any[];

    const recentRentals = await executeQuery(`
      SELECT rh.id, rh.status, rh.rented_at as createdAt, rh.user_name as username, um.description
      FROM rental_history rh
      JOIN umbrellas um ON rh.umbrella_id = um.id
      ORDER BY rh.rented_at DESC 
      LIMIT 5
    `) as any[];

    const response = {
      success: true,
      stats: {
        users: userStats[0],
        umbrellas: umbrellaStats[0],
        rentals: rentalStats[0]
      },
      recent: {
        users: recentUsers,
        umbrellas: recentUmbrellas,
        rentals: recentRentals
      }
    };
    
    console.log('Dashboard API response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Dashboard stats error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Dashboard API error',
        details: errorMessage
      },
      { status: 500 }
    );
  }
} 