import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
const Pharmacy = () => (
  <Layout>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <h1 className="text-3xl font-black text-dark">Pharmacy</h1>
      <p className="text-muted text-sm mt-1">Prescription management and stock monitoring.</p>
    </motion.div>
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-border p-12 flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-4">◉</p>
        <p className="text-dark font-semibold">Pharmacy module coming soon</p>
        <p className="text-muted text-sm mt-2">Dispensing, stock alerts, and prescriptions will appear here.</p>
      </div>
    </motion.div>
  </Layout>
);
export default Pharmacy;