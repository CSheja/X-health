import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/layout/Layout';
import API from '../services/api';

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-RW', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

const Pharmacy = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDispensed, setFilterDispensed] = useState('');
  const [dispensing, setDispensing] = useState(null);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterDispensed !== '') params.append('dispensed', filterDispensed);
      const res = await API.get(`/pharmacy/prescriptions?${params.toString()}`);
      setPrescriptions(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrescriptions(); }, [filterDispensed]);

  const handleDispense = async (id) => {
    setDispensing(id);
    try {
      await API.put(`/pharmacy/prescriptions/${id}/dispense`);
      fetchPrescriptions();
    } catch (err) {
      console.error(err);
    } finally {
      setDispensing(null);
    }
  };

  const pendingCount = prescriptions.filter(p => !p.dispensed).length;
  const dispensedCount = prescriptions.filter(p => p.dispensed).length;

  return (
    <Layout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-black text-dark">Pharmacy</h1>
          <p className="text-muted text-sm mt-1">
            Manage prescriptions and dispensing
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Prescriptions', value: prescriptions.length, dark: false },
          { label: 'Pending Dispensing', value: pendingCount, dark: true },
          { label: 'Dispensed', value: dispensedCount, dark: false },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-2xl p-5 ${s.dark ? 'bg-dark text-white' : 'bg-white border border-border'}`}
          >
            <p className={`text-xs font-semibold tracking-widest uppercase mb-2 ${s.dark ? 'text-gray-400' : 'text-muted'}`}>
              {s.label}
            </p>
            <p className={`text-3xl font-black ${s.dark ? 'text-white' : 'text-dark'}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        {[
          { label: 'All', value: '' },
          { label: 'Pending', value: 'false' },
          { label: 'Dispensed', value: 'true' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilterDispensed(f.value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filterDispensed === f.value
                ? 'bg-dark text-white'
                : 'bg-white border border-border text-muted hover:text-dark'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Prescriptions list */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.9)',
        }}
      >
        <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-gray-100">
          {['Patient', 'Medication', 'Dose', 'Frequency', 'Duration', 'Status'].map(h => (
            <p key={h} className="text-xs font-semibold tracking-widest uppercase text-muted">{h}</p>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-dark border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted text-sm">Loading prescriptions...</p>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-4xl mb-3">◉</p>
            <p className="text-dark font-semibold">No prescriptions found</p>
            <p className="text-muted text-sm mt-1">
              Prescriptions will appear here once clinicians issue them
            </p>
          </div>
        ) : (
          prescriptions.map((rx, i) => (
            <motion.div
              key={rx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-gray-50 hover:bg-white/60 transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-dark flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {rx.visit?.ehr?.patient?.user?.name?.charAt(0)}
                  </span>
                </div>
                <p className="text-sm font-medium text-dark truncate">
                  {rx.visit?.ehr?.patient?.user?.name}
                </p>
              </div>
              <p className="text-sm font-semibold text-dark self-center">{rx.medication}</p>
              <p className="text-sm text-muted self-center">{rx.dose}</p>
              <p className="text-sm text-muted self-center">{rx.frequency}</p>
              <p className="text-sm text-muted self-center">{rx.duration}</p>
              <div className="self-center flex items-center gap-2">
                {rx.dispensed ? (
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-100 text-green-700">
                    Dispensed
                  </span>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDispense(rx.id)}
                    disabled={dispensing === rx.id}
                    className="text-xs px-3 py-1.5 rounded-lg bg-dark text-white font-medium disabled:opacity-50"
                  >
                    {dispensing === rx.id ? 'Dispensing...' : 'Dispense'}
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </Layout>
  );
};

export default Pharmacy;