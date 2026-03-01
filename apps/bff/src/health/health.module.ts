import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { LlmModule } from '../llm/llm.module';
import { McpModule } from '../mcp/mcp.module';

@Module({
  imports: [LlmModule, McpModule],
  controllers: [HealthController],
})
export class HealthModule {}
