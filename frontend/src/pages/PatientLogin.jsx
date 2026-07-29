import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import XHealthLogo from '../components/ui/XHealthLogo';

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-RW', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

// ── Settings Tab ───────────────────────────────────────────
const SettingsTab = ({ patientData, onUpdate }) => {
  const [form, setForm] = useState({
    name: patientData?.user?.name || '',
    nationalId: patientData?.nationalId || '',
    phone: patientData?.user?.phone || '',
    dateOfBirth: patientData?.dateOfBirth
      ? new Date(patientData.dateOfBirth).toISOString().split('T')[0] : '',
    gender: patientData?.gender || '',
    insuranceId: patientData?.insuranceId || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await API.put(`/patients/${patientData.id}`, form);
      setSuccess(true);
      onUpdate();
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl p-6 bg-white border border-border">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted mb-5">
            Personal Information
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">
                Full Name
              </label>
              <input name="name" value={form.name} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 text-dark text-sm outline-none focus:border-dark focus:bg-white transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">
                National ID
              </label>
              <input name="nationalId" value={form.nationalId} onChange={handleChange}
                placeholder="1 1990 8 0123456 7 89"
                className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 text-dark text-sm outline-none focus:border-dark focus:bg-white transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">
                Phone
              </label>
              <input name="phone" value={form.phone} onChange={handleChange}
                placeholder="+250 7XX XXX XXX"
                className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 text-dark text-sm outline-none focus:border-dark focus:bg-white transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">
                  Date of Birth
                </label>
                <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 text-dark text-sm outline-none focus:border-dark focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">
                  Gender
                </label>
                <select name="gender" value={form.gender} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 text-dark text-sm outline-none focus:border-dark focus:bg-white transition-all">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">
                Insurance ID (Mutuelle)
              </label>
              <input name="insuranceId" value={form.insuranceId} onChange={handleChange}
                placeholder="MUT-XXXX-XXXX"
                className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 text-dark text-sm outline-none focus:border-dark focus:bg-white transition-all" />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 text-xs px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-100 text-green-600 text-xs px-4 py-3 rounded-xl">
            Profile updated successfully.
          </div>
        )}

        <motion.button type="submit" disabled={loading}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-dark text-white rounded-2xl font-semibold text-sm tracking-widest uppercase disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Changes'}
        </motion.button>
      </form>
    </div>
  );
};

