import React, { useState } from 'react';
import { Wrench, ChevronDown, ChevronRight, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TOOL_LABELS: Record<string, string> = {
  getRemainingVacationDays: 'Checking vacation balance...',
  requestTimeOff: 'Processing time off request...',
  getCompanyPolicy: 'Looking up company policy...',
  getTeamCalendar: 'Checking team calendar...',
};

interface ToolCallCardProps {
  toolName: string;
  args: Record<string, unknown>;
  status: 'executing' | 'completed' | 'error';
  result?: unknown;
}

export default function ToolCallCard({ toolName, args, status, result }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(status === 'executing');

  const label = TOOL_LABELS[toolName] ?? `Running ${toolName}...`;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.2 }}
      className="my-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition hover:bg-slate-100"
      >
        <Wrench size={14} className="shrink-0 text-slate-400" />
        <span className="flex-1 font-medium text-slate-600">{label}</span>

        {status === 'executing' && (
          <Loader2 size={14} className="shrink-0 animate-spin text-indigo-500" />
        )}
        {status === 'completed' && (
          <Check size={14} className="shrink-0 text-emerald-500" />
        )}
        {status === 'error' && (
          <span className="shrink-0 text-xs font-medium text-red-500">Error</span>
        )}

        {expanded ? (
          <ChevronDown size={14} className="shrink-0 text-slate-400" />
        ) : (
          <ChevronRight size={14} className="shrink-0 text-slate-400" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-200"
          >
            <div className="px-3 py-2.5 space-y-2">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Arguments</p>
                <pre className="rounded-md bg-slate-100 p-2 text-xs text-slate-600 overflow-x-auto">
                  {JSON.stringify(args, null, 2)}
                </pre>
              </div>
              {result !== undefined && (
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Result</p>
                  <pre className="rounded-md bg-slate-100 p-2 text-xs text-slate-600 overflow-x-auto">
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
