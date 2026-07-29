import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ label, value, sub, dark = false, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`rounded-2xl p-6 ${dark ? 'bg-dark text-white' : 'bg-white border border-border'}`}
  >
    <p className={`text-xs font-semibold tracking-widest uppercase mb-2 ${dark ? 'text-gray-400' : 'text-muted'}`}>
      {label}
    </p>
    <p className={`text-4xl font-black ${dark ? 'text-white' : 'text-dark'}`}>{value}</p>
    {sub && <p className={`text-xs mt-2 ${dark ? 'text-gray-500' : 'text-muted'}`}>{sub}</p>}
  </motion.div>
);

const FacilityAdmin = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, staffRes] = await Promise.all([
          API.get('/admin/facility-stats'),
          API.get('/admin/users'),
        ]);
        setStats(statsRes.data.data);
        setStaff(staffRes.data.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load facility data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-black text-dark">
          Good day, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-muted text-sm mt-1">Here is your facility's overview.</p>
      </motion.div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-500 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-dark border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Facility Staff" value={stats.staffCount} dark delay={0} />
            <StatCard label="Today's Appointments" value={stats.appointmentsToday} delay={0.1} />
            <StatCard label="Total Appointments" value={stats.appointmentsTotal} dark delay={0.2} />
            <StatCard label="Total Visits" value={stats.visitCount} delay={0.3} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.9)',
            }}
          >
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-xl font-bold text-dark">Facility Staff</p>
              <p className="text-xs text-muted mt-0.5">{staff.length} staff members at your facility</p>
            </div>

            <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-gray-100">
              {['Name', 'Email', 'Role', 'Status'].map(h => (
                <p key={h} className="text-xs font-semibold tracking-widest uppercase text-muted">{h}</p>
              ))}
            </div>

            {staff.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-muted text-sm">No staff assigned to this facility yet.</p>
              </div>
            ) : (
              staff.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-dark flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{s.name.charAt(0)}</span>
                    </div>
                    <p className="text-sm font-semibold text-dark truncate">{s.name}</p>
                  </div>
                  <p className="text-sm text-muted self-center truncate">{s.email}</p>
                  <p className="text-sm text-dark self-center">{s.role}</p>
                  <span className={`self-center text-xs px-2.5 py-1 rounded-full font-medium w-fit ${
                    s.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {s.status}
                  </span>
                </motion.div>
              ))
            )}
          </motion.div>
        </>
      ) : null}
    </Layout>
  );
};

export default FacilityAdmin;