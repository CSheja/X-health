import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/layout/Layout';
import API from '../services/api';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-RW', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

const CONDITION_COLORS = {
  MALARIA: 'bg-red-100 text-red-700',
  TUBERCULOSIS: 'bg-orange-100 text-orange-700',
  COVID19: 'bg-blue-100 text-blue-700',
  CHOLERA: 'bg-yellow-100 text-yellow-700',
  PNEUMONIA: 'bg-purple-100 text-purple-700',
  OTHER: 'bg-gray-100 text-gray-700',
};

const trendData = [
  { month: 'Jan', malaria: 12, tb: 4, covid: 8 },
  { month: 'Feb', malaria: 18, tb: 6, covid: 5 },
  { month: 'Mar', malaria: 8, tb: 3, covid: 12 },
  { month: 'Apr', malaria: 22, tb: 7, covid: 3 },
  { month: 'May', malaria: 15, tb: 5, covid: 6 },
  { month: 'Jun', malaria: 10, tb: 4, covid: 4 },
  { month: 'Jul', malaria: 20, tb: 8, covid: 7 },
];

const districtData = [
  { district: 'Kigali', cases: 45 },
  { district: 'Huye', cases: 28 },
  { district: 'Musanze', cases: 32 },
  { district: 'Rubavu', cases: 19 },
  { district: 'Nyagatare', cases: 24 },
];

const ReportModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    conditionCode: 'MALARIA', districtId: '', status: 'REPORTED'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/surveillance/cases', form);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to report case');
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
            <h2 className="text-xl font-bold text-dark">Report Disease Case</h2>
            <p className="text-xs text-muted mt-0.5">Submit a new surveillance case</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-muted hover:bg-gray-200">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Condition *</label>
            <select name="conditionCode" value={form.conditionCode} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark">
              {['MALARIA', 'TUBERCULOSIS', 'COVID19', 'CHOLERA', 'PNEUMONIA', 'OTHER'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">District</label>
            <input name="districtId" value={form.districtId} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark"
              placeholder="e.g. Kigali, Huye, Musanze" />
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
              {loading ? 'Reporting...' : 'Report Case'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const Surveillance = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await API.get('/surveillance/cases');
      setCases(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCases(); }, []);

  const totalCases = cases.length;
  const activeCases = cases.filter(c => c.status === 'REPORTED').length;

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-black text-dark">Surveillance</h1>
          <p className="text-muted text-sm mt-1">Disease monitoring and outbreak detection</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setShowReport(true)}
          className="px-6 py-3 bg-dark text-white rounded-xl text-sm font-semibold tracking-wide flex items-center gap-2"
        >
          <span>+</span> Report Case
        </motion.button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Cases', value: totalCases, dark: false },
          { label: 'Active Reports', value: activeCases, dark: true },
          { label: 'Districts', value: 30, dark: false },
          { label: 'Alerts', value: 0, dark: true },
        ].map((s, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
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

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.9)' }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-muted mb-1">Trends</p>
          <p className="text-lg font-bold text-dark mb-4">Disease Cases by Month</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="malariaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111111" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#111111" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background: '#111', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}/>
              <Area type="monotone" dataKey="malaria" stroke="#111111" strokeWidth={2} fill="url(#malariaGrad)" name="Malaria"/>
              <Area type="monotone" dataKey="tb" stroke="#888888" strokeWidth={2} fill="none" name="TB"/>
              <Area type="monotone" dataKey="covid" stroke="#aaaaaa" strokeWidth={2} fill="none" name="COVID-19"/>
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-6 bg-dark"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-1">By District</p>
          <p className="text-lg font-bold text-white mb-4">Cases per District</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={districtData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false}/>
              <XAxis dataKey="district" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', color: '#fff', fontSize: '12px' }}/>
              <Bar dataKey="cases" fill="#ffffff" radius={[4, 4, 0, 0]} name="Cases"/>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Cases table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.9)' }}
      >
        <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-gray-100">
          {['Condition', 'District', 'Status', 'Reported'].map(h => (
            <p key={h} className="text-xs font-semibold tracking-widest uppercase text-muted">{h}</p>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-dark border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
            <p className="text-muted text-sm">Loading cases...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-4xl mb-3">◆</p>
            <p className="text-dark font-semibold">No cases reported yet</p>
            <p className="text-muted text-sm mt-1">Report a disease case to begin surveillance tracking</p>
          </div>
        ) : (
          cases.map((c, i) => (
            <motion.div key={c.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-gray-50 hover:bg-white/60 transition-all"
            >
              <span className={`self-center text-xs px-2.5 py-1 rounded-full font-medium w-fit ${CONDITION_COLORS[c.conditionCode] || CONDITION_COLORS.OTHER}`}>
                {c.conditionCode}
              </span>
              <p className="text-sm text-dark self-center">{c.districtId || '—'}</p>
              <span className={`self-center text-xs px-2.5 py-1 rounded-full font-medium w-fit ${
                c.status === 'REPORTED' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
              }`}>
                {c.status}
              </span>
              <p className="text-sm text-muted self-center">{formatDate(c.reportedAt)}</p>
            </motion.div>
          ))
        )}
      </motion.div>

      <AnimatePresence>
        {showReport && (
          <ReportModal onClose={() => setShowReport(false)} onSuccess={fetchCases} />
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Surveillance;