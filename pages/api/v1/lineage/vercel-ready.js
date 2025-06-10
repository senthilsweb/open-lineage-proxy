/**
 * OpenLineage Proxy API Handler - Vercel Production Ready
 * 
 * This is the production-ready version for Vercel deployment.
 * Uses structured logging and optional external storage.
 * 
 * Features:
 * - Serverless-compatible (no local file storage)
 * - Structured logging for Vercel logs
 * - Optional database/blob storage
 * - Unique event identification
 * - Error handling and monitoring
 */

/**
 * Generate unique event identifier
 */
function generateEventId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${timestamp}-${random}`;
}

/**
 * Structured logging for Vercel
 */
function logOpenLineageEvent(payload, eventId) {
  const logData = {
    service: 'openlineage-proxy',
    eventId: eventId,
    timestamp: new Date().toISOString(),
    eventType: payload.eventType || 'UNKNOWN',
    jobNamespace: payload.job?.namespace || 'default',
    jobName: payload.job?.name || 'unknown',
    runId: payload.run?.runId,
    producer: payload.producer,
    schemaURL: payload.schemaURL,
    inputCount: payload.inputs?.length || 0,
    outputCount: payload.outputs?.length || 0,
    // Store full payload for debugging
    payload: payload
  };
  
  // This will appear in Vercel function logs
  console.log('OPENLINEAGE_EVENT:', JSON.stringify(logData));
  
  return logData;
}

/**
 * Optional: Store in external database (if configured)
 */
async function storeInDatabase(payload, eventId) {
  // Only attempt if database is configured
  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    return null;
  }
  
  try {
    // Dynamic import to avoid errors if not installed
    const { sql } = await import('@vercel/postgres');
    
    await sql`
      INSERT INTO openlineage_events (
        event_id, event_type, event_time, job_namespace, 
        job_name, run_id, producer, payload, created_at
      ) VALUES (
        ${eventId},
        ${payload.eventType || 'UNKNOWN'},
        ${payload.eventTime || new Date().toISOString()},
        ${payload.job?.namespace || 'default'},
        ${payload.job?.name || 'unknown'},
        ${payload.run?.runId || null},
        ${payload.producer || 'unknown'},
        ${JSON.stringify(payload)},
        NOW()
      )
    `;
    
    return { stored: true, location: 'database' };
  } catch (error) {
    console.error('Database storage failed:', error.message);
    return { stored: false, error: error.message };
  }
}

/**
 * Optional: Store in Vercel Blob (if configured)
 */
async function storeInBlob(payload, eventId) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return null;
  }
  
  try {
    const { put } = await import('@vercel/blob');
    
    const filename = `openlineage_${eventId}.json`;
    const blob = await put(filename, JSON.stringify(payload, null, 2), {
      access: 'private',
      contentType: 'application/json'
    });
    
    return { 
      stored: true, 
      location: 'blob',
      url: blob.url,
      filename: filename 
    };
  } catch (error) {
    console.error('Blob storage failed:', error.message);
    return { stored: false, error: error.message };
  }
}

/**
 * Main API handler
 */
export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are supported' 
    });
  }

  const startTime = Date.now();
  let eventId;

  try {
    const payload = req.body;
    
    // Validate payload
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({
        error: 'Invalid payload',
        message: 'Request body must be valid JSON'
      });
    }
    
    // Generate unique event ID
    eventId = generateEventId();
    
    // Log event (always happens)
    const logData = logOpenLineageEvent(payload, eventId);
    
    // Attempt external storage (optional)
    const storageResults = await Promise.allSettled([
      storeInDatabase(payload, eventId),
      storeInBlob(payload, eventId)
    ]);
    
    const storage = {
      database: storageResults[0].status === 'fulfilled' ? storageResults[0].value : null,
      blob: storageResults[1].status === 'fulfilled' ? storageResults[1].value : null
    };
    
    const processingTime = Date.now() - startTime;
    
    // Success response
    res.status(200).json({
      success: true,
      message: 'OpenLineage event processed successfully',
      eventId: eventId,
      timestamp: new Date().toISOString(),
      processingTimeMs: processingTime,
      storage: storage,
      // Backward compatibility
      filename: `${eventId}_lineage_data.json`
    });
    
  } catch (error) {
    console.error('OpenLineage processing error:', {
      eventId: eventId || 'unknown',
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process OpenLineage event',
      eventId: eventId || null,
      timestamp: new Date().toISOString()
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Increase if you expect large payloads
    },
  },
}
