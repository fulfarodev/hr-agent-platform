export interface ClientToServerEvents {
  'chat:message': (payload: { sessionId: string; content: string; employeeId?: string }) => void;
}

export interface ServerToClientEvents {
  'session:created': (payload: { sessionId: string }) => void;
  'chat:token': (payload: { token: string; messageId: string }) => void;
  'chat:tool_call': (payload: { toolName: string; args: Record<string, unknown>; status: 'executing' }) => void;
  'chat:tool_result': (payload: { toolName: string; result: unknown; status: 'completed' | 'error' }) => void;
  'chat:done': (payload: { messageId: string; fullContent: string }) => void;
  'chat:error': (payload: { error: string; code: string }) => void;
}
