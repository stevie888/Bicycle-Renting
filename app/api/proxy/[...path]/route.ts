import { NextRequest, NextResponse } from 'next/server';

const EXTERNAL_API_BASE_URL = 'http://13.204.148.32/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams.path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams.path, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams.path, 'PATCH');
}

async function handleRequest(
  request: NextRequest,
  path: string[],
  method: string
) {
  try {
    // Reconstruct the path
    const apiPath = `/${path.join('/')}`;
    const url = new URL(request.url);
    const queryString = url.search;
    const fullPath = `${EXTERNAL_API_BASE_URL}${apiPath}${queryString}`;
    
    console.log(`🔄 Proxying ${method} request to: ${fullPath}`);

    // Get request body for POST/PUT/PATCH requests
    let body = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        body = await request.text();
      } catch (error) {
        console.log('No body to read');
      }
    }

    // Forward headers (exclude host and other problematic headers)
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    // Make the request to external API
    const response = await fetch(fullPath, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers,
      },
      body: body || undefined,
    });

    console.log(`✅ External API responded with status: ${response.status}`);

    // Get response data
    const responseData = await response.text();
    let jsonData;
    
    try {
      jsonData = JSON.parse(responseData);
    } catch (error) {
      // If not JSON, return as text
      return new NextResponse(responseData, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': response.headers.get('content-type') || 'text/plain',
        },
      });
    }

    // Return JSON response
    return NextResponse.json(jsonData, {
      status: response.status,
      statusText: response.statusText,
    });

  } catch (error) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { 
        error: 'Proxy request failed', 
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      },
      { status: 500 }
    );
  }
}