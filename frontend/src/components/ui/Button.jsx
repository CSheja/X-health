import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, onClick, variant = 'dark', type = 'button', disabled = false, className = '' }) => {
  const variants = {
    dark: 'bg-dark text-white hover:bg-darkcard',
    light: 'bg-white text-dark border border-border hover:bg-gray-50',
    ghost: 'bg-transparent text-dark border border-dark hover:bg-dark hover:text-white',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        px-6 py-3 rounded-xl font-medium text-sm
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
};

export default Button;