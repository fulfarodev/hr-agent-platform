export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
    model: process.env.OLLAMA_MODEL || 'llama3.1:8b-instruct-q5_K_M',
  },
  mcp: {
    serverCommand: process.env.MCP_SERVER_COMMAND || 'python',
    serverArgs: process.env.MCP_SERVER_ARGS?.split(',') || ['-m', 'src.server'],
    serverCwd: process.env.MCP_SERVER_CWD || '../../mcp-server',
  },
  agent: {
    maxIterations: parseInt(process.env.AGENT_MAX_ITERATIONS, 10) || 5,
    temperature: parseFloat(process.env.AGENT_TEMPERATURE) || 0.3,
  },
});
