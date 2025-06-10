/**
 * OpenLineage Proxy Health Check Endpoint
 * 
 * Simple health check endpoint for monitoring and load balancer health checks.
 * 
 * Endpoint: GET /api/health
 * 
 * @author OpenLineage Proxy
 * @version 1.0.0
 * @since 2024
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'openlineage-proxy'
    }, 
    { status: 200 }
  );
}

export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { status: 200 });
}
