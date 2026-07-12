import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

const areaData = [
  { month: 'Jan', patients: 120, appointments: 80 },
  { month: 'Feb', patients: 180, appointments: 140 },
  { month: 'Mar', patients: 150, appointments: 110 },
  { month: 'Apr', patients: 220, appointments: 190 },
  { month: 'May', patients: 280, appointments: 240 },
  { month: 'Jun', patients: 260, appointments: 210 },
  { month: 'Jul', patients: 340, appointments: 290 },
];

const barData = [
  { day: 'Mon', visits: 32 },
  { day: 'Tue', visits: 45 },
  { day: 'Wed', visits: 28 },
  { day: 'Thu', visits: 60 },
  { day: 'Fri', visits: 52 },
  { day: 'Sat', visits: 18 },
  { day: 'Sun', visits: 10 },
];

const pieData = [
  { name: 'In-Person', value: 58 },
  { name: 'Telemedicine', value: 28 },
  { name: 'Emergency', value: 14 },
];

const PIE_COLORS = ['#111111', '#555555', '#aaaaaa'];

const activity = [
  { time: '09:14', text: 'New patient registered', sub: 'Jean Baptiste M.' },
  { time: '09:32', text: 'Appointment confirmed', sub: 'Dr. Uwase — Telemedicine' },
  { time: '10:05', text: 'Prescription issued', sub: 'Amoxicillin 500mg' },
  { time: '10:41', text: 'CHW case reported', sub: 'Sector: Kimironko' },
  { time: '11:20', text: 'Referral sent', sub: 'CHUK — Cardiology' },
  { time: '11:58', text: 'Lab result uploaded', sub: 'Patient #4821' },
];

const StatCard = ({ label, value, sub, dark = false, delay = 0 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (isNaN(end)) return;
    const duration = 1500;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -6, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}
      className={`rounded-2xl p-6 transition-all duration-300 ${
        dark ? 'bg-dark text-white' : 'bg-white text-dark border border-border'
      }`}
    >
      <p className={`text-xs font-semibold tracking-widest uppercase mb-3 ${dark ? 'text-gray-400' : 'text-muted'}`}>
        {label}
      </p>
      <p className={`text-4xl font-black ${dark ? 'text-white' : 'text-dark'}`}>
        {isNaN(parseInt(value)) ? value : count.toLocaleString()}
      </p>
      <p className={`text-xs mt-2 ${dark ? 'text-gray-500' : 'text-muted'}`}>{sub}</p>
    </motion.div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Layout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-black text-dark">
          Good morning, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-muted text-sm mt-1">
          Here is what is happening across your facilities today.
        </p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Patients" value="4821" sub="+12% this month" dark delay={0} />
        <StatCard label="Today's Appointments" value="64" sub="8 pending confirmation" delay={0.1} />
        <StatCard label="Active CHWs" value="218" sub="Across 12 districts" dark delay={0.2} />
        <StatCard label="Open Referrals" value="37" sub="5 urgent" delay={0.3} />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        {/* Area chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 border border-border"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-muted mb-1">Patient Growth</p>
          <p className="text-xl font-bold text-dark mb-6">Patients & Appointments</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="patientGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111111" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#111111" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="apptGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#888888" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#888888" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#111', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="patients" stroke="#111111" strokeWidth={2} fill="url(#patientGrad)" name="Patients" />
              <Area type="monotone" dataKey="appointments" stroke="#888888" strokeWidth={2} fill="url(#apptGrad)" name="Appointments" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-dark rounded-2xl p-6 text-white"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-1">Breakdown</p>
          <p className="text-xl font-bold text-white mb-4">Visit Types</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={PIE_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-gray-400">{item.name}</span>
                </div>
                <span className="text-white font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.8)' }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-muted mb-1">Weekly</p>
          <p className="text-xl font-bold text-dark mb-6">Daily Visit Volume</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#111', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                cursor={{ fill: '#f5f5f5' }}
              />
              <Bar dataKey="visits" fill="#111111" radius={[6, 6, 0, 0]} name="Visits" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl p-6 border border-border"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-muted mb-1">Live</p>
          <p className="text-xl font-bold text-dark mb-4">Activity Feed</p>
          <div className="space-y-4">
            {activity.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i + 0.7 }}
                className="flex gap-3 items-start"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-dark mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-dark truncate">{item.text}</p>
                  <p className="text-xs text-muted truncate">{item.sub}</p>
                </div>
                <span className="text-xs text-muted flex-shrink-0">{item.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Dashboard;