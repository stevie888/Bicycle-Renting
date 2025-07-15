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
        SUM(CASE WHEN status = 'rented' THEN 1 ELSE 0 END) as rentedUmbrellas
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
      FROM rentals
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
      SELECT r.id, r.status, r.createdAt, u.username, um.description
      FROM rentals r
      JOIN users u ON r.userId = u.id
      JOIN umbrellas um ON r.umbrellaId = um.id
      ORDER BY r.createdAt DESC 
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
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 