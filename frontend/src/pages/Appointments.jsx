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

const formatTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString('en-RW', {
    hour: '2-digit', minute: '2-digit'
  });
};

const STATUS_STYLES = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-600',
};

// Book Appointment Modal
const BookModal = ({ onClose, onSuccess }) => {
  const [patients, setPatients] = useState([]);
  const [clinicians, setClinicians] = useState([]);
  const [form, setForm] = useState({
    patientId: '', clinicianId: '',
    scheduledAt: '', type: 'IN_PERSON',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, uRes] = await Promise.all([
          API.get('/patients?limit=100'),
          API.get('/admin/users'),
        ]);
        setPatients(pRes.data.data);
        setClinicians(uRes.data.data.filter(u => u.role === 'CLINICIAN'));
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Get clinician profile id from user id
      const clinicianUser = clinicians.find(c => c.id === form.clinicianId);
      const clinicianRes = await API.get(`/admin/users/${form.clinicianId}/clinician`);
      await API.post('/appointments', {
        ...form,
        clinicianId: clinicianRes.data.data.id,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book appointment');
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
            <h2 className="text-xl font-bold text-dark">Book Appointment</h2>
            <p className="text-xs text-muted mt-0.5">Schedule a new patient appointment</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-muted hover:bg-gray-200">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Patient *</label>
            <select name="patientId" value={form.patientId} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark transition-colors">
              <option value="">Select patient</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} — {p.nationalId}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Clinician *</label>
            <select name="clinicianId" value={form.clinicianId} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark transition-colors">
              <option value="">Select clinician</option>
              {clinicians.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Date & Time *</label>
            <input name="scheduledAt" value={form.scheduledAt} onChange={handleChange}
              type="datetime-local" required
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Type *</label>
            <select name="type" value={form.type} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark transition-colors">
              <option value="IN_PERSON">In-Person</option>
              <option value="TELEMEDICINE">Telemedicine</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 text-xs px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-border text-dark text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 rounded-xl bg-dark text-white text-sm font-medium disabled:opacity-50">
              {loading ? 'Booking...' : 'Book Appointment'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Main Appointments Page
const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBook, setShowBook] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterType) params.append('type', filterType);
      const res = await API.get(`/appointments?${params.toString()}`);
      setAppointments(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [filterStatus, filterType]);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  const todayCount = appointments.filter(a => {
    const d = new Date(a.scheduledAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  const scheduledCount = appointments.filter(a => a.status === 'SCHEDULED').length;
  const confirmedCount = appointments.filter(a => a.status === 'CONFIRMED').length;
  const telemedicineCount = appointments.filter(a => a.type === 'TELEMEDICINE').length;

  return (
    <Layout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-black text-dark">Appointments</h1>
          <p className="text-muted text-sm mt-1">{appointments.length} total appointments</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowBook(true)}
          className="px-6 py-3 bg-dark text-white rounded-xl text-sm font-semibold tracking-wide flex items-center gap-2"
        >
          <span>+</span> Book Appointment
        </motion.button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Today's", value: todayCount, dark: true },
          { label: 'Scheduled', value: scheduledCount, dark: false },
          { label: 'Confirmed', value: confirmedCount, dark: true },
          { label: 'Telemedicine', value: telemedicineCount, dark: false },
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
      <div className="flex gap-3 mb-6 flex-wrap">
        {['', 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filterStatus === status
                ? 'bg-dark text-white'
                : 'bg-white border border-border text-muted hover:text-dark'
            }`}
          >
            {status === '' ? 'All Status' : status}
          </button>
        ))}
        <div className="w-px bg-border mx-1" />
        {['', 'IN_PERSON', 'TELEMEDICINE'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filterType === type
                ? 'bg-dark text-white'
                : 'bg-white border border-border text-muted hover:text-dark'
            }`}
          >
            {type === '' ? 'All Types' : type === 'IN_PERSON' ? 'In-Person' : 'Telemedicine'}
          </button>
        ))}
      </div>

      {/* Appointments list */}
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
          {['Patient', 'Clinician', 'Date', 'Time', 'Type', 'Status'].map(h => (
            <p key={h} className="text-xs font-semibold tracking-widest uppercase text-muted">{h}</p>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-dark border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted text-sm">Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-4xl mb-3">◷</p>
            <p className="text-dark font-semibold">No appointments found</p>
            <p className="text-muted text-sm mt-1">Book your first appointment to get started</p>
          </div>
        ) : (
          appointments.map((apt, i) => (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-gray-50 hover:bg-white/60 transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-dark flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {apt.patient?.user?.name?.charAt(0)}
                  </span>
                </div>
                <p className="text-sm font-medium text-dark truncate">{apt.patient?.user?.name}</p>
              </div>
              <p className="text-sm text-muted self-center truncate">Dr. {apt.clinician?.user?.name}</p>
              <p className="text-sm text-dark self-center">{formatDate(apt.scheduledAt)}</p>
              <p className="text-sm text-muted self-center">{formatTime(apt.scheduledAt)}</p>
              <span className={`self-center text-xs px-2.5 py-1 rounded-full font-medium w-fit ${
                apt.type === 'TELEMEDICINE' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {apt.type === 'IN_PERSON' ? 'In-Person' : 'Telemedicine'}
              </span>
              <div className="self-center flex items-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[apt.status]}`}>
                  {apt.status}
                </span>
                {apt.status === 'SCHEDULED' && (
                  <button
                    onClick={() => updateStatus(apt.id, 'CONFIRMED')}
                    className="text-xs text-green-600 hover:text-green-700 font-medium"
                  >
                    Confirm
                  </button>
                )}
                {apt.status === 'CONFIRMED' && (
                  <button
                    onClick={() => updateStatus(apt.id, 'COMPLETED')}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Complete
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      <AnimatePresence>
        {showBook && (
          <BookModal
            onClose={() => setShowBook(false)}
            onSuccess={fetchAppointments}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Appointments;