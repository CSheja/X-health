import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
const CHW = () => (
  <Layout>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <h1 className="text-3xl font-black text-dark">CHW Reports</h1>
      <p className="text-muted text-sm mt-1">Community health worker field reports and case tracking.</p>
    </motion.div>
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-border p-12 flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-4">◐</p>
        <p className="text-dark font-semibold">CHW module coming soon</p>
        <p className="text-muted text-sm mt-2">Home visit logs, case reports, and coverage maps will appear here.</p>
      </div>
    </motion.div>
  </Layout>
);
export default CHW;