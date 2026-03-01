import type OpenAI from 'openai';

interface McpTool {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

export function mcpToolsToOpenAI(mcpTools: McpTool[]): OpenAI.ChatCompletionTool[] {
  return mcpTools.map(tool => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description || '',
      parameters: tool.inputSchema as Record<string, unknown>,
    },
  }));
}
