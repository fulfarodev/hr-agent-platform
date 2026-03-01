import React from 'react';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { SUGGESTION_CHIPS } from '../lib/constants';

interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void;
}

export default function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-1 flex-col items-center justify-center px-6"
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 mb-6">
        <Users size={32} />
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-2">HR Assistant</h2>
      <p className="text-slate-500 text-center max-w-md mb-8 leading-relaxed">
        I can help you with time off requests, vacation balance, and company policies.
      </p>

      <div className="flex flex-wrap justify-center gap-3 max-w-lg">
        {SUGGESTION_CHIPS.map((chip) => (
          <motion.button
            key={chip}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSuggestionClick(chip)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md"
          >
            {chip}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
