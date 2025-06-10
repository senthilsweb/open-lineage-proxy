#!/bin/bash

# OpenLineage Proxy Test Script
# This script demonstrates how to send OpenLineage events to the proxy server

SERVER_URL="http://localhost:3000"
ENDPOINT="/api/v1/lineage"

echo "🚀 Testing OpenLineage Proxy Server"
echo "Server: $SERVER_URL$ENDPOINT"
echo ""

# Test 1: Simple START event
echo "📡 Sending START event..."
curl -X POST "$SERVER_URL$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "START",
    "eventTime": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "run": {
      "runId": "'$(uuidgen | tr '[:upper:]' '[:lower:]')'"
    },
    "job": {
      "namespace": "dev",
      "name": "test_job_start"
    },
    "inputs": [],
    "outputs": [],
    "producer": "test-script",
    "schemaURL": "https://openlineage.io/spec/1-0-5/OpenLineage.json"
  }'

echo -e "\n"

# Test 2: COMPLETE event with data
echo "📡 Sending COMPLETE event with sample data..."
curl -X POST "$SERVER_URL$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "COMPLETE",
    "eventTime": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "run": {
      "runId": "'$(uuidgen | tr '[:upper:]' '[:lower:]')'"
    },
    "job": {
      "namespace": "dev",
      "name": "test_transformation_job",
      "facets": {
        "documentation": {
          "_producer": "test-script",
          "_schemaURL": "https://openlineage.io/spec/facets/1-0-0/DocumentationJobFacet.json",
          "description": "Test data transformation job"
        }
      }
    },
    "inputs": [
      {
        "namespace": "dev",
        "name": "source_table",
        "facets": {
          "schema": {
            "_producer": "test-script",
            "_schemaURL": "https://openlineage.io/spec/facets/1-0-0/SchemaDatasetFacet.json",
            "fields": [
              {"name": "id", "type": "INTEGER"},
              {"name": "name", "type": "STRING"},
              {"name": "created_at", "type": "TIMESTAMP"}
            ]
          }
        }
      }
    ],
    "outputs": [
      {
        "namespace": "dev",
        "name": "target_table",
        "facets": {
          "schema": {
            "_producer": "test-script",
            "_schemaURL": "https://openlineage.io/spec/facets/1-0-0/SchemaDatasetFacet.json",
            "fields": [
              {"name": "id", "type": "INTEGER"},
              {"name": "processed_name", "type": "STRING"},
              {"name": "processed_at", "type": "TIMESTAMP"}
            ]
          },
          "outputStatistics": {
            "_producer": "test-script",
            "_schemaURL": "https://openlineage.io/spec/facets/1-0-0/OutputStatisticsOutputDatasetFacet.json",
            "rowCount": 100,
            "size": 5000
          }
        }
      }
    ],
    "producer": "test-script",
    "schemaURL": "https://openlineage.io/spec/1-0-5/OpenLineage.json"
  }'

echo -e "\n"

# Test 3: FAIL event
echo "📡 Sending FAIL event..."
curl -X POST "$SERVER_URL$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "FAIL",
    "eventTime": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "run": {
      "runId": "'$(uuidgen | tr '[:upper:]' '[:lower:]')'",
      "facets": {
        "errorMessage": {
          "_producer": "test-script",
          "_schemaURL": "https://openlineage.io/spec/facets/1-0-0/ErrorMessageRunFacet.json",
          "message": "Test error: Connection timeout",
          "programmingLanguage": "bash"
        }
      }
    },
    "job": {
      "namespace": "dev",
      "name": "test_job_fail"
    },
    "inputs": [],
    "outputs": [],
    "producer": "test-script",
    "schemaURL": "https://openlineage.io/spec/1-0-5/OpenLineage.json"
  }'

echo -e "\n\n✅ Test completed!"
echo "Check the generated JSON files in: pages/api/v1/lineage/"
echo ""
echo "To view generated files:"
echo "ls -la pages/api/v1/lineage/*.json"
