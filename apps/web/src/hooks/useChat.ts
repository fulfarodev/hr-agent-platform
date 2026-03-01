import { useCallback, useEffect, useRef, useState } from 'react';
import { createChatSocket } from '@hr-agent/api-client';
import type { ChatSocket } from '@hr-agent/api-client';
import type { ChatMessage } from '@hr-agent/shared-types';
import { API_URL } from '../lib/constants';

export interface ActiveToolCall {
  name: string;
  args: Record<string, unknown>;
  status: 'executing' | 'completed' | 'error';
  result?: unknown;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeToolCalls, setActiveToolCalls] = useState<ActiveToolCall[]>([]);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<ChatSocket | null>(null);
  const streamingContentRef = useRef('');
  const activeToolCallsRef = useRef<ActiveToolCall[]>([]);
  const isStreamingRef = useRef(false);

  useEffect(() => {
    const socket = createChatSocket({
      url: API_URL,
      onToken: (data) => {
        isStreamingRef.current = true;
        setIsStreaming(true);
        streamingContentRef.current += data.token;
        setCurrentStreamingMessage(streamingContentRef.current);
      },
      onToolCall: (data) => {
        const toolCall: ActiveToolCall = {
          name: data.toolName,
          args: data.args,
          status: 'executing',
        };
        activeToolCallsRef.current = [...activeToolCallsRef.current, toolCall];
        setActiveToolCalls([...activeToolCallsRef.current]);
      },
      onToolResult: (data) => {
        activeToolCallsRef.current = activeToolCallsRef.current.map((tc) =>
          tc.name === data.toolName && tc.status === 'executing'
            ? { ...tc, status: data.status === 'error' ? 'error' as const : 'completed' as const, result: data.result }
            : tc,
        );
        setActiveToolCalls([...activeToolCallsRef.current]);
      },
      onDone: (data) => {
        const assistantMessage: ChatMessage = {
          id: data.messageId,
          role: 'assistant',
          content: data.fullContent,
          timestamp: Date.now(),
          toolCalls: activeToolCallsRef.current.length > 0
            ? activeToolCallsRef.current.map((tc, i) => ({
                id: `${data.messageId}-tool-${i}`,
                name: tc.name,
                arguments: tc.args,
              }))
            : undefined,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        isStreamingRef.current = false;
        setIsStreaming(false);
        setCurrentStreamingMessage('');
        streamingContentRef.current = '';
        activeToolCallsRef.current = [];
        setActiveToolCalls([]);
      },
      onError: (data) => {
        setError(data.error);
        isStreamingRef.current = false;
        setIsStreaming(false);
        setCurrentStreamingMessage('');
        streamingContentRef.current = '';
        activeToolCallsRef.current = [];
        setActiveToolCalls([]);
      },
      onSessionCreated: (data) => {
        setSessionId(data.sessionId);
      },
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;

  const sendMessage = useCallback(
    (content: string, employeeId: string) => {
      if (!socketRef.current || isStreamingRef.current) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setError(null);
      isStreamingRef.current = true;
      setIsStreaming(true);
      streamingContentRef.current = '';
      setCurrentStreamingMessage('');

      socketRef.current.emit('chat:message', {
        sessionId: sessionIdRef.current ?? '',
        content,
        employeeId,
      });
    },
    [],
  );

  return {
    messages,
    isStreaming,
    currentStreamingMessage,
    activeToolCalls,
    sessionId,
    error,
    sendMessage,
  };
}
