/**
 * OpenLineage Proxy API Handler
 * 
 * This Next.js API route handles incoming OpenLineage events and saves them
 * as individual JSON files for debugging and analysis purposes.
 * 
 * Endpoint: POST /api/v1/lineage
 * 
 * Features:
 * - Receives OpenLineage events via HTTP POST
 * - Generates unique filenames using incremental counter + UUID
 * - Thread-safe file operations using proper-lockfile
 * - Pretty-printed JSON output for easy reading
 * 
 * Usage:
 * Configure your data integration tools (dbt, Spark, Airflow, etc.) to send
 * OpenLineage events to this endpoint:
 * 
 * Environment Variables:
 * OPENLINEAGE_URL=http://localhost:3000
 * OPENLINEAGE_NAMESPACE=dev
 * 
 * Example dbt usage:
 * dbt-ol run
 * 
 * File Output:
 * Files are saved with pattern: {counter}_lineage_data_{uuid}.json
 * Example: 001_lineage_data_a1b2c3d4-e5f6-7890-abcd-ef1234567890.json
 * 
 * @author OpenLineage Proxy
 * @version 1.0.0
 * @since 2024
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// For serverless environments, we'll use timestamp instead of file-based counter
function generateUniqueFilename() {
    const timestamp = Date.now();
    const uniqueId = uuidv4();
    return `${timestamp}_lineage_data_${uniqueId}.json`;
}

/**
 * Next.js API route handler for OpenLineage events
 * Accepts POST requests with OpenLineage event payloads and saves them as JSON files
 * 
 * @param {NextApiRequest} req - The incoming request object
 * @param {NextApiResponse} res - The outgoing response object
 */
export default function handler(req, res) {
    // Only accept POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const data = req.body;

        // Generate a unique filename using timestamp and UUID
        const fileName = generateUniqueFilename();
        
        // In development, save to a local directory
        // In production/serverless, this would need to be adapted for your storage solution
        const filePath = path.join(process.cwd(), 'lineage-events', fileName);
        
        // Ensure directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Write the JSON payload to a file
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        console.log(`OpenLineage event saved to ${fileName}`);
        
        res.status(200).json({ 
            message: 'OpenLineage event saved successfully',
            filename: fileName,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error saving OpenLineage event:', error);
        res.status(500).json({ error: 'Failed to save OpenLineage event' });
    }
}