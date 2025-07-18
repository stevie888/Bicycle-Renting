import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeTransaction } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const connection = await executeQuery('SELECT 1'); // Test connection
    
    // Step 1: Add user_name column
    await executeQuery(`
      ALTER TABLE rental_history 
      ADD COLUMN user_name VARCHAR(255) AFTER user_id
    `);

    // Step 2: Update existing records with user names
    await executeQuery(`
      UPDATE rental_history rh
      JOIN users u ON rh.user_id = u.id
      SET rh.user_name = u.name
    `);

    // Step 3: Remove station_id column
    await executeQuery(`
      ALTER TABLE rental_history 
      DROP COLUMN station_id
    `);

    // Step 4: Make user_name NOT NULL after populating it
    await executeQuery(`
      ALTER TABLE rental_history 
      MODIFY COLUMN user_name VARCHAR(255) NOT NULL
    `);

    return NextResponse.json({
      success: true,
      message: 'Rental history table updated successfully! Added user_name column and removed station_id column.'
    });

  } catch (error) {
    console.error('Update rental history error:', error);
    return NextResponse.json(
      { error: (error as any).message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check current table structure
    const structure = await executeQuery(`
      DESCRIBE rental_history
    `);

    // Get sample data
    const sampleData = await executeQuery(`
      SELECT id, user_id, user_name, umbrella_id, rented_at, returned_at, status, credits_used
      FROM rental_history 
      LIMIT 5
    `);

    return NextResponse.json({
      success: true,
      structure,
      sampleData
    });

  } catch (error) {
    console.error('Get rental history structure error:', error);
    return NextResponse.json(
      { error: (error as any).message || 'Internal server error' },
      { status: 500 }
    );
  }
} 