import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ label, value, sub, dark = false, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -6 }}
    className={`rounded-2xl p-6 ${dark ? 'bg-dark text-white' : 'bg-white text-dark border border-border'}`}
  >
    <p className={`text-xs font-semibold tracking-widest uppercase mb-3 ${dark ? 'text-gray-400' : 'text-muted'}`}>
      {label}
    </p>
    <p className={`text-4xl font-black ${dark ? 'text-white' : 'text-dark'}`}>{value}</p>
    {sub && <p className={`text-xs mt-2 ${dark ? 'text-gray-500' : 'text-muted'}`}>{sub}</p>}
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0, todaysAppointments: 0, activeChws: 0, totalFacilities: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [patientsRes, appointmentsRes, usersRes, facilitiesRes] = await Promise.all([
          API.get('/patients?limit=1'),
          API.get('/appointments?limit=1'),
          API.get('/admin/users'),
          API.get('/clinician/facilities'),
        ]);

        const today = new Date().toDateString();
        const allAppointments = await API.get('/appointments?limit=1000');
        const todaysCount = allAppointments.data.data.filter(
          a => new Date(a.scheduledAt).toDateString() === today
        ).length;

        setStats({
          totalPatients: patientsRes.data.pagination?.total || 0,
          todaysAppointments: todaysCount,
          activeChws: usersRes.data.data.filter(u => u.role === 'CHW').length,
          totalFacilities: facilitiesRes.data.data.length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <Layout>
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

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-dark border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Patients" value={stats.totalPatients} dark delay={0} />
          <StatCard label="Today's Appointments" value={stats.todaysAppointments} delay={0.1} />
          <StatCard label="Active CHWs" value={stats.activeChws} dark delay={0.2} />
          <StatCard label="Total Facilities" value={stats.totalFacilities} delay={0.3} />
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;