import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@hr-agent/shared-types';

export type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export interface ChatSocketOptions {
  url?: string;
  onToken: (data: { token: string; messageId: string }) => void;
  onToolCall: (data: { toolName: string; args: Record<string, unknown>; status: string }) => void;
  onToolResult: (data: { toolName: string; result: unknown; status: string }) => void;
  onDone: (data: { messageId: string; fullContent: string }) => void;
  onError: (data: { error: string; code: string }) => void;
  onSessionCreated: (data: { sessionId: string }) => void;
}

export function createChatSocket(options: ChatSocketOptions): ChatSocket {
  const socket: ChatSocket = io(options.url ?? 'http://localhost:3001', {
    transports: ['websocket'],
  });

  socket.on('chat:token', options.onToken);
  socket.on('chat:tool_call', options.onToolCall);
  socket.on('chat:tool_result', options.onToolResult);
  socket.on('chat:done', options.onDone);
  socket.on('chat:error', options.onError);
  socket.on('session:created', options.onSessionCreated);

  return socket;
}
