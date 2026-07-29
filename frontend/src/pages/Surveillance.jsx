import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import API from '../services/api';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
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

const Surveillance = () => {
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [casesRes, statsRes] = await Promise.all([
        API.get('/surveillance/cases'),
        API.get('/surveillance/stats'),
      ]);
      setCases(casesRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-black text-dark">Surveillance</h1>
        <p className="text-muted text-sm mt-1">Disease monitoring and outbreak detection</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Cases', value: stats?.totalCases ?? 0, dark: false },
          { label: 'Districts Reporting', value: stats?.totalDistricts ?? 0, dark: true },
          { label: 'Active Alerts', value: stats?.alerts?.length ?? 0, dark: stats?.alerts?.length > 0 },
          { label: 'CHW Reports', value: cases.length, dark: false },
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

      {/* Outbreak alerts */}
      {stats?.alerts?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl p-6 mb-6 bg-red-50 border border-red-100"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-red-600 mb-3">
            ⚑ Potential Outbreak Alerts
          </p>
          <div className="space-y-2">
            {stats.alerts.map((a, i) => (
              <div key={i} className="flex items-center justify-between bg-white rounded-xl px-4 py-3">
                <p className="text-sm text-dark">
                  <span className="font-semibold">{a.conditionCode}</span> — {a.count} cases reported in{' '}
                  <span className="font-semibold">{a.district}</span>
                </p>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-red-100 text-red-700">
                  Threshold reached
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Trend chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="rounded-2xl p-6 mb-6"
        style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.9)' }}
      >
        <p className="text-xs font-semibold tracking-widest uppercase text-muted mb-1">Trends</p>
        <p className="text-lg font-bold text-dark mb-4">Cases Reported Over Time</p>
        {stats?.trend?.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.trend}>
              <defs>
                <linearGradient id="caseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111111" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#111111" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#111', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
              <Area type="monotone" dataKey="cases" stroke="#111111" strokeWidth={2} fill="url(#caseGrad)" name="Cases" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted text-sm py-8 text-center">No cases reported yet</p>
        )}
      </motion.div>

      {/* District chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-6 mb-6 bg-dark"
      >
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-1">By District</p>
        <p className="text-lg font-bold text-white mb-4">Cases per District</p>
        {stats?.districtBreakdown?.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.districtBreakdown} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="district" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
              <Bar dataKey="cases" fill="#ffffff" radius={[4, 4, 0, 0]} name="Cases" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-sm py-8 text-center">No cases reported yet</p>
        )}
      </motion.div>

      {/* Cases table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
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
            <div className="w-8 h-8 border-2 border-dark border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted text-sm">Loading cases...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-4xl mb-3">◆</p>
            <p className="text-dark font-semibold">No cases reported yet</p>
            <p className="text-muted text-sm mt-1">Cases reported by CHWs will appear here</p>
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
    </Layout>
  );
};

export default Surveillance;