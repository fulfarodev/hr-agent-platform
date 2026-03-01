import React from 'react';
import { motion } from 'framer-motion';

const dotVariants = {
  initial: { y: 0 },
  animate: { y: -4 },
};

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex justify-start mb-4"
    >
      <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm border border-slate-100">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              variants={dotVariants}
              initial="initial"
              animate="animate"
              transition={{
                duration: 0.4,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: i * 0.15,
              }}
              className="inline-block w-2 h-2 rounded-full bg-slate-400"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
