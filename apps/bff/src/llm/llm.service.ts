import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

const MAX_RETRIES = 3;
const RETRY_BASE_MS = 1000;

function isTransientError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes('ECONNRESET') || msg.includes('ETIMEDOUT') || msg.includes('socket hang up')) {
      return true;
    }
  }
  const status = (error as any)?.status;
  return status === 429 || status === 502 || status === 503 || status === 504;
}

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private client: OpenAI;
  private model!: string;

  constructor(private readonly config: ConfigService) {
    const baseUrl = this.config.get<string>('ollama.baseUrl');
    this.model = this.config.get<string>('ollama.model')!;

    this.client = new OpenAI({
      baseURL: baseUrl,
      apiKey: 'ollama',
    });

    this.logger.log(`LLM configured: ${baseUrl} model=${this.model}`);
  }

  async chat(
    messages: OpenAI.ChatCompletionMessageParam[],
    tools?: OpenAI.ChatCompletionTool[],
  ): Promise<OpenAI.ChatCompletion> {
    const start = Date.now();

    const params: OpenAI.ChatCompletionCreateParamsNonStreaming = {
      model: this.model,
      messages,
      temperature: this.config.get<number>('agent.temperature') ?? 0.3,
      stream: false,
    };

    if (tools && tools.length > 0) {
      params.tools = tools;
    }

    const response = await this.callWithRetry(() =>
      this.client.chat.completions.create(params),
    );

    const latencyMs = Date.now() - start;
    const usage = response.usage;
    this.logger.log(
      `LLM chat: ${latencyMs}ms | tokens=${usage?.total_tokens ?? '?'} (prompt=${usage?.prompt_tokens ?? '?'}, completion=${usage?.completion_tokens ?? '?'}) | finish=${response.choices[0]?.finish_reason}`,
    );

    return response;
  }

  async *chatStream(
    messages: OpenAI.ChatCompletionMessageParam[],
    tools?: OpenAI.ChatCompletionTool[],
  ): AsyncIterable<OpenAI.ChatCompletionChunk> {
    const start = Date.now();

    const params: OpenAI.ChatCompletionCreateParamsStreaming = {
      model: this.model,
      messages,
      temperature: this.config.get<number>('agent.temperature') ?? 0.3,
      stream: true,
    };

    if (tools && tools.length > 0) {
      params.tools = tools;
    }

    const stream = await this.callWithRetry(() =>
      this.client.chat.completions.create(params),
    );

    let chunks = 0;
    for await (const chunk of stream) {
      chunks++;
      yield chunk;
    }

    const latencyMs = Date.now() - start;
    this.logger.log(`LLM stream: ${latencyMs}ms | chunks=${chunks}`);
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }

  private async callWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await fn();
      } catch (error: unknown) {
        lastError = error;

        if (this.isConnectionRefused(error)) {
          throw new Error(
            'Ollama is not available. Please ensure Ollama is running: `ollama serve` and the model is pulled: `ollama pull llama3.1:8b-instruct-q5_K_M`',
          );
        }

        if (!isTransientError(error) || attempt === MAX_RETRIES) {
          throw error;
        }

        const delay = RETRY_BASE_MS * Math.pow(2, attempt - 1);
        this.logger.warn(
          `LLM request failed (attempt ${attempt}/${MAX_RETRIES}), retrying in ${delay}ms...`,
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    throw lastError;
  }

  private isConnectionRefused(error: unknown): boolean {
    return (
      (error as any)?.code === 'ECONNREFUSED' ||
      (error instanceof Error && error.message.includes('ECONNREFUSED'))
    );
  }
}
