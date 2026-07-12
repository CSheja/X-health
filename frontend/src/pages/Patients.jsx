import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/layout/Layout';
import API from '../services/api';

const genderLabel = (g) => {
  if (!g) return '—';
  return g.charAt(0).toUpperCase() + g.slice(1).toLowerCase();
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-RW', { year: 'numeric', month: 'short', day: 'numeric' });
};

const calculateAge = (dob) => {
  if (!dob) return '—';
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)) + ' yrs';
};

// ── Register Patient Modal ─────────────────────────────────
const RegisterModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: '', nationalId: '', email: '', phone: '',
    dateOfBirth: '', gender: '', insuranceId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/patients', form);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
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
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl p-8"
        style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(32px)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.15)',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-dark">Register Patient</h2>
            <p className="text-xs text-muted mt-0.5">Create a new patient record and EHR</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-muted hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark transition-colors"
                placeholder="Jean Baptiste" />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">National ID *</label>
              <input name="nationalId" value={form.nationalId} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark transition-colors"
                placeholder="1 1990 8 0123456 7 89" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Email</label>
              <input name="email" value={form.email} onChange={handleChange} type="email"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark transition-colors"
                placeholder="patient@email.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark transition-colors"
                placeholder="+250 7XX XXX XXX" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Date of Birth</label>
              <input name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} type="date"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark transition-colors">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Insurance ID (Mutuelle)</label>
            <input name="insuranceId" value={form.insuranceId} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark transition-colors"
              placeholder="MUT-XXXX-XXXX" />
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
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 rounded-xl bg-dark text-white text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register Patient'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ── Patient Detail Panel ───────────────────────────────────
const PatientPanel = ({ patient, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await API.get(`/patients/${patient.id}`);
        setDetail(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [patient.id]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.3 }}
      className="fixed right-0 top-0 h-full w-full max-w-md z-40 overflow-y-auto"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(32px)',
        borderLeft: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.08)',
      }}
    >
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-muted tracking-widest uppercase mb-1">Patient Record</p>
            <h2 className="text-xl font-bold text-dark">{patient.name}</h2>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-muted hover:bg-gray-200 transition-colors">
            ✕
          </button>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-dark flex items-center justify-center">
            <span className="text-white text-2xl font-bold">{patient.name.charAt(0)}</span>
          </div>
          <div>
            <p className="font-semibold text-dark">{patient.name}</p>
            <p className="text-sm text-muted">{patient.nationalId}</p>
            <p className="text-xs text-muted mt-0.5">{patient.email}</p>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { label: 'Age', value: calculateAge(patient.dateOfBirth) },
            { label: 'Gender', value: genderLabel(patient.gender) },
            { label: 'Date of Birth', value: formatDate(patient.dateOfBirth) },
            { label: 'Phone', value: patient.phone || '—' },
            { label: 'Insurance', value: patient.insuranceId || '—' },
            { label: 'EHR ID', value: patient.ehrId ? patient.ehrId.slice(0, 8) + '...' : '—' },
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-muted tracking-widest uppercase mb-1">{item.label}</p>
              <p className="text-sm font-semibold text-dark">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Recent visits */}
        {loading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-dark border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-xs font-semibold tracking-widest uppercase text-dark mb-3">Recent Visits</p>
              {detail?.ehr?.visits?.length > 0 ? (
                <div className="space-y-3">
                  {detail.ehr.visits.slice(0, 3).map((visit, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-dark">{visit.visitType}</p>
                        <p className="text-xs text-muted">{formatDate(visit.visitDate)}</p>
                      </div>
                      <p className="text-xs text-muted">Dr. {visit.clinician?.user?.name || '—'}</p>
                      {visit.icd10Code && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-dark text-white text-xs rounded-full">
                          {visit.icd10Code}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">No visits recorded yet.</p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-dark mb-3">Upcoming Appointments</p>
              {detail?.appointments?.length > 0 ? (
                <div className="space-y-3">
                  {detail.appointments.slice(0, 3).map((apt, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-dark">{apt.type}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                          apt.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{apt.status}</span>
                      </div>
                      <p className="text-xs text-muted">{formatDate(apt.scheduledAt)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">No appointments scheduled.</p>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

// ── Main Patients Page ─────────────────────────────────────
const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });

  const fetchPatients = async (q = '', page = 1) => {
    setLoading(true);
    try {
      const res = await API.get(`/patients?search=${q}&page=${page}&limit=20`);
      setPatients(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchPatients(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <Layout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-black text-dark">Patients</h1>
          <p className="text-muted text-sm mt-1">
            {pagination.total} patients registered
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowRegister(true)}
          className="px-6 py-3 bg-dark text-white rounded-xl text-sm font-semibold tracking-wide flex items-center gap-2"
        >
          <span>+</span> Register Patient
        </motion.button>
      </motion.div>

      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div
          className="flex items-center gap-3 px-5 py-3 rounded-2xl max-w-md"
          style={{
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.9)',
          }}
        >
          <span className="text-muted">⌕</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, national ID, insurance..."
            className="bg-transparent text-dark text-sm outline-none flex-1 placeholder-muted"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-muted hover:text-dark text-xs">✕</button>
          )}
        </div>
      </motion.div>

      {/* Patient table */}
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
        {/* Table header */}
        <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-gray-100">
          {['Name', 'National ID', 'Age', 'Gender', 'Insurance', 'Registered'].map((h) => (
            <p key={h} className="text-xs font-semibold tracking-widest uppercase text-muted">{h}</p>
          ))}
        </div>

        {/* Table rows */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-dark border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted text-sm">Loading patients...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-4xl mb-3">◎</p>
            <p className="text-dark font-semibold">No patients found</p>
            <p className="text-muted text-sm mt-1">
              {search ? 'Try a different search term' : 'Register your first patient to get started'}
            </p>
          </div>
        ) : (
          <div>
            {patients.map((patient, i) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedPatient(patient)}
                className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-gray-50 hover:bg-white/60 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-dark flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{patient.name.charAt(0)}</span>
                  </div>
                  <p className="text-sm font-semibold text-dark truncate group-hover:text-dark">{patient.name}</p>
                </div>
                <p className="text-sm text-muted self-center font-mono">{patient.nationalId}</p>
                <p className="text-sm text-dark self-center">{calculateAge(patient.dateOfBirth)}</p>
                <p className="text-sm text-dark self-center">{genderLabel(patient.gender)}</p>
                <p className="text-sm text-muted self-center">{patient.insuranceId || '—'}</p>
                <p className="text-sm text-muted self-center">{formatDate(patient.createdAt)}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-xs text-muted">
              Showing {patients.length} of {pagination.total} patients
            </p>
            <div className="flex gap-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => fetchPatients(search, page)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                    page === pagination.page
                      ? 'bg-dark text-white'
                      : 'bg-gray-100 text-muted hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Register modal */}
      <AnimatePresence>
        {showRegister && (
          <RegisterModal
            onClose={() => setShowRegister(false)}
            onSuccess={() => fetchPatients(search)}
          />
        )}
      </AnimatePresence>

      {/* Patient detail panel */}
      <AnimatePresence>
        {selectedPatient && (
          <PatientPanel
            patient={selectedPatient}
            onClose={() => setSelectedPatient(null)}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Patients;