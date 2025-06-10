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

export default function handler(req, res) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'openlineage-proxy'
    };

    if (req.method === 'HEAD') {
      return res.status(200).end();
    }

    return res.status(200).json(response);
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}
