import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const stations = await executeQuery('SELECT id, name FROM stations');
    return NextResponse.json(stations);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stations' }, { status: 500 });
  }
} 