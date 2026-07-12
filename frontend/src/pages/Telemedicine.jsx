import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
const Telemedicine = () => (
  <Layout>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <h1 className="text-3xl font-black text-dark">Telemedicine</h1>
      <p className="text-muted text-sm mt-1">Browser-based video consultations.</p>
    </motion.div>
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-dark rounded-2xl p-12 flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-4">◈</p>
        <p className="text-white font-semibold">Telemedicine module coming soon</p>
        <p className="text-gray-400 text-sm mt-2">Video consultations and e-prescriptions will appear here.</p>
      </div>
    </motion.div>
  </Layout>
);
export default Telemedicine;