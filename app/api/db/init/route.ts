import { NextResponse } from 'next/server';
import { initializeDatabase, testConnection } from '@/lib/database';

export async function POST() {
  try {
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database connection failed. Please check your MySQL configuration.' },
        { status: 500 }
      );
    }

    // Initialize database tables
    await initializeDatabase();

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully!',
      tables: ['users', 'umbrellas', 'rentals']
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Database initialization failed. Please check your MySQL setup.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const isConnected = await testConnection();
    
    return NextResponse.json({
      success: true,
      connected: isConnected,
      message: isConnected ? 'Database is connected!' : 'Database connection failed!'
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { error: 'Database test failed' },
      { status: 500 }
    );
  }
} 