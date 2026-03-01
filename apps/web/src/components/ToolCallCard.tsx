import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TOOL_LABELS: Record<string, string> = {
  getRemainingVacationDays: 'Checking vacation balance',
  requestTimeOff: 'Processing time off request',
  getCompanyPolicy: 'Looking up policy',
  getTeamCalendar: 'Checking team calendar',
};

interface ToolCallCardProps {
  toolName: string;
  args: Record<string, unknown>;
  status: 'executing' | 'completed' | 'error';
  result?: unknown;
}

export default function ToolCallCard({ toolName, args, status, result }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(status === 'executing');

  const label = TOOL_LABELS[toolName] ?? toolName;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.2 }}
      className="my-1.5 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition hover:bg-zinc-100"
      >
        {status === 'executing' && (
          <Loader2 size={12} className="shrink-0 animate-spin text-zinc-400" />
        )}
        {status === 'completed' && (
          <Check size={12} className="shrink-0 text-green-500" />
        )}
        {status === 'error' && (
          <span className="shrink-0 w-3 h-3 rounded-full bg-red-100 flex items-center justify-center text-[8px] text-red-500 font-bold">!</span>
        )}

        <span className="flex-1 font-medium text-zinc-500">{label}</span>

        {expanded ? (
          <ChevronDown size={12} className="shrink-0 text-zinc-400" />
        ) : (
          <ChevronRight size={12} className="shrink-0 text-zinc-400" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden border-t border-zinc-200"
          >
            <div className="px-3 py-2 space-y-2">
              <div>
                <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest mb-1">Args</p>
                <pre className="rounded-md bg-zinc-100 p-2 text-[11px] font-mono text-zinc-600 overflow-x-auto">
                  {JSON.stringify(args, null, 2)}
                </pre>
              </div>
              {result !== undefined && (
                <div>
                  <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest mb-1">Result</p>
                  <pre className="rounded-md bg-zinc-100 p-2 text-[11px] font-mono text-zinc-600 overflow-x-auto">
                    {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
