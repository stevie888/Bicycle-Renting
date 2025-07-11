import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: {
        login: '/api/auth/login',
        signup: '/api/auth/signup'
      },
      users: {
        profile: '/api/users/profile'
      },
      umbrellas: '/api/umbrellas',
      rentals: '/api/rentals'
    }
  });
} 