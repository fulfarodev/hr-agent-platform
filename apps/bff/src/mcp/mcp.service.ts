import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

@Injectable()
export class McpService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(McpService.name);
  private client!: Client;
  private transport!: StdioClientTransport;
  private connected = false;
  private cachedTools: any[] = [];

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    try {
      const command = this.config.get<string>('mcp.serverCommand');
      const args = this.config.get<string[]>('mcp.serverArgs');
      const cwd = this.config.get<string>('mcp.serverCwd');

      this.logger.log(`Starting MCP server: ${command} ${args!.join(' ')} in ${cwd}`);

      this.transport = new StdioClientTransport({
        command: command!,
        args,
        cwd,
      });

      this.client = new Client({ name: 'hr-agent-bff', version: '1.0.0' });
      await this.client.connect(this.transport);
      this.connected = true;

      // Cache tools on init
      const result = await this.client.listTools();
      this.cachedTools = result.tools;

      this.logger.log(`MCP connected. Available tools: ${this.cachedTools.map(t => t.name).join(', ')}`);
    } catch (error: unknown) {
      this.logger.error(`Failed to connect to MCP server: ${(error as Error).message}`);
      this.connected = false;
    }
  }

  getTools() {
    return this.cachedTools;
  }

  async executeTool(name: string, args: Record<string, unknown>) {
    if (!this.connected) {
      throw new Error('MCP server is not connected');
    }

    this.logger.log(`Executing tool: ${name} with args: ${JSON.stringify(args)}`);
    const result = await this.client.callTool({ name, arguments: args });
    return result;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.close();
        this.logger.log('MCP client closed');
      } catch (error: unknown) {
        this.logger.error(`Error closing MCP client: ${(error as Error).message}`);
      }
    }
  }
}
