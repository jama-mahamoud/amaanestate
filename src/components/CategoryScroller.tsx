import React from 'react';
import { motion } from 'framer-motion';

const categories = [
  { name: 'Houses' },
  { name: 'Apartments' },
  { name: 'Land' },
  { name: 'Vehicles' },
  { name: 'Commercial' },
];

const CategoryScroller = () => {
  return (
    <div className="w-full overflow-hidden py-4">
      <motion.div
        className="flex gap-8 items-center"
        initial={{ x: 0 }}
        animate={{ x: '-50%' }}
        transition={{
          duration: 20,
          ease: 'linear',
          repeat: Infinity,
        }}
      >
        {[...categories, ...categories].map((cat, index) => (
          <button
            key={index}
            className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors whitespace-nowrap"
          >
            <span className="text-sm font-medium text-white">{cat.name}</span>
          </button>
        ))}
      </motion.div>
    </div>
  );
};

export default CategoryScroller;
