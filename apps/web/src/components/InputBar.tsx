import React, { useState, useRef } from 'react';
import { Send } from 'lucide-react';

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
    <div className="border-t border-slate-200 bg-white px-4 py-3 shadow-[0_-1px_3px_0_rgba(0,0,0,0.04)]">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask about time off, policies, or your team..."
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="flex items-center justify-center rounded-xl bg-indigo-600 p-3 text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
