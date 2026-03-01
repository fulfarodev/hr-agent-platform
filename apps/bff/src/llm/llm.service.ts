import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

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

    this.logger.log(`LLM client configured: ${baseUrl} with model ${this.model}`);
  }

  async chat(
    messages: OpenAI.ChatCompletionMessageParam[],
    tools?: OpenAI.ChatCompletionTool[],
  ): Promise<OpenAI.ChatCompletion> {
    try {
      const params: OpenAI.ChatCompletionCreateParamsNonStreaming = {
        model: this.model,
        messages,
        temperature: this.config.get<number>('agent.temperature') ?? 0.3,
        stream: false,
      };

      if (tools && tools.length > 0) {
        params.tools = tools;
      }

      return await this.client.chat.completions.create(params);
    } catch (error: unknown) {
      if ((error as any)?.code === 'ECONNREFUSED' || (error as Error)?.message?.includes('ECONNREFUSED')) {
        throw new Error(
          'Ollama is not available. Please ensure Ollama is running: `ollama serve` and the model is pulled: `ollama pull llama3.1:8b-instruct-q5_K_M`',
        );
      }
      throw error;
    }
  }

  async *chatStream(
    messages: OpenAI.ChatCompletionMessageParam[],
    tools?: OpenAI.ChatCompletionTool[],
  ): AsyncIterable<OpenAI.ChatCompletionChunk> {
    try {
      const params: OpenAI.ChatCompletionCreateParamsStreaming = {
        model: this.model,
        messages,
        temperature: this.config.get<number>('agent.temperature') ?? 0.3,
        stream: true,
      };

      if (tools && tools.length > 0) {
        params.tools = tools;
      }

      const stream = await this.client.chat.completions.create(params);

      for await (const chunk of stream) {
        yield chunk;
      }
    } catch (error: unknown) {
      if ((error as any)?.code === 'ECONNREFUSED' || (error as Error)?.message?.includes('ECONNREFUSED')) {
        throw new Error(
          'Ollama is not available. Please ensure Ollama is running: `ollama serve` and the model is pulled: `ollama pull llama3.1:8b-instruct-q5_K_M`',
        );
      }
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }
}
