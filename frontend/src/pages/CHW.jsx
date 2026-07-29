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

const LogVisitModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    patientName: '', visitType: 'ROUTINE', notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/chw/visits', form);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to log visit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
            <h2 className="text-xl font-bold text-dark">Log Home Visit</h2>
            <p className="text-xs text-muted mt-0.5">Record a community health worker visit</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-muted hover:bg-gray-200">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Patient Name *</label>
            <input name="patientName" value={form.patientName} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark transition-colors"
              placeholder="Full name of patient visited" />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Visit Type *</label>
            <select name="visitType" value={form.visitType} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark transition-colors">
              <option value="ROUTINE">Routine Check</option>
              <option value="FOLLOW_UP">Follow-Up</option>
              <option value="EMERGENCY">Emergency</option>
              <option value="MATERNAL">Maternal Health</option>
              <option value="CHILD">Child Health</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={4}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark transition-colors resize-none"
              placeholder="Observations, follow-up actions, referrals needed..." />
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
              {loading ? 'Logging...' : 'Log Visit'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ── Report Case Modal ────────────────────────────────────────
const ReportCaseModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({ conditionCode: '', districtId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/chw/cases', form);
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
            <h2 className="text-xl font-bold text-dark">Report Case</h2>
            <p className="text-xs text-muted mt-0.5">Flag a condition for surveillance tracking</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-muted hover:bg-gray-200">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Condition Code (ICD-10) *</label>
            <input name="conditionCode" value={form.conditionCode} onChange={handleChange} required
              placeholder="A09"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark transition-colors" />
            <p className="text-xs text-muted mt-1.5">e.g. A09 (diarrhea), J11 (flu), A90 (dengue)</p>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">District</label>
            <input name="districtId" value={form.districtId} onChange={handleChange}
              placeholder="Gasabo"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark transition-colors" />
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

const CHW = () => {
  const [visits, setVisits] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCases, setLoadingCases] = useState(true);
  const [showLog, setShowLog] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const res = await API.get('/chw/visits');
      setVisits(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async () => {
    setLoadingCases(true);
    try {
      const res = await API.get('/chw/cases');
      setCases(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCases(false);
    }
  };

  useEffect(() => { fetchVisits(); fetchCases(); }, []);

  const syncedCount = visits.filter(v => v.synced).length;
  const pendingSync = visits.filter(v => !v.synced).length;

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-black text-dark">CHW Reports</h1>
          <p className="text-muted text-sm mt-1">Community health worker visit logs</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowReport(true)}
            className="px-6 py-3 bg-white border border-border text-dark rounded-xl text-sm font-semibold tracking-wide flex items-center gap-2"
          >
            <span>⚑</span> Report Case
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowLog(true)}
            className="px-6 py-3 bg-dark text-white rounded-xl text-sm font-semibold tracking-wide flex items-center gap-2"
          >
            <span>+</span> Log Visit
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Visits', value: visits.length, dark: false },
          { label: 'Pending Sync', value: pendingSync, dark: true },
          { label: 'Synced', value: syncedCount, dark: false },
          { label: 'Cases Reported', value: cases.length, dark: true },
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

      {/* Visit logs */}
      <p className="text-xl font-bold text-dark mb-4">Visit Logs</p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl overflow-hidden mb-8"
        style={{
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.9)',
        }}
      >
        <div className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-gray-100">
          {['Patient', 'Visit Type', 'Notes', 'Date', 'Sync Status'].map(h => (
            <p key={h} className="text-xs font-semibold tracking-widest uppercase text-muted">{h}</p>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-dark border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted text-sm">Loading visits...</p>
          </div>
        ) : visits.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-4xl mb-3">◐</p>
            <p className="text-dark font-semibold">No visits logged yet</p>
            <p className="text-muted text-sm mt-1">Log your first community visit to get started</p>
          </div>
        ) : (
          visits.map((visit, i) => (
            <motion.div
              key={visit.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-gray-50 hover:bg-white/60 transition-all"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-dark flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{visit.patientName?.charAt(0)}</span>
                </div>
                <p className="text-sm font-medium text-dark truncate">{visit.patientName}</p>
              </div>
              <p className="text-sm text-dark self-center">{visit.visitType?.replace('_', ' ')}</p>
              <p className="text-sm text-muted self-center truncate">{visit.notes || '—'}</p>
              <p className="text-sm text-muted self-center">{formatDate(visit.createdAt)}</p>
              <div className="self-center">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  visit.synced ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {visit.synced ? 'Synced' : 'Pending'}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Reported cases */}
      <p className="text-xl font-bold text-dark mb-4">Reported Cases</p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.9)',
        }}
      >
        <div className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-gray-100">
          {['Condition Code', 'District', 'Reported'].map(h => (
            <p key={h} className="text-xs font-semibold tracking-widest uppercase text-muted">{h}</p>
          ))}
        </div>

        {loadingCases ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-dark border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : cases.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">⚑</p>
            <p className="text-dark font-semibold">No cases reported yet</p>
            <p className="text-muted text-sm mt-1">Report a case above if you observe a notifiable condition</p>
          </div>
        ) : (
          cases.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-gray-50 hover:bg-white/60 transition-all"
            >
              <span className="text-sm font-semibold text-dark self-center px-2.5 py-1 rounded-full bg-dark text-white w-fit">
                {c.conditionCode}
              </span>
              <p className="text-sm text-muted self-center">{c.districtId || '—'}</p>
              <p className="text-sm text-muted self-center">{formatDate(c.reportedAt)}</p>
            </motion.div>
          ))
        )}
      </motion.div>

      <AnimatePresence>
        {showLog && (
          <LogVisitModal
            onClose={() => setShowLog(false)}
            onSuccess={fetchVisits}
          />
        )}
        {showReport && (
          <ReportCaseModal
            onClose={() => setShowReport(false)}
            onSuccess={fetchCases}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default CHW;