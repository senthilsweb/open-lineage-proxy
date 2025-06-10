'use client';

import { useState } from 'react';

export default function Home() {
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testEndpoint = async () => {
    setIsLoading(true);
    setTestResult('');

    try {
      const response = await fetch('/api/v1/lineage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: 'START',
          eventTime: new Date().toISOString(),
          run: {
            runId: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          },
          job: {
            namespace: 'dev',
            name: 'api_documentation_test'
          },
          inputs: [],
          outputs: [],
          producer: 'api-documentation',
          schemaURL: 'https://openlineage.io/spec/1-0-5/OpenLineage.json'
        })
      });

      const result = await response.text();
      setTestResult(`✅ Success: ${result}`);
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🚀 OpenLineage Proxy API
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            A Next.js-based proxy server for receiving and storing OpenLineage events as JSON files for debugging and analysis
          </p>
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            ✅ API Server Running
          </div>
        </div>

        {/* API Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">API Endpoint</h2>
            <button
              onClick={testEndpoint}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {isLoading ? '🔄 Testing...' : '🧪 Test API'}
            </button>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-4 mb-4">
            <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
              POST /api/v1/lineage
            </code>
          </div>

          {testResult && (
            <div className={`p-4 rounded-lg ${testResult.includes('✅') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>
              <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-2xl mb-3">📡</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">REST API Endpoint</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Receives OpenLineage events via HTTP POST requests</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-2xl mb-3">💾</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">File-based Storage</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Saves each event as a separate JSON file with unique naming</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-2xl mb-3">🔒</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Thread-safe Operations</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Uses file locking for concurrent request handling</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-2xl mb-3">🏷️</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Unique File Naming</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Counter + UUID format for easy tracking</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-2xl mb-3">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Pretty-printed JSON</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Formatted JSON output for easy reading and debugging</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-2xl mb-3">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Handling</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Comprehensive error handling and logging</p>
          </div>
        </div>

        {/* Supported Tools */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Supported Data Integration Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'dbt', icon: '🔧', desc: 'Data Build Tool' },
              { name: 'Apache Spark', icon: '⚡', desc: 'Big Data Processing' },
              { name: 'Apache Airflow', icon: '🌊', desc: 'Workflow Management' },
              { name: 'Pentaho PDI', icon: '🔄', desc: 'Data Integration' }
            ].map((tool) => (
              <div key={tool.name} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl mb-2">{tool.icon}</div>
                <h4 className="font-medium text-gray-900 dark:text-white">{tool.name}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Configuration</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Configure your data integration tools to send OpenLineage events to this proxy:
          </p>
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-4">
            <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
              OPENLINEAGE_URL=http://localhost:3000<br/>
              OPENLINEAGE_NAMESPACE=dev
            </code>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Usage Examples</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">🔧 dbt with OpenLineage</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-4">
                <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                  pip install dbt-openlineage<br/>
                  export OPENLINEAGE_URL=http://localhost:3000<br/>
                  export OPENLINEAGE_NAMESPACE=dev<br/>
                  dbt-ol run
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">🧪 Manual Testing with cURL</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-4 overflow-x-auto">
                <code className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre">
{`curl -X POST http://localhost:3000/api/v1/lineage \\
  -H "Content-Type: application/json" \\
  -d '{
    "eventType": "START",
    "eventTime": "2024-01-20T10:00:00.000Z",
    "run": {"runId": "12345678-1234-1234-1234-123456789012"},
    "job": {"namespace": "dev", "name": "test_job"},
    "inputs": [], "outputs": []
  }'`}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* File Output Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">File Output</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Each OpenLineage event is saved as a JSON file with the following naming convention:
          </p>
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-4 mb-4">
            <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
              {'{counter}_lineage_data_{uuid}.json'}
            </code>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Location:</strong> /pages/api/v1/lineage/<br/>
            <strong>Example:</strong> 001_lineage_data_a1b2c3d4-e5f6-7890-abcd-ef1234567890.json
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            OpenLineage Proxy API Server • Built with Next.js • 
            <a href="https://openlineage.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">
              Learn more about OpenLineage
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
