import React, { useState, useRef } from 'react';
import { ArrowUp } from 'lucide-react';

interface InputBarProps {
  onSend: (content: string) => void;
  disabled: boolean;
}

export default function InputBar({ onSend, disabled }: InputBarProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-zinc-100 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-3xl items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask about time off, policies, or your team..."
          className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 transition focus:border-zinc-300 focus:bg-white focus:outline-none disabled:opacity-40"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="flex items-center justify-center rounded-xl bg-zinc-900 p-2.5 text-white transition hover:bg-zinc-700 focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowUp size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
