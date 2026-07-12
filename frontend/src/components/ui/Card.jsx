import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, dark = false, className = '', hover = true, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -6, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' } : {}}
      className={`
        rounded-2xl p-6
        transition-all duration-300
        ${dark
          ? 'bg-dark text-white border border-darkcard'
          : 'bg-white text-dark border border-border shadow-sm'
        }
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default Card;