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

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const lockfile = require('proper-lockfile');

const app = express();
const port = 3000;

// Counter file path
const counterFilePath = path.join(__dirname, 'counter.txt');

// Initialize counter file if it doesn't exist
if (!fs.existsSync(counterFilePath)) {
    fs.writeFileSync(counterFilePath, '0');
}

/**
 * Safely increments the counter file using file locking to prevent race conditions
 * @param {Function} callback - Callback function to execute with the updated counter value
 */
function incrementCounter(callback) {
    lockfile.lock(counterFilePath, { realpath: false }).then((release) => {
        let currentCount = parseInt(fs.readFileSync(counterFilePath, { encoding: 'utf8' }), 10);
        currentCount += 1;
        fs.writeFileSync(counterFilePath, currentCount.toString(), { encoding: 'utf8' });

        // Call the callback function with the updated count
        callback(currentCount);

        // Release the lock
        release();
    }).catch(err => {
        console.error('Error acquiring lock:', err);
    });
}

/**
 * Next.js API route handler for OpenLineage events
 * Accepts POST requests with OpenLineage event payloads and saves them as JSON files
 * 
 * @param {NextApiRequest} req - The incoming request object
 * @param {NextApiResponse} res - The outgoing response object
 */
export default function handler(req, res) {
    const data = req.body;

    // Generate a unique filename using UUID
    const uniqueId = uuidv4();

    // Increment the counter safely
    incrementCounter((counter) => {
        const paddedCounter = String(counter).padStart(3, '0'); // Pads the counter with leading zeros
        const fileName = `${paddedCounter}_lineage_data_${uniqueId}.json`;
        const filePath = path.join(__dirname, fileName);

        // Write the JSON payload to a file with a unique counter and UUID in the filename
        fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
            if (err) {
                console.error('Error writing to file:', err);
                return res.status(500).send('Error writing to file');
            }

            console.log(`Payload saved to ${fileName}`);
            res.send(`Payload saved successfully to ${fileName}`);
        });
    });
}