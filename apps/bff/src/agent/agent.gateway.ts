import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { UseFilters, UsePipes, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { v4 as uuid } from 'uuid';
import { AgentService } from './agent.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { WsExceptionFilter } from '../common/filters/ws-exception.filter';
import { WsValidationPipe } from '../common/pipes/ws-validation.pipe';

@UseFilters(new WsExceptionFilter())
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
})
export class AgentGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(AgentGateway.name);

  constructor(private readonly agent: AgentService) {}

  handleConnection(client: Socket) {
    const sessionId = uuid();
    client.emit('session:created', { sessionId });
    client.data.sessionId = sessionId;
    this.logger.log(`Client connected: ${client.id}, session: ${sessionId}`);
  }

  @SubscribeMessage('chat:message')
  @UsePipes(new WsValidationPipe(ChatMessageDto))
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ChatMessageDto,
  ) {
    const employeeId = payload.employeeId || 'EMP001';
    const sessionId = payload.sessionId || client.data.sessionId;

    await this.agent.processMessage(sessionId, payload.content, employeeId, {
      onToken: (token, messageId) =>
        client.emit('chat:token', { token, messageId }),
      onToolCall: (toolName, args) =>
        client.emit('chat:tool_call', { toolName, args, status: 'executing' }),
      onToolResult: (toolName, result, isError) =>
        client.emit('chat:tool_result', {
          toolName,
          result,
          status: isError ? 'error' : 'completed',
        }),
      onDone: (messageId, fullContent) =>
        client.emit('chat:done', { messageId, fullContent }),
      onError: (error) =>
        client.emit('chat:error', { error, code: 'AGENT_ERROR' }),
    });
  }
}
