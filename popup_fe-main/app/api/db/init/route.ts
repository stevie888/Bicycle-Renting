import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, testConnection } from '@/lib/database';

// GET - Test database connection and initialize tables
export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        connected: false,
        message: 'Database connection failed!'
      });
    }
    
    // Initialize database tables
    await initializeDatabase();
    
    return NextResponse.json({
      success: true,
      connected: true,
      message: 'Database connected and initialized successfully!'
    });
    
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json({
      success: false,
      connected: false,
      message: 'Database initialization failed!',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// POST - Initialize database tables
export async function POST(request: NextRequest) {
  try {
    console.log('Initializing database tables...');
    
    // Test connection first
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        connected: false,
        message: 'Database connection failed!'
      });
    }
    
    // Initialize database tables
    await initializeDatabase();
    
    return NextResponse.json({
      success: true,
      connected: true,
      message: 'Database tables initialized successfully!'
    });
    
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json({
      success: false,
      connected: false,
      message: 'Database initialization failed!',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 