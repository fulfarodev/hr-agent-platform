import React from 'react';
import { motion } from 'framer-motion';
import { SUGGESTION_CHIPS } from '../lib/constants';

interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void;
}

export default function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="flex flex-1 flex-col items-center justify-center px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight text-center">
          What can I help you with?
        </h2>
        <p className="text-zinc-400 text-sm text-center mt-2 max-w-sm mx-auto leading-relaxed">
          Time off requests, vacation balance, company policies, and team availability.
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-2 max-w-lg mt-10">
        {SUGGESTION_CHIPS.map((chip, i) => (
          <motion.button
            key={chip}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.06, duration: 0.4 }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSuggestionClick(chip)}
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-[13px] text-zinc-500 transition-all hover:border-zinc-300 hover:text-zinc-800 hover:shadow-sm"
          >
            {chip}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
