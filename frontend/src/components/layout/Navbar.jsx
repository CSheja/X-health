import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/patients': 'Patients',
  '/appointments': 'Appointments',
  '/telemedicine': 'Telemedicine',
  '/pharmacy': 'Pharmacy',
  '/surveillance': 'Surveillance',
  '/chw': 'CHW Reports',
};

const Navbar = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'X-Health';
  const now = new Date();
  const timeString = now.toLocaleDateString('en-RW', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-16 flex items-center justify-between px-8"
style={{
  background: 'rgba(220,220,218,0.55)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(255,255,255,0.3)',
}}
    >
      <div>
        <h2 className="text-lg font-semibold text-dark tracking-tight">{title}</h2>
        <p className="text-xs text-muted">{timeString}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <motion.div
          whileFocus={{ scale: 1.02 }}
          className="flex items-center gap-2 bg-white border border-border rounded-xl px-4 py-2"
        >
          <span className="text-muted text-sm">⌕</span>
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm outline-none text-dark placeholder-muted w-40"
          />
        </motion.div>

        {/* Notification bell */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center text-dark"
        >
          <span className="text-sm">◎</span>
        </motion.button>
      </div>
    </motion.header>
  );
};

export default Navbar;