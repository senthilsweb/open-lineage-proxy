/**
 * OpenLineage Proxy API Status Endpoint
 * 
 * Returns the current status and statistics of the OpenLineage proxy server.
 * 
 * Endpoint: GET /api/status
 * 
 * @author OpenLineage Proxy
 * @version 1.0.0
 * @since 2024
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const lineageDir = path.join(process.cwd(), 'pages', 'api', 'v1', 'lineage');
    const counterFilePath = path.join(lineageDir, 'counter.txt');

    // Read current counter value
    let currentCounter = 0;
    if (fs.existsSync(counterFilePath)) {
      const counterContent = fs.readFileSync(counterFilePath, { encoding: 'utf8' });
      currentCounter = parseInt(counterContent, 10) || 0;
    }

    // Count JSON files in the lineage directory
    let fileCount = 0;
    if (fs.existsSync(lineageDir)) {
      const files = fs.readdirSync(lineageDir);
      fileCount = files.filter(file => file.endsWith('.json')).length;
    }

    const status = {
      status: 'healthy',
      message: 'OpenLineage Proxy API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      endpoints: {
        lineage: '/api/v1/lineage',
        status: '/api/status'
      },
      statistics: {
        totalEventsReceived: currentCounter,
        filesStored: fileCount,
        storageLocation: lineageDir
      },
      configuration: {
        supportedMethods: ['POST'],
        expectedContentType: 'application/json'
      }
    };

    return NextResponse.json(status, { status: 200 });
  } catch (error) {
    const errorStatus = {
      status: 'error',
      message: 'Failed to retrieve API status',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };

    return NextResponse.json(errorStatus, { status: 500 });
  }
}

export async function HEAD(request: NextRequest) {
  // Health check endpoint - just return 200 OK
  return new NextResponse(null, { status: 200 });
}
