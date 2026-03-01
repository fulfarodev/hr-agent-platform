import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import type OpenAI from 'openai';
import { LlmService } from '../llm/llm.service';
import { McpService } from '../mcp/mcp.service';
import { SessionService } from '../session/session.service';
import { mcpToolsToOpenAI } from '../mcp/tool-mapper';
import { buildSystemPrompt } from './system-prompt';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private readonly llm: LlmService,
    private readonly mcp: McpService,
    private readonly session: SessionService,
    private readonly config: ConfigService,
  ) {}

  async processMessage(
    sessionId: string,
    userMessage: string,
    employeeId: string,
    callbacks: {
      onToken: (token: string, messageId: string) => void;
      onToolCall: (toolName: string, args: Record<string, unknown>) => void;
      onToolResult: (toolName: string, result: unknown, isError: boolean) => void;
      onDone: (messageId: string, fullContent: string) => void;
      onError: (error: string) => void;
    },
  ): Promise<void> {
    const maxIterations = this.config.get<number>('agent.maxIterations') || 5;
    const messageId = uuid();

    try {
      // 1. Get or create session
      let session = this.session.get(sessionId);
      if (!session) {
        session = this.session.create(employeeId);
        // Re-map sessionId to the created session's ID if they differ
        if (session.id !== sessionId) {
          this.logger.warn(`Session ${sessionId} not found, created new session ${session.id}`);
        }
      }

      // 2. Add user message to history
      this.session.addMessage(sessionId, {
        id: uuid(),
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
      });

      // 3. Get available tools from MCP
      const mcpTools = this.mcp.getTools();
      const openaiTools = mcpToolsToOpenAI(mcpTools);

      // 4. Build messages array
      const systemMessage = { role: 'system' as const, content: buildSystemPrompt(employeeId) };
      const history = this.session.getHistory(sessionId, 20);

      // 5. Agent loop
      let iterations = 0;
      const messages: OpenAI.ChatCompletionMessageParam[] = [
        systemMessage,
        ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ];

      while (iterations < maxIterations) {
        iterations++;

        // Use non-streaming for tool-calling iterations
        const response = await this.llm.chat(messages, openaiTools);
        const choice = response.choices[0];

        // Check if response contains tool calls
        if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
          const toolCalls = choice.message.tool_calls;

          // Add assistant message with tool calls to messages
          messages.push(choice.message);

          for (const toolCall of toolCalls) {
            const toolName = toolCall.function.name;
            let toolArgs: Record<string, unknown>;

            try {
              toolArgs = JSON.parse(toolCall.function.arguments);
            } catch {
              toolArgs = {};
            }

            callbacks.onToolCall(toolName, toolArgs);

            try {
              const result = await this.mcp.executeTool(toolName, toolArgs);
              const resultContent =
                typeof result.content === 'string'
                  ? result.content
                  : JSON.stringify(result.content);

              callbacks.onToolResult(toolName, result.content, false);

              messages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: resultContent,
              });
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              callbacks.onToolResult(toolName, errorMessage, true);

              messages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: `Error: ${errorMessage}`,
              });
            }
          }

          // Continue loop - LLM will process tool results
          continue;
        }

        // No tool calls - this is the final response
        // Use streaming for the final response to send tokens in real-time
        let fullContent = '';

        try {
          // Re-issue the request with streaming for real-time token delivery
          const streamMessages = [...messages];
          const stream = this.llm.chatStream(streamMessages);

          for await (const chunk of stream) {
            const delta = chunk.choices?.[0]?.delta;
            if (delta?.content) {
              fullContent += delta.content;
              callbacks.onToken(delta.content, messageId);
            }
          }
        } catch (streamError) {
          // Fallback: if streaming fails, use the non-streaming response we already have
          this.logger.warn('Streaming failed, falling back to non-streaming response');
          fullContent = choice.message.content || '';
          callbacks.onToken(fullContent, messageId);
        }

        callbacks.onDone(messageId, fullContent);

        // Save assistant message to history
        this.session.addMessage(sessionId, {
          id: messageId,
          role: 'assistant',
          content: fullContent,
          timestamp: Date.now(),
        });

        return;
      }

      // Max iterations reached
      callbacks.onError('Maximum iterations reached. Please try again with a simpler request.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Agent error: ${errorMessage}`);
      callbacks.onError(errorMessage);
    }
  }
}
