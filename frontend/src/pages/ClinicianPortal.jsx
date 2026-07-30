import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/layout/Layout';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-RW', { year: 'numeric', month: 'short', day: 'numeric' });
};
const formatTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' });
};

// ── Log Visit Modal ──────────────────────────────────────────
const LogVisitModal = ({ patients, appointments, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    patientId: '', visitType: 'In-Person', soapNotes: '', icd10Code: '', appointmentId: ''
  });
  const [prescriptions, setPrescriptions] = useState([]);
  const [newRx, setNewRx] = useState({ medication: '', dose: '', frequency: '', duration: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addPrescription = () => {
    if (!newRx.medication || !newRx.dose) return;
    setPrescriptions([...prescriptions, { ...newRx }]);
    setNewRx({ medication: '', dose: '', frequency: '', duration: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/clinician/visits', {
        ...form,
        appointmentId: form.appointmentId || undefined,
        prescriptions,
      });
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
        className="w-full max-w-lg rounded-3xl p-8 max-h-[90vh] overflow-y-auto"
        style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(32px)', boxShadow: '0 40px 100px rgba(0,0,0,0.15)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-dark">Log Visit</h2>
            <p className="text-xs text-muted mt-0.5">Record a consultation and issue prescriptions</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-muted hover:bg-gray-200">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Patient *</label>
            <select name="patientId" value={form.patientId} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark">
              <option value="">Select a patient</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Related Appointment (optional)</label>
            <select name="appointmentId" value={form.appointmentId} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark">
              <option value="">None — walk-in visit</option>
              {appointments.filter(a => a.status !== 'COMPLETED').map(a => (
                <option key={a.id} value={a.id}>
                  {a.patient?.user?.name} — {formatDate(a.scheduledAt)} {formatTime(a.scheduledAt)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Visit Type *</label>
              <select name="visitType" value={form.visitType} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark">
                <option value="In-Person">In-Person</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">ICD-10 Code</label>
              <input name="icd10Code" value={form.icd10Code} onChange={handleChange} placeholder="J06.9"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">SOAP Notes</label>
            <textarea name="soapNotes" value={form.soapNotes} onChange={handleChange}
              placeholder="Subjective: ...&#10;Objective: ...&#10;Assessment: ...&#10;Plan: ..."
              className="w-full h-32 px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark resize-none" />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-2">
              Prescriptions {prescriptions.length > 0 && `(${prescriptions.length})`}
            </label>
            {prescriptions.map((rx, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl p-3 mb-2">
                <div>
                  <p className="text-dark text-sm font-medium">{rx.medication}</p>
                  <p className="text-muted text-xs">{rx.dose} — {rx.frequency} — {rx.duration}</p>
                </div>
                <button type="button" onClick={() => setPrescriptions(prescriptions.filter((_, j) => j !== i))}
                  className="text-muted hover:text-red-500 text-xs ml-2">✕</button>
              </div>
            ))}
            <div className="space-y-2">
              <input value={newRx.medication} onChange={(e) => setNewRx({ ...newRx, medication: e.target.value })}
                placeholder="Medication name"
                className="w-full bg-white text-dark text-sm rounded-xl px-4 py-2.5 outline-none border border-border focus:border-dark" />
              <div className="grid grid-cols-3 gap-2">
                <input value={newRx.dose} onChange={(e) => setNewRx({ ...newRx, dose: e.target.value })} placeholder="Dose"
                  className="bg-white text-dark text-xs rounded-xl px-3 py-2 outline-none border border-border focus:border-dark" />
                <input value={newRx.frequency} onChange={(e) => setNewRx({ ...newRx, frequency: e.target.value })} placeholder="Frequency"
                  className="bg-white text-dark text-xs rounded-xl px-3 py-2 outline-none border border-border focus:border-dark" />
                <input value={newRx.duration} onChange={(e) => setNewRx({ ...newRx, duration: e.target.value })} placeholder="Duration"
                  className="bg-white text-dark text-xs rounded-xl px-3 py-2 outline-none border border-border focus:border-dark" />
              </div>
              <button type="button" onClick={addPrescription}
                className="w-full py-2 bg-gray-100 text-dark text-xs font-semibold rounded-xl hover:bg-gray-200 transition-colors">
                + Add Prescription
              </button>
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-100 text-red-500 text-xs px-4 py-3 rounded-xl">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-border text-dark text-sm font-medium hover:bg-gray-50">Cancel</button>
            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 rounded-xl bg-dark text-white text-sm font-medium disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Visit'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ── Send Referral Modal ─────────────────────────────────────
const ReferralModal = ({ patients, facilities, onClose, onSuccess }) => {
  const [form, setForm] = useState({ patientId: '', toFacilityId: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/clinician/referrals', form);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send referral');
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
        style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(32px)', boxShadow: '0 40px 100px rgba(0,0,0,0.15)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-dark">Send Referral</h2>
            <p className="text-xs text-muted mt-0.5">Refer a patient to another facility</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-muted hover:bg-gray-200">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Patient *</label>
            <select name="patientId" value={form.patientId} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark">
              <option value="">Select a patient</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Refer To *</label>
            <select name="toFacilityId" value={form.toFacilityId} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark">
              <option value="">Select a facility</option>
              {facilities.map(f => <option key={f.id} value={f.id}>{f.name} — {f.district}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange}
              placeholder="Reason for referral, relevant history..."
              className="w-full h-24 px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark resize-none" />
          </div>

          {error && <div className="bg-red-50 border border-red-100 text-red-500 text-xs px-4 py-3 rounded-xl">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-border text-dark text-sm font-medium hover:bg-gray-50">Cancel</button>
            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 rounded-xl bg-dark text-white text-sm font-medium disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Referral'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ── Main Clinician Portal ────────────────────────────────────
const ClinicianPortal = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTodayOnly, setShowTodayOnly] = useState(true);
  const [showLogVisit, setShowLogVisit] = useState(false);
  const [showReferral, setShowReferral] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [apptsRes, patientsRes, allPatientsRes, facilitiesRes] = await Promise.all([
        API.get(`/clinician/appointments${showTodayOnly ? '?today=true' : ''}`),
        API.get('/clinician/patients'),
        API.get('/patients?limit=1000'),
        API.get('/clinician/facilities'),
      ]);
      setAppointments(apptsRes.data.data);
      setPatients(patientsRes.data.data);
      setAllPatients(allPatientsRes.data.data);
      setFacilities(facilitiesRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [showTodayOnly]);

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black text-dark">Good day, Dr. {user?.name?.split(' ').pop()}</h1>
        <p className="text-muted text-sm mt-1">Here's your schedule and patients.</p>
      </motion.div>

      {/* Stats + actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl p-5 bg-dark text-white">
            <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">
              {showTodayOnly ? "Today's Appointments" : 'Total Appointments'}
            </p>
            <p className="text-3xl font-black text-white">{appointments.length}</p>
          </div>
          <div className="rounded-2xl p-5 bg-white border border-border">
            <p className="text-xs font-semibold tracking-widest uppercase text-muted mb-2">My Patients</p>
            <p className="text-3xl font-black text-dark">{patients.length}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowLogVisit(true)}
            className="px-5 py-3 bg-dark text-white rounded-xl text-sm font-semibold flex items-center gap-2">
            <span>+</span> Log Visit
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowReferral(true)}
            className="px-5 py-3 bg-white border border-border text-dark rounded-xl text-sm font-semibold flex items-center gap-2">
            <span>↗</span> Send Referral
          </motion.button>
        </div>
      </div>

      {/* Appointments */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xl font-bold text-dark">Appointments</p>
        <div className="flex bg-gray-100 rounded-2xl p-1">
          {[{ v: true, l: 'Today' }, { v: false, l: 'All' }].map(t => (
            <button key={t.l} onClick={() => setShowTodayOnly(t.v)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                showTodayOnly === t.v ? 'bg-dark text-white shadow-sm' : 'text-muted hover:text-dark'
              }`}>
              {t.l}
            </button>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden mb-8"
        style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.9)' }}>
        <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-gray-100">
          {['Patient', 'Date', 'Time', 'Status'].map(h => (
            <p key={h} className="text-xs font-semibold tracking-widest uppercase text-muted">{h}</p>
          ))}
        </div>
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-dark border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-dark font-semibold">No appointments {showTodayOnly ? 'today' : 'found'}</p>
          </div>
        ) : (
          appointments.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-gray-50">
              <p className="text-sm font-medium text-dark self-center">{a.patient?.user?.name}</p>
              <p className="text-sm text-muted self-center">{formatDate(a.scheduledAt)}</p>
              <p className="text-sm text-muted self-center">{formatTime(a.scheduledAt)}</p>
              <span className={`self-center text-xs px-2.5 py-1 rounded-full font-medium w-fit ${
                a.status === 'COMPLETED' ? 'bg-gray-100 text-gray-600' :
                a.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {a.status}
              </span>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Patients */}
      <p className="text-xl font-bold text-dark mb-4">My Patients</p>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.9)' }}>
        <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-gray-100">
          {['Name', 'National ID', 'Gender', 'Last Visit'].map(h => (
            <p key={h} className="text-xs font-semibold tracking-widest uppercase text-muted">{h}</p>
          ))}
        </div>
        {patients.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-dark font-semibold">No patients yet</p>
            <p className="text-muted text-sm mt-1">Log your first visit to see patients here</p>
          </div>
        ) : (
          patients.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-gray-50">
              <p className="text-sm font-medium text-dark self-center">{p.name}</p>
              <p className="text-sm text-muted self-center font-mono">{p.nationalId}</p>
              <p className="text-sm text-dark self-center capitalize">{p.gender || '—'}</p>
              <p className="text-sm text-muted self-center">{formatDate(p.lastVisitDate)}</p>
            </motion.div>
          ))
        )}
      </motion.div>

      <AnimatePresence>
        {showLogVisit && (
          <LogVisitModal patients={allPatients} appointments={appointments}
            onClose={() => setShowLogVisit(false)} onSuccess={fetchAll} />
        )}
        {showReferral && (
          <ReferralModal patients={allPatients} facilities={facilities}
            onClose={() => setShowReferral(false)} onSuccess={fetchAll} />
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default ClinicianPortal;