// ── Book Appointment Modal ─────────────────────────────────
const BookAppointmentModal = ({ patientData, onClose, onSuccess }) => {
  const [clinicians, setClinicians] = useState([]);
  const [form, setForm] = useState({
    clinicianId: '', scheduledAt: '', type: 'IN_PERSON'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get('/admin/users');
        setClinicians(res.data.data.filter(u => u.role === 'CLINICIAN'));
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
      const clinicianRes = await API.get(`/admin/users/${form.clinicianId}/clinician`);
      await API.post('/appointments', {
        patientId: patientData.id,
        clinicianId: clinicianRes.data.data.id,
        scheduledAt: form.scheduledAt,
        type: form.type,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed');
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
            <h2 className="text-xl font-bold text-dark">Book Appointment</h2>
            <p className="text-xs text-muted mt-0.5">Schedule a consultation</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-muted hover:bg-gray-200">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">
              Available Clinicians *
            </label>
            <select name="clinicianId" value={form.clinicianId} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark">
              <option value="">Select a clinician</option>
              {clinicians.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">
              Date and Time *
            </label>
            <input name="scheduledAt" type="datetime-local" value={form.scheduledAt}
              onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark" />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-3">
              Appointment Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'IN_PERSON', label: 'In-Person', icon: '◎' },
                { value: 'TELEMEDICINE', label: 'Telemedicine', icon: '◈' },
              ].map(t => (
                <button key={t.value} type="button"
                  onClick={() => setForm({ ...form, type: t.value })}
                  className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                    form.type === t.value
                      ? 'border-dark bg-dark text-white'
                      : 'border-border text-dark hover:border-gray-300'
                  }`}
                >
                  <span className="block text-xl mb-1">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
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
              {loading ? 'Booking...' : 'Book Now'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ── Main Patient Portal ────────────────────────────────────
const PatientPortal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBook, setShowBook] = useState(false);

  const fetchData = async () => {
    try {
      const res = await API.get('/patients');
      const myRecord = res.data.data.find(p =>
        p.email === user?.email || p.name === user?.name
      );
      if (myRecord) {
        const detail = await API.get(`/patients/${myRecord.id}`);
        setPatientData(detail.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/patient');
  };

  const tabs = ['overview', 'appointments', 'records', 'prescriptions', 'settings'];

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #dddddb 0%, #d5d5d3 50%, #d0d0ce 100%)' }}
    >
      {/* Navbar */}
      <div
        className="sticky top-0 z-40 flex items-center justify-between px-8 py-4"
        style={{
          background: 'rgba(220,220,218,0.80)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.4)',
        }}
      >
        <XHealthLogo size="sm" />

        <div className="flex items-center gap-6">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`text-sm font-medium capitalize transition-all relative ${
                activeTab === tab ? 'text-dark font-bold' : 'text-muted hover:text-dark'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="tabLine"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-dark rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-dark">{user?.name}</p>
            <p className="text-xs text-muted">Patient</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-dark flex items-center justify-center">
            <span className="text-white text-sm font-bold">{user?.name?.charAt(0)}</span>
          </div>
          <button onClick={handleLogout}
            className="text-xs text-muted hover:text-dark transition-colors">
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10">

        {/* Overview */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black text-dark mb-2">
              Good day, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-muted mb-8">Here is your health summary.</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Upcoming Appointments', value: patientData?.appointments?.length || 0, dark: true },
                { label: 'Visit History', value: patientData?.ehr?.visits?.length || 0, dark: false },
                { label: 'Active Prescriptions', value: patientData?.ehr?.visits?.reduce((acc, v) => acc + (v.prescriptions?.filter(p => !p.dispensed).length || 0), 0) || 0, dark: true },
              ].map((s, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-2xl p-6 ${s.dark ? 'bg-dark text-white' : 'bg-white border border-border'}`}
                >
                  <p className={`text-xs font-semibold tracking-widest uppercase mb-2 ${s.dark ? 'text-gray-400' : 'text-muted'}`}>
                    {s.label}
                  </p>
                  <p className={`text-4xl font-black ${s.dark ? 'text-white' : 'text-dark'}`}>{s.value}</p>
                </motion.div>
              ))}
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-2 border-dark border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : patientData ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl p-6 bg-white border border-border">
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted mb-4">
                    Personal Information
                  </p>
                  <div className="space-y-3">
                    {[
                      { label: 'Full Name', value: patientData.user?.name },
                      { label: 'National ID', value: patientData.nationalId },
                      { label: 'Date of Birth', value: formatDate(patientData.dateOfBirth) },
                      { label: 'Gender', value: patientData.gender || '—' },
                      { label: 'Phone', value: patientData.user?.phone || '—' },
                      { label: 'Insurance', value: patientData.insuranceId || '—' },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                        <p className="text-xs text-muted">{item.label}</p>
                        <p className="text-sm font-medium text-dark">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl p-6 bg-dark text-white">
                  <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">
                    Health Record
                  </p>
                  <div className="space-y-3">
                    {[
                      { label: 'EHR ID', value: patientData.ehr?.id?.slice(0, 12) + '...' },
                      { label: 'Allergies', value: patientData.ehr?.allergies?.length > 0 ? patientData.ehr.allergies.join(', ') : 'None recorded' },
                      { label: 'Total Visits', value: patientData.ehr?.visits?.length || 0 },
                      { label: 'Last Visit', value: patientData.ehr?.visits?.[0] ? formatDate(patientData.ehr.visits[0].visitDate) : 'No visits yet' },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                        <p className="text-xs text-gray-400">{item.label}</p>
                        <p className="text-sm text-white font-medium">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl p-12 text-center bg-white border border-border">
                <p className="text-4xl mb-3">◎</p>
                <p className="text-dark font-semibold">No health record found</p>
                <p className="text-muted text-sm mt-1">Visit a facility to have your record created</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Appointments */}
        {activeTab === 'appointments' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-black text-dark">My Appointments</h1>
              {patientData && (
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setShowBook(true)}
                  className="px-6 py-3 bg-dark text-white rounded-xl text-sm font-semibold tracking-wide flex items-center gap-2"
                >
                  <span>+</span> Book Appointment
                </motion.button>
              )}
            </div>

            {patientData?.appointments?.length > 0 ? (
              <div className="space-y-4">
                {patientData.appointments.map((apt, i) => (
                  <motion.div key={apt.id}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl p-6 bg-white border border-border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        apt.type === 'TELEMEDICINE' ? 'bg-dark' : 'bg-gray-100'
                      }`}>
                        <span className={apt.type === 'TELEMEDICINE' ? 'text-white' : 'text-dark'}>
                          {apt.type === 'TELEMEDICINE' ? '◈' : '◎'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-dark">
                          {apt.type === 'IN_PERSON' ? 'In-Person Visit' : 'Telemedicine Session'}
                        </p>
                        <p className="text-sm text-muted">Dr. {apt.clinician?.user?.name}</p>
                        <p className="text-xs text-muted mt-0.5">{formatDate(apt.scheduledAt)}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                      apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                      apt.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                      apt.status === 'COMPLETED' ? 'bg-gray-100 text-gray-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {apt.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl p-12 text-center bg-white border border-border">
                <p className="text-4xl mb-3">◷</p>
                <p className="text-dark font-semibold">No appointments yet</p>
                <p className="text-muted text-sm mt-1">Book your first appointment above</p>
              </div>
            )}

            <AnimatePresence>
              {showBook && patientData && (
                <BookAppointmentModal
                  patientData={patientData}
                  onClose={() => setShowBook(false)}
                  onSuccess={() => { setShowBook(false); fetchData(); }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Records */}
        {activeTab === 'records' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black text-dark mb-8">Visit History</h1>
            {patientData?.ehr?.visits?.length > 0 ? (
              <div className="space-y-4">
                {patientData.ehr.visits.map((visit, i) => (
                  <motion.div key={visit.id}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl p-6 bg-white border border-border"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-semibold text-dark">{visit.visitType}</p>
                        <p className="text-sm text-muted">Dr. {visit.clinician?.user?.name}</p>
                      </div>
                      <p className="text-sm text-muted">{formatDate(visit.visitDate)}</p>
                    </div>
                    {visit.soapNotes && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">
                          Clinical Notes
                        </p>
                        <p className="text-sm text-dark whitespace-pre-wrap">{visit.soapNotes}</p>
                      </div>
                    )}
                    {visit.icd10Code && (
                      <div className="mt-3">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-dark text-white font-medium">
                          ICD-10: {visit.icd10Code}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl p-12 text-center bg-white border border-border">
                <p className="text-4xl mb-3">◉</p>
                <p className="text-dark font-semibold">No visit records yet</p>
                <p className="text-muted text-sm mt-1">
                  Your visit history will appear here after consultations
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Prescriptions */}
        {activeTab === 'prescriptions' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black text-dark mb-8">My Prescriptions</h1>
            {patientData?.ehr?.visits?.some(v => v.prescriptions?.length > 0) ? (
              <div className="space-y-4">
                {patientData.ehr.visits.flatMap(v => v.prescriptions || []).map((rx, i) => (
                  <motion.div key={rx.id}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`rounded-2xl p-6 flex items-center justify-between ${
                      rx.dispensed ? 'bg-white border border-border' : 'bg-dark text-white'
                    }`}
                  >
                    <div>
                      <p className={`font-semibold ${rx.dispensed ? 'text-dark' : 'text-white'}`}>
                        {rx.medication}
                      </p>
                      <p className={`text-sm mt-1 ${rx.dispensed ? 'text-muted' : 'text-gray-400'}`}>
                        {rx.dose} — {rx.frequency} — {rx.duration}
                      </p>
                    </div>
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                      rx.dispensed
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {rx.dispensed ? 'Dispensed' : 'Pending'}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl p-12 text-center bg-white border border-border">
                <p className="text-4xl mb-3">◉</p>
                <p className="text-dark font-semibold">No prescriptions yet</p>
                <p className="text-muted text-sm mt-1">
                  Prescriptions from your consultations will appear here
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black text-dark mb-8">Settings</h1>
            {patientData ? (
              <SettingsTab patientData={patientData} onUpdate={fetchData} />
            ) : (
              <div className="rounded-2xl p-12 text-center bg-white border border-border">
                <p className="text-muted text-sm">Loading your profile...</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PatientPortal;