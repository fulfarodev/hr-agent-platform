import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentGateway } from './agent.gateway';
import { LlmModule } from '../llm/llm.module';
import { McpModule } from '../mcp/mcp.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [LlmModule, McpModule, SessionModule],
  providers: [AgentService, AgentGateway],
})
export class AgentModule {}
