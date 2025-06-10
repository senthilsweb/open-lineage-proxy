# OpenLineage Proxy Server

A Next.js-based OpenLineage proxy server that receives and stores OpenLineage events as individual JSON files for debugging and analysis purposes.

## Overview

This project serves as a debugging proxy for OpenLineage events emitted by various data integration and transformation tools such as:
- **dbt** (Data Build Tool)
- **Apache Spark**
- **Apache Airflow**
- Any other tool that supports OpenLineage standard

The proxy captures incoming OpenLineage events and saves them as uniquely named JSON files with incremental counters for easy tracking and debugging.

## Features

- ✅ **REST API Endpoint**: `/api/v1/lineage` for receiving OpenLineage events
- ✅ **File-based Storage**: Saves each event as a separate JSON file
- ✅ **Unique File Naming**: Uses incremental counter + UUID for unique filenames
- ✅ **Thread-safe Operations**: Uses file locking for concurrent request handling
- ✅ **Pretty-printed JSON**: Formatted JSON output for easy reading
- ✅ **Error Handling**: Comprehensive error handling and logging

## Installation

1. **Clone the repository**:
   ```bash
   https://github.com/senthilsweb/open-lineage-proxy.git
   cd open-lineage-proxy
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3000`

4. **Access the API Documentation**:
   Visit `http://localhost:3000` in your browser to see the interactive API documentation and test the endpoints.

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory (optional):

```env
PORT=3000
NODE_ENV=development
```

### For Data Integration Tools

Configure your data integration tools to send OpenLineage events to this proxy:

```env
OPENLINEAGE_URL=http://localhost:3000
OPENLINEAGE_NAMESPACE=dev
```

## API Endpoints

### POST /api/v1/lineage

Receives OpenLineage events and saves them as JSON files.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
Any valid OpenLineage event JSON payload.

**Response:**
```
200 OK
"Payload saved successfully to {filename}"
```

**Error Responses:**
```
500 Internal Server Error
"Error writing to file"
```

### GET /api/status

Returns the current status and statistics of the API server.

**Response:**
```json
{
  "status": "healthy",
  "message": "OpenLineage Proxy API is running",
  "timestamp": "2024-01-20T10:00:00.000Z",
  "version": "1.0.0",
  "endpoints": {
    "lineage": "/api/v1/lineage",
    "status": "/api/status"
  },
  "statistics": {
    "totalEventsReceived": 42,
    "filesStored": 42,
    "storageLocation": "/path/to/storage"
  }
}
```

## Usage Examples

### 1. dbt with OpenLineage

Configure dbt to emit OpenLineage events:

```bash
# Install dbt with OpenLineage support
pip install dbt-openlineage

# Set environment variables
export OPENLINEAGE_URL=http://localhost:3000
export OPENLINEAGE_NAMESPACE=dev

# Run dbt with OpenLineage
dbt-ol run
```

### 2. Apache Spark with OpenLineage

Add to your Spark configuration:

```bash
spark-submit \
  --packages io.openlineage:openlineage-spark:0.21.1 \
  --conf spark.extraListeners=io.openlineage.spark.agent.OpenLineageSparkListener \
  --conf spark.openlineage.transport.type=http \
  --conf spark.openlineage.transport.url=http://localhost:3000 \
  --conf spark.openlineage.namespace=dev \
  your_spark_job.py
```

### 3. Apache Airflow with OpenLineage

Configure in `airflow.cfg`:

```ini
[openlineage]
transport = {"type": "http", "url": "http://localhost:3000", "endpoint": "/api/v1/lineage"}
namespace = dev
```

### 4. Manual Testing with cURL

```bash
curl -X POST http://localhost:3000/api/v1/lineage \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "START",
    "eventTime": "2024-01-20T10:00:00.000Z",
    "run": {
      "runId": "12345678-1234-1234-1234-123456789012"
    },
    "job": {
      "namespace": "dev",
      "name": "test_job"
    },
    "inputs": [],
    "outputs": []
  }'
```

## File Output

The proxy saves each OpenLineage event as a JSON file with the following naming convention:

```
{counter}_lineage_data_{uuid}.json
```

**Example filenames:**
- `001_lineage_data_a1b2c3d4-e5f6-7890-abcd-ef1234567890.json`
- `002_lineage_data_b2c3d4e5-f6g7-8901-bcde-f12345678901.json`

**File location:** Same directory as the API handler (`/pages/api/v1/lineage/`)

**File content example:**
```json
{
  "eventType": "START",
  "eventTime": "2024-01-20T10:00:00.000Z",
  "run": {
    "runId": "12345678-1234-1234-1234-123456789012"
  },
  "job": {
    "namespace": "dev",
    "name": "example_job"
  },
  "inputs": [
    {
      "namespace": "dev",
      "name": "input_table",
      "facets": {}
    }
  ],
  "outputs": [
    {
      "namespace": "dev", 
      "name": "output_table",
      "facets": {}
    }
  ]
}
```

## Project Structure

```
open-lineage-proxy/
├── app/
│   ├── page.tsx                      # Interactive API documentation homepage
│   └── api/
│       └── status/
│           └── route.ts              # API status endpoint
├── pages/
│   └── api/
│       └── v1/
│           └── lineage/
│               ├── index.js          # Main OpenLineage API handler
│               ├── counter.txt       # Auto-generated counter file
│               └── *.json            # Generated lineage event files
├── examples/
│   ├── sample-openlineage-event.json # Sample OpenLineage event
│   └── test-proxy.sh                 # Test script
├── package.json
├── next.config.mjs
└── README.md
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Dependencies

**Core Dependencies:**
- `next` - Next.js framework
- `express` - Web framework (used internally)
- `uuid` - UUID generation for unique filenames
- `proper-lockfile` - File locking for thread safety
- `body-parser` - Parse incoming request bodies

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process using port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **File permission errors**
   ```bash
   # Ensure write permissions
   chmod 755 pages/api/v1/lineage/
   ```

3. **Counter file corruption**
   ```bash
   # Reset counter file
   rm pages/api/v1/lineage/counter.txt
   ```

## OpenLineage Resources

- [OpenLineage Official Documentation](https://openlineage.io/)
- [OpenLineage Specification](https://github.com/OpenLineage/OpenLineage/blob/main/spec/OpenLineage.json)
- [dbt-openlineage Integration](https://pypi.org/project/dbt-openlineage/)

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Note**: This proxy is intended for debugging and development purposes. For production OpenLineage deployments, consider using dedicated OpenLineage backends like Marquez or custom data pipelines.