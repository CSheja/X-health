import React from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import SwarmEngine from '../ui/SwarmEngine';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #dddddb 0%, #d5d5d3 50%, #d0d0ce 100%)' }}>

      {/* Ambient swarm in background — very subtle */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: '-100px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '600px',
          height: '600px',
          opacity: 0.12,
          zIndex: 0,
        }}
      >
        <SwarmEngine height="600px" autoRotate={true} initialShape="head" />
      </div>

      <Sidebar />

      <div className="flex-1 flex flex-col ml-64 overflow-hidden relative z-10">
        <Navbar />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex-1 overflow-y-auto p-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default Layout;