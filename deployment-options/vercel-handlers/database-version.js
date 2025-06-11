/**
 * OpenLineage Proxy API Handler - Database Version
 * 
 * This version stores OpenLineage events in a database instead of files
 * for compatibility with Vercel and other serverless platforms.
 * 
 * Supported databases:
 * - Vercel Postgres
 * - PlanetScale MySQL
 * - Supabase PostgreSQL
 * - MongoDB Atlas
 */

import { sql } from '@vercel/postgres';

/**
 * Create table if not exists (run once)
 */
async function initializeDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS openlineage_events (
        id SERIAL PRIMARY KEY,
        event_id VARCHAR(255) UNIQUE NOT NULL,
        counter INTEGER NOT NULL,
        event_type VARCHAR(50),
        event_time TIMESTAMP,
        job_namespace VARCHAR(255),
        job_name VARCHAR(255),
        run_id VARCHAR(255),
        payload JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create index for better query performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_openlineage_counter ON openlineage_events(counter);
      CREATE INDEX IF NOT EXISTS idx_openlineage_job ON openlineage_events(job_namespace, job_name);
      CREATE INDEX IF NOT EXISTS idx_openlineage_event_time ON openlineage_events(event_time);
    `;
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

/**
 * Get next counter value atomically
 */
async function getNextCounter() {
  try {
    const result = await sql`
      INSERT INTO openlineage_events (event_id, counter, payload) 
      VALUES ('temp', (SELECT COALESCE(MAX(counter), 0) + 1 FROM openlineage_events), '{}')
      RETURNING counter
    `;
    
    // Delete the temp record
    await sql`DELETE FROM openlineage_events WHERE event_id = 'temp'`;
    
    return result.rows[0].counter;
  } catch (error) {
    console.error('Counter error:', error);
    return Date.now(); // Fallback to timestamp
  }
}

/**
 * Next.js API route handler for OpenLineage events - Database Version
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    const eventId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize database on first request
    await initializeDatabase();
    
    // Get next counter
    const counter = await getNextCounter();
    
    // Extract key fields for indexing
    const eventType = payload.eventType || 'UNKNOWN';
    const eventTime = payload.eventTime || new Date().toISOString();
    const jobNamespace = payload.job?.namespace || 'default';
    const jobName = payload.job?.name || 'unknown';
    const runId = payload.run?.runId || 'unknown';
    
    // Store in database
    await sql`
      INSERT INTO openlineage_events (
        event_id, counter, event_type, event_time, 
        job_namespace, job_name, run_id, payload
      ) VALUES (
        ${eventId}, ${counter}, ${eventType}, ${eventTime},
        ${jobNamespace}, ${jobName}, ${runId}, ${JSON.stringify(payload)}
      )
    `;
    
    console.log(`Event ${eventId} saved with counter ${counter}`);
    
    res.status(200).json({
      success: true,
      message: `Event saved successfully`,
      eventId: eventId,
      counter: counter,
      filename: `${String(counter).padStart(3, '0')}_lineage_data_${eventId}.json`
    });
    
  } catch (error) {
    console.error('Error saving event:', error);
    res.status(500).json({ 
      error: 'Failed to save event',
      details: error.message 
    });
  }
}
