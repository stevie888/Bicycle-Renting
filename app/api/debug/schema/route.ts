import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Check users table structure
    const userTableInfo = await executeQuery(
      'DESCRIBE users',
      []
    ) as any[];

    // Check if role column exists and its type
    const roleColumn = userTableInfo.find(col => col.Field === 'role');

    return NextResponse.json({
      success: true,
      userTableStructure: userTableInfo,
      roleColumn: roleColumn,
      message: 'Debug: Database schema information'
    });

  } catch (error) {
    console.error('Schema debug error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 