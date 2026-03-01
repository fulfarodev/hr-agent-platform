import React, { useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { ChatMessage } from '@hr-agent/shared-types';
import SessionHeader from './SessionHeader';
import WelcomeScreen from './WelcomeScreen';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import InputBar from './InputBar';
import { useChat } from '../hooks/useChat';
import { useAutoScroll } from '../hooks/useAutoScroll';

interface ChatWindowProps {
  employeeId: string;
  onEmployeeChange: (id: string) => void;
}

export default function ChatWindow({ employeeId, onEmployeeChange }: ChatWindowProps) {
  const {
    messages,
    isStreaming,
    currentStreamingMessage,
    activeToolCalls,
    error,
    sendMessage,
  } = useChat();

  const scrollRef = useAutoScroll([messages, currentStreamingMessage, activeToolCalls]);

  const handleSend = useCallback(
    (content: string) => {
      sendMessage(content, employeeId);
    },
    [sendMessage, employeeId],
  );

  const hasMessages = messages.length > 0;

  // Build a streaming message object for display
  const streamingBubble: ChatMessage | null =
    isStreaming && currentStreamingMessage
      ? {
          id: 'streaming',
          role: 'assistant',
          content: currentStreamingMessage,
          timestamp: Date.now(),
        }
      : null;

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <SessionHeader employeeId={employeeId} onEmployeeChange={onEmployeeChange} />

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin"
      >
        {!hasMessages ? (
          <WelcomeScreen onSuggestionClick={handleSend} />
        ) : (
          <div className="mx-auto max-w-3xl px-4 py-6">
            <AnimatePresence>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </AnimatePresence>

            {/* Active tool calls during streaming */}
            {isStreaming && activeToolCalls.length > 0 && !streamingBubble && (
              <MessageBubble
                message={{
                  id: 'tool-progress',
                  role: 'assistant',
                  content: '',
                  timestamp: Date.now(),
                }}
                activeToolCalls={activeToolCalls}
              />
            )}

            {/* Streaming message with active tool calls */}
            {streamingBubble && (
              <MessageBubble
                message={streamingBubble}
                isStreaming
                activeToolCalls={activeToolCalls}
              />
            )}

            {/* Typing indicator when streaming hasn't produced tokens yet */}
            <AnimatePresence>
              {isStreaming && !currentStreamingMessage && activeToolCalls.length === 0 && (
                <TypingIndicator />
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        </div>
      )}

      <InputBar onSend={handleSend} disabled={isStreaming} />
    </div>
  );
}
