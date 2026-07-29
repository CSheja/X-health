import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/layout/Layout';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-RW', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

// ── Add/Update Stock Modal ──────────────────────────────────
const StockModal = ({ onClose, onSuccess }) => {
  const [mode, setMode] = useState('add');
  const [form, setForm] = useState({
    medication: '', quantity: '', unit: '', reorderLevel: '10'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/pharmacy/stock', {
        medication: form.medication,
        quantity: parseInt(form.quantity),
        unit: form.unit,
        reorderLevel: parseInt(form.reorderLevel),
        mode,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl p-8"
        style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(32px)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.15)',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-dark">Manage Stock</h2>
            <p className="text-xs text-muted mt-0.5">Add a new medication or update an existing one</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-muted hover:bg-gray-200">
            ✕
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
          {[
            { value: 'add', label: 'Restock' },
            { value: 'set', label: 'Set Exact Count' },
          ].map(m => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(m.value)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                mode === m.value ? 'bg-dark text-white shadow-sm' : 'text-muted hover:text-dark'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted -mt-4 mb-6">
          {mode === 'add'
            ? 'Adds this quantity to the current stock — use this when a new shipment arrives.'
            : 'Sets stock to exactly this number — use this to correct the count after a physical inventory check.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">
              Medication Name *
            </label>
            <input name="medication" value={form.medication} onChange={handleChange} required
              placeholder="Amoxicillin 500mg"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">
                {mode === 'add' ? 'Quantity Received *' : 'Exact Quantity *'}
              </label>
              <input name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} required
                placeholder={mode === 'add' ? '50' : '120'}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark" />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">
                Unit
              </label>
              <input name="unit" value={form.unit} onChange={handleChange}
                placeholder="capsules"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">
              Reorder Level
            </label>
            <input name="reorderLevel" type="number" min="0" value={form.reorderLevel} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark" />
            <p className="text-xs text-muted mt-1.5">You'll want to flag stock below this level</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 text-xs px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-border text-dark text-sm font-medium hover:bg-gray-50">
              Cancel
            </button>
            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 rounded-xl bg-dark text-white text-sm font-medium disabled:opacity-50">
              {loading ? 'Saving...' : mode === 'add' ? 'Add to Stock' : 'Set Count'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const Pharmacy = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('prescriptions');

  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingRx, setLoadingRx] = useState(true);
  const [filterDispensed, setFilterDispensed] = useState('');
  const [dispensing, setDispensing] = useState(null);

  const [stock, setStock] = useState([]);
  const [loadingStock, setLoadingStock] = useState(true);
  const [showStockModal, setShowStockModal] = useState(false);

  const fetchPrescriptions = async () => {
    setLoadingRx(true);
    try {
      const params = new URLSearchParams();
      if (filterDispensed !== '') params.append('dispensed', filterDispensed);
      const res = await API.get(`/pharmacy/prescriptions?${params.toString()}`);
      setPrescriptions(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRx(false);
    }
  };

  const fetchStock = async () => {
    setLoadingStock(true);
    try {
      const res = await API.get('/pharmacy/stock');
      setStock(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStock(false);
    }
  };

  useEffect(() => { fetchPrescriptions(); }, [filterDispensed]);
  useEffect(() => { fetchStock(); }, []);

  const handleDispense = async (id) => {
    setDispensing(id);
    try {
      await API.put(`/pharmacy/prescriptions/${id}/dispense`);
      fetchPrescriptions();
      fetchStock();
    } catch (err) {
      console.error(err);
    } finally {
      setDispensing(null);
    }
  };

  const pendingCount = prescriptions.filter(p => !p.dispensed).length;
  const dispensedCount = prescriptions.filter(p => p.dispensed).length;
  const lowStockCount = stock.filter(s => s.quantity <= s.reorderLevel).length;

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

        <div className="flex bg-gray-100 rounded-2xl p-1">
          {['prescriptions', 'stock'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-200 ${
                activeTab === tab ? 'bg-dark text-white shadow-sm' : 'text-muted hover:text-dark'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Prescriptions tab */}
      {activeTab === 'prescriptions' && (
        <>
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

            {loadingRx ? (
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
        </>
      )}

      {/* Stock tab */}
      {activeTab === 'stock' && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Medications Tracked', value: stock.length, dark: false },
              { label: 'Low Stock', value: lowStockCount, dark: true },
              { label: 'Total Units', value: stock.reduce((acc, s) => acc + s.quantity, 0), dark: false },
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

          {user?.role !== 'SYSADMIN' && (
            <div className="flex justify-end mb-6">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setShowStockModal(true)}
                className="px-6 py-3 bg-dark text-white rounded-xl text-sm font-semibold tracking-wide flex items-center gap-2"
              >
                <span>+</span> Add / Update Stock
              </motion.button>
            </div>
          )}

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
            <div className={`grid ${user?.role === 'SYSADMIN' ? 'grid-cols-5' : 'grid-cols-4'} gap-4 px-6 py-4 border-b border-gray-100`}>
              {user?.role === 'SYSADMIN' && (
                <p className="text-xs font-semibold tracking-widest uppercase text-muted">Facility</p>
              )}
              {['Medication', 'Quantity', 'Unit', 'Status'].map(h => (
                <p key={h} className="text-xs font-semibold tracking-widest uppercase text-muted">{h}</p>
              ))}
            </div>

            {loadingStock ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-2 border-dark border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-muted text-sm">Loading stock...</p>
              </div>
            ) : stock.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-4xl mb-3">◉</p>
                <p className="text-dark font-semibold">No stock tracked yet</p>
                <p className="text-muted text-sm mt-1">
                  {user?.role === 'SYSADMIN'
                    ? 'No facility has added stock yet'
                    : 'Add your first medication above'}
                </p>
              </div>
            ) : (
              stock.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`grid ${user?.role === 'SYSADMIN' ? 'grid-cols-5' : 'grid-cols-4'} gap-4 px-6 py-4 border-b border-gray-50 hover:bg-white/60 transition-all duration-200`}
                >
                  {user?.role === 'SYSADMIN' && (
                    <p className="text-sm text-muted self-center truncate">{s.facility?.name}</p>
                  )}
                  <p className="text-sm font-semibold text-dark self-center">{s.medication}</p>
                  <p className="text-sm text-dark self-center">{s.quantity}</p>
                  <p className="text-sm text-muted self-center">{s.unit || '—'}</p>
                  <div className="self-center">
                    {s.quantity <= s.reorderLevel ? (
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-red-100 text-red-600">
                        Low Stock
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-100 text-green-700">
                        In Stock
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </>
      )}

      <AnimatePresence>
        {showStockModal && (
          <StockModal
            onClose={() => setShowStockModal(false)}
            onSuccess={fetchStock}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Pharmacy;