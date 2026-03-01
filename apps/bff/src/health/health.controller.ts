import { Controller, Get } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { McpService } from '../mcp/mcp.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly llm: LlmService,
    private readonly mcp: McpService,
  ) {}

  @Get()
  async check() {
    const ollamaHealthy = await this.llm.isAvailable();
    const mcpHealthy = this.mcp.isConnected();
    return {
      status: ollamaHealthy && mcpHealthy ? 'ok' : 'degraded',
      ollama: ollamaHealthy,
      mcp: mcpHealthy,
      timestamp: new Date().toISOString(),
    };
  }
}
