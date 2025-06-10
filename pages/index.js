import { useState, useEffect } from 'react';
import { ChevronRightIcon, PlayIcon, ClipboardDocumentIcon, CheckIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const [copiedCode, setCopiedCode] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Fetch API status on component mount
    fetchApiStatus();
  }, []);

  const fetchApiStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const status = await response.json();
      setApiStatus(status);
    } catch (error) {
      console.error('Failed to fetch API status:', error);
    }
  };

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
      // Refresh API status after successful test
      fetchApiStatus();
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const CodeBlock = ({ children, language = 'bash', id }) => (
    <div className="relative group">
      <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-white/5 border-b border-white/10">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{language}</span>
          <button
            onClick={() => copyToClipboard(children, id)}
            className={`transition-all duration-200 px-2 sm:px-3 py-1 rounded text-xs flex items-center gap-1 sm:gap-1.5 ${
              copiedCode === id 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white border border-white/20'
            }`}
          >
            {copiedCode === id ? (
              <>
                <CheckIcon className="w-3 h-3" />
                <span className="hidden sm:inline">Copied!</span>
                <span className="sm:hidden">✓</span>
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="w-3 h-3" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>
        </div>
        <pre className="text-xs sm:text-sm text-green-400 font-mono overflow-x-auto p-3 sm:p-4">
          <code>{children}</code>
        </pre>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute -bottom-32 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse-slow" style={{animationDelay: '4s'}}></div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10 container mx-auto px-6 py-12 animate-fade-in">
        {/* Navigation */}
        <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo and Status */}
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="text-xl sm:text-2xl font-bold gradient-text">
                  🚀 OpenLineage Proxy
                </div>
                {apiStatus && (
                  <div className="hidden sm:flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-medium">API Online</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-300">{apiStatus.statistics?.totalEventsReceived || 0} events</span>
                  </div>
                )}
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-6">
                <div className="flex items-center space-x-4 text-sm">
                  <a href="#overview" className="text-gray-300 hover:text-white transition-colors">Overview</a>
                  <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                  <a href="#installation" className="text-gray-300 hover:text-white transition-colors">Installation</a>
                  <a href="#usage" className="text-gray-300 hover:text-white transition-colors">Usage</a>
                </div>
                <div className="flex items-center space-x-3">
                  <a 
                    href="/api/status" 
                    className="text-gray-300 hover:text-white transition-colors text-sm px-3 py-1 rounded-full bg-white/10 hover:bg-white/20"
                  >
                    Status
                  </a>
                  <a 
                    href="/api/health" 
                    className="text-gray-300 hover:text-white transition-colors text-sm px-3 py-1 rounded-full bg-white/10 hover:bg-white/20"
                  >
                    Health
                  </a>
                </div>
              </div>

              {/* Mobile Navigation Button */}
              <div className="flex items-center space-x-3 lg:hidden">
                {/* Mobile Status Indicator */}
                {apiStatus && (
                  <div className="flex items-center space-x-1 text-xs">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-medium">Online</span>
                  </div>
                )}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-gray-300 hover:text-white transition-colors p-2 rounded-lg bg-white/10 hover:bg-white/20"
                  aria-label="Toggle mobile menu"
                >
                  {isMobileMenuOpen ? (
                    <XMarkIcon className="w-5 h-5" />
                  ) : (
                    <Bars3Icon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="lg:hidden mt-4 pb-4 border-t border-white/10">
                <div className="flex flex-col space-y-3 pt-4">
                  <a 
                    href="#overview" 
                    className="text-gray-300 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Overview
                  </a>
                  <a 
                    href="#features" 
                    className="text-gray-300 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Features
                  </a>
                  <a 
                    href="#installation" 
                    className="text-gray-300 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Installation
                  </a>
                  <a 
                    href="#usage" 
                    className="text-gray-300 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Usage
                  </a>
                  <div className="flex flex-col space-y-2 pt-2 border-t border-white/10">
                    <a 
                      href="/api/status" 
                      className="text-gray-300 hover:text-white transition-colors py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-center"
                    >
                      API Status
                    </a>
                    <a 
                      href="/api/health" 
                      className="text-gray-300 hover:text-white transition-colors py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-center"
                    >
                      Health Check
                    </a>
                  </div>
                  {/* Mobile API Status Details */}
                  {apiStatus && (
                    <div className="pt-3 border-t border-white/10">
                      <div className="text-xs text-gray-400 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>API Status:</span>
                          <span className="text-green-400">Online</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Events Received:</span>
                          <span className="text-gray-300">{apiStatus.statistics?.totalEventsReceived || 0}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Hero Section */}
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                OpenLineage Proxy Server
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-4xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4">
              A Next.js-based OpenLineage proxy server that receives and stores OpenLineage events as individual JSON files for debugging and analysis purposes.
            </p>
            
            {/* Quick Test Section */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Test the API</h3>
                  <p className="text-gray-300 text-sm sm:text-base">Send a test OpenLineage event to verify the proxy is working</p>
                  <code className="text-xs sm:text-sm text-purple-300 bg-purple-900/30 px-2 py-1 rounded mt-2 inline-block">
                    POST /api/v1/lineage
                  </code>
                </div>
                <button
                  onClick={testEndpoint}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Testing...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-5 h-5" />
                      Test API
                    </>
                  )}
                </button>
              </div>
              
              {testResult && (
                <div className={`mt-6 p-4 rounded-xl ${testResult.includes('✅') 
                  ? 'bg-green-900/30 border border-green-500/30 text-green-300' 
                  : 'bg-red-900/30 border border-red-500/30 text-red-300'
                }`}>
                  <pre className="text-xs sm:text-sm whitespace-pre-wrap font-mono overflow-x-auto">{testResult}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Overview Section */}
          <section id="overview" className="mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">Overview</h2>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-6">
                This project serves as a debugging proxy for OpenLineage events emitted by various data integration and transformation tools:
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[
                  { name: 'dbt', icon: '🔧', desc: 'Data Build Tool', gradient: 'from-orange-400 to-red-500' },
                  { name: 'Apache Spark', icon: '⚡', desc: 'Big Data Processing', gradient: 'from-yellow-400 to-orange-500' },
                  { name: 'Apache Airflow', icon: '🌊', desc: 'Workflow Management', gradient: 'from-blue-400 to-cyan-500' }
                ].map((tool) => (
                  <div key={tool.name} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10 hover:bg-white/10 transition-all duration-200 group">
                    <div className="text-2xl sm:text-3xl mb-3">{tool.icon}</div>
                    <h4 className={`font-semibold text-base sm:text-lg bg-gradient-to-r ${tool.gradient} bg-clip-text text-transparent group-hover:scale-105 transition-transform`}>
                      {tool.name}
                    </h4>
                    <p className="text-gray-400 text-xs sm:text-sm">{tool.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">Features</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[
                { icon: '📡', title: 'REST API Endpoint', desc: 'Receives OpenLineage events via HTTP POST requests', color: 'blue' },
                { icon: '💾', title: 'File-based Storage', desc: 'Saves each event as a separate JSON file with unique naming', color: 'purple' },
                { icon: '🔒', title: 'Thread-safe Operations', desc: 'Uses file locking for concurrent request handling', color: 'green' },
                { icon: '🏷️', title: 'Unique File Naming', desc: 'Counter + UUID format for easy tracking', color: 'yellow' },
                { icon: '📝', title: 'Pretty-printed JSON', desc: 'Formatted JSON output for easy reading and debugging', color: 'pink' },
                { icon: '⚠️', title: 'Error Handling', desc: 'Comprehensive error handling and logging', color: 'red' }
              ].map((feature, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10 hover:bg-white/10 transition-all duration-200 group">
                  <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">{feature.icon}</div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">{feature.title}</h3>
                  <p className="text-gray-300 text-xs sm:text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Installation Section */}
          <section id="installation" className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Installation</h2>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                    Clone the repository
                  </h3>
                  <CodeBlock id="clone">
{`git clone <repository-url>
cd open-lineage-proxy`}
                  </CodeBlock>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                    Install dependencies
                  </h3>
                  <CodeBlock id="install">npm install</CodeBlock>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                    Start the development server
                  </h3>
                  <CodeBlock id="start">npm run dev</CodeBlock>
                </div>
              </div>
            </div>
          </section>

          {/* Configuration Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Configuration</h2>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <p className="text-gray-300 mb-6">
                Configure your data integration tools to send OpenLineage events to this proxy:
              </p>
              <CodeBlock id="config">
{`OPENLINEAGE_URL=http://localhost:3000
OPENLINEAGE_NAMESPACE=dev`}
              </CodeBlock>
            </div>
          </section>

          {/* Usage Examples Section */}
          <section id="usage" className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Usage Examples</h2>
            
            <div className="space-y-8">
              {/* dbt Example */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                  🔧 <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">dbt with OpenLineage</span>
                </h3>
                <CodeBlock id="dbt">
{`# Install dbt with OpenLineage support
pip install dbt-openlineage

# Set environment variables
export OPENLINEAGE_URL=http://localhost:3000
export OPENLINEAGE_NAMESPACE=dev

# Run dbt with OpenLineage
dbt-ol run`}
                </CodeBlock>
              </div>

              {/* Spark Example */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                  ⚡ <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Apache Spark with OpenLineage</span>
                </h3>
                <CodeBlock id="spark">
{`spark-submit \\
  --packages io.openlineage:openlineage-spark:0.21.1 \\
  --conf spark.extraListeners=io.openlineage.spark.agent.OpenLineageSparkListener \\
  --conf spark.openlineage.transport.type=http \\
  --conf spark.openlineage.transport.url=http://localhost:3000 \\
  --conf spark.openlineage.namespace=dev \\
  your_spark_job.py`}
                </CodeBlock>
              </div>

              {/* cURL Example */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                  🧪 <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Manual Testing with cURL</span>
                </h3>
                <CodeBlock id="curl">
{`curl -X POST http://localhost:3000/api/v1/lineage \\
  -H "Content-Type: application/json" \\
  -d '{
    "eventType": "START",
    "eventTime": "2024-01-20T10:00:00.000Z",
    "run": {"runId": "12345678-1234-1234-1234-123456789012"},
    "job": {"namespace": "dev", "name": "test_job"},
    "inputs": [], "outputs": []
  }'`}
                </CodeBlock>
              </div>
            </div>
          </section>

          {/* API Endpoints Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">API Endpoints</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="bg-green-500 text-xs px-2 py-1 rounded">POST</span>
                  /api/v1/lineage
                </h3>
                <p className="text-gray-300 mb-4">Receives OpenLineage events and saves them as JSON files.</p>
                <div className="space-y-2 text-sm">
                  <div className="text-green-400">✅ 200 OK: "Payload saved successfully"</div>
                  <div className="text-red-400">❌ 500 Error: "Error writing to file"</div>
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="bg-blue-500 text-xs px-2 py-1 rounded">GET</span>
                  /api/status
                </h3>
                <p className="text-gray-300 mb-4">Returns current status and statistics of the API server.</p>
                {apiStatus && (
                  <div className="text-sm space-y-1">
                    <div className="text-green-400">✅ Status: {apiStatus.status}</div>
                    <div className="text-blue-400">📊 Events: {apiStatus.statistics?.totalEventsReceived}</div>
                    <div className="text-purple-400">📁 Files: {apiStatus.statistics?.filesStored}</div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* File Output Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">File Output</h2>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <p className="text-gray-300 mb-6">
                Each OpenLineage event is saved as a JSON file with the following naming convention:
              </p>
              <div className="bg-gray-900 rounded-lg p-4 mb-6">
                <code className="text-purple-400 font-mono">
                  {'{counter}_lineage_data_{uuid}.json'}
                </code>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Example Filenames:</h4>
                  <ul className="space-y-1 text-gray-300 font-mono text-sm">
                    <li>001_lineage_data_a1b2c3d4-e5f6-7890-abcd-ef1234567890.json</li>
                    <li>002_lineage_data_b2c3d4e5-f6g7-8901-bcde-f12345678901.json</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Storage Location:</h4>
                  <p className="text-gray-300 font-mono text-sm">/pages/api/v1/lineage/</p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center pt-8 sm:pt-12 border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-gray-400 text-sm">
              <span>OpenLineage Proxy API Server</span>
              <span className="hidden sm:inline">•</span>
              <span>Built with Next.js & Tailwind CSS</span>
              <span className="hidden sm:inline">•</span>
              <a 
                href="https://openlineage.io/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                Learn more about OpenLineage
                <ChevronRightIcon className="w-4 h-4" />
              </a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
