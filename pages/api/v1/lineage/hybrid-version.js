/**
 * OpenLineage Proxy API Handler - Hybrid Version
 * 
 * This version logs events to console (viewable in Vercel logs)
 * and optionally stores to external services for production use.
 * 
 * Development: Logs to console + optional local files
 * Production: Logs to Vercel + external storage
 */

/**
 * Simple counter using timestamp + random for uniqueness
 */
function generateUniqueCounter() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 4);
  return `${timestamp}-${random}`;
}

/**
 * Log event with structured format for easy parsing
 */
function logEvent(eventData, counter, filename) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    counter: counter,
    filename: filename,
    eventType: eventData.eventType,
    jobNamespace: eventData.job?.namespace,
    jobName: eventData.job?.name,
    runId: eventData.run?.runId,
    producer: eventData.producer,
    // Full payload for debugging
    payload: eventData
  };
  
  // Log as structured JSON for easy parsing
  console.log('OPENLINEAGE_EVENT:', JSON.stringify(logEntry, null, 2));
}

/**
 * Optional: Send to external webhook/service
 */
async function sendToExternalService(eventData, filename) {
  const webhookUrl = process.env.OPENLINEAGE_WEBHOOK_URL;
  if (!webhookUrl) return;
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WEBHOOK_TOKEN || ''}`
      },
      body: JSON.stringify({
        filename: filename,
        timestamp: new Date().toISOString(),
        event: eventData
      })
    });
    
    if (!response.ok) {
      console.error('Webhook failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Webhook error:', error);
  }
}

/**
 * Next.js API route handler for OpenLineage events - Hybrid Version
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    
    // Generate unique identifier
    const counter = generateUniqueCounter();
    const filename = `lineage_data_${counter}.json`;
    
    // Log event (visible in Vercel function logs)
    logEvent(payload, counter, filename);
    
    // Optional: Send to external service
    await sendToExternalService(payload, filename);
    
    // In development, try to save locally
    if (process.env.NODE_ENV === 'development') {
      try {
        const fs = require('fs').promises;
        const path = require('path');
        const outputDir = path.join(process.cwd(), 'logs');
        
        // Create logs directory if it doesn't exist
        await fs.mkdir(outputDir, { recursive: true });
        
        const filePath = path.join(outputDir, filename);
        await fs.writeFile(filePath, JSON.stringify(payload, null, 2));
        
        console.log(`Local file saved: ${filePath}`);
      } catch (error) {
        console.log('Local save failed (expected in production):', error.message);
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Event logged successfully`,
      filename: filename,
      counter: counter,
      environment: process.env.NODE_ENV || 'production',
      loggedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error processing event:', error);
    res.status(500).json({ 
      error: 'Failed to process event',
      details: error.message 
    });
  }
}

/* 
Optional Environment Variables:
OPENLINEAGE_WEBHOOK_URL=https://your-webhook-service.com/api/events
WEBHOOK_TOKEN=your_secret_token
*/
