/**
 * OpenLineage Proxy API Handler - Vercel Blob Storage Version
 * 
 * This version stores OpenLineage events as files in Vercel Blob Storage
 * or AWS S3 for compatibility with serverless platforms.
 */

import { put } from '@vercel/blob';

/**
 * Get next counter from Vercel KV (Redis-like storage)
 */
async function getNextCounter() {
  try {
    // You can also use Vercel KV for counter management
    const { kv } = await import('@vercel/kv');
    const counter = await kv.incr('openlineage-counter');
    return counter;
  } catch (error) {
    console.error('Counter error:', error);
    // Fallback to timestamp-based counter
    return Date.now();
  }
}

/**
 * Next.js API route handler for OpenLineage events - Blob Storage Version
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    const eventId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Get next counter
    const counter = await getNextCounter();
    const paddedCounter = String(counter).padStart(3, '0');
    
    // Generate filename
    const fileName = `${paddedCounter}_lineage_data_${eventId}.json`;
    
    // Store in Vercel Blob
    const blob = await put(fileName, JSON.stringify(payload, null, 2), {
      access: 'public', // or 'private' based on your needs
      contentType: 'application/json',
    });
    
    console.log(`Event saved to blob: ${blob.url}`);
    
    res.status(200).json({
      success: true,
      message: `Event saved successfully`,
      filename: fileName,
      counter: counter,
      url: blob.url,
      downloadUrl: blob.downloadUrl
    });
    
  } catch (error) {
    console.error('Error saving to blob:', error);
    res.status(500).json({ 
      error: 'Failed to save event',
      details: error.message 
    });
  }
}

/* 
Environment Variables needed in Vercel:
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
KV_REST_API_URL=your_kv_url  
KV_REST_API_TOKEN=your_kv_token
*/
