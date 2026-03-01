import React from 'react';
import { motion } from 'framer-motion';
import type { ChatMessage } from '@hr-agent/shared-types';
import ToolCallCard from './ToolCallCard';
import type { ActiveToolCall } from '../hooks/useChat';

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
  activeToolCalls?: ActiveToolCall[];
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MessageBubble({ message, isStreaming, activeToolCalls }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`
            px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
            ${
              isUser
                ? 'rounded-2xl rounded-br-md bg-indigo-600 text-white'
                : 'rounded-2xl rounded-bl-md bg-white text-slate-800 shadow-sm border border-slate-100'
            }
          `}
        >
          {message.content}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-0.5 -mb-0.5 bg-slate-400 animate-pulse rounded-sm" />
          )}
        </div>

        {/* Tool calls for assistant messages */}
        {!isUser && activeToolCalls && activeToolCalls.length > 0 && (
          <div className="w-full mt-1">
            {activeToolCalls.map((tc, i) => (
              <ToolCallCard
                key={`${tc.name}-${i}`}
                toolName={tc.name}
                args={tc.args}
                status={tc.status}
                result={tc.result}
              />
            ))}
          </div>
        )}

        {/* Tool calls stored on the message */}
        {!isUser && !activeToolCalls?.length && message.toolCalls && message.toolCalls.length > 0 && (
          <div className="w-full mt-1">
            {message.toolCalls.map((tc) => (
              <ToolCallCard
                key={tc.id}
                toolName={tc.name}
                args={tc.arguments}
                status="completed"
              />
            ))}
          </div>
        )}

        <span
          className={`mt-1 text-[11px] text-slate-400 ${isUser ? 'text-right' : 'text-left'} px-1`}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}
