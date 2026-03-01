import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { v4 as uuid } from 'uuid';
import { AgentService } from './agent.service';

@WebSocketGateway({ cors: { origin: 'http://localhost:5173' } })
export class AgentGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private readonly agent: AgentService) {}

  handleConnection(client: Socket) {
    const sessionId = uuid();
    client.emit('session:created', { sessionId });
    client.data.sessionId = sessionId;
  }

  @SubscribeMessage('chat:message')
  async handleMessage(
    client: Socket,
    payload: { sessionId: string; content: string; employeeId?: string },
  ) {
    const employeeId = payload.employeeId || 'EMP001';
    const sessionId = payload.sessionId || client.data.sessionId;

    await this.agent.processMessage(sessionId, payload.content, employeeId, {
      onToken: (token, messageId) => client.emit('chat:token', { token, messageId }),
      onToolCall: (toolName, args) => client.emit('chat:tool_call', { toolName, args, status: 'executing' }),
      onToolResult: (toolName, result, isError) => client.emit('chat:tool_result', { toolName, result, status: isError ? 'error' : 'completed' }),
      onDone: (messageId, fullContent) => client.emit('chat:done', { messageId, fullContent }),
      onError: (error) => client.emit('chat:error', { error, code: 'AGENT_ERROR' }),
    });
  }
}
