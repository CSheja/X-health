import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

const PatientPortal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchData();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/patient');
  };

  const tabs = ['overview', 'appointments', 'records', 'prescriptions'];

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #dddddb 0%, #d5d5d3 50%, #d0d0ce 100%)' }}
    >
      {/* Top navbar */}
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
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-medium capitalize transition-all ${
                activeTab === tab ? 'text-dark font-bold' : 'text-muted hover:text-dark'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="tabLine" className="h-0.5 bg-dark mt-0.5 rounded-full" />
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
          <button onClick={handleLogout} className="text-xs text-muted hover:text-dark transition-colors">
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10">

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black text-dark mb-2">
              Good day, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-muted mb-8">Here is your health summary.</p>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Upcoming Appointments', value: patientData?.appointments?.length || 0, dark: true },
                { label: 'Visit History', value: patientData?.ehr?.visits?.length || 0, dark: false },
                { label: 'Active Prescriptions', value: patientData?.ehr?.visits?.reduce((acc, v) => acc + v.prescriptions?.filter(p => !p.dispensed).length, 0) || 0, dark: true },
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

            {/* Patient info card */}
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-2 border-dark border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : patientData ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl p-6 bg-white border border-border">
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted mb-4">Personal Information</p>
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
                  <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">Health Record</p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-800">
                      <p className="text-xs text-gray-400">EHR ID</p>
                      <p className="text-sm font-mono text-white">{patientData.ehr?.id?.slice(0, 12)}...</p>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-800">
                      <p className="text-xs text-gray-400">Allergies</p>
                      <p className="text-sm text-white">
                        {patientData.ehr?.allergies?.length > 0 ? patientData.ehr.allergies.join(', ') : 'None recorded'}
                      </p>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-800">
                      <p className="text-xs text-gray-400">Total Visits</p>
                      <p className="text-sm text-white">{patientData.ehr?.visits?.length || 0}</p>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <p className="text-xs text-gray-400">Last Visit</p>
                      <p className="text-sm text-white">
                        {patientData.ehr?.visits?.[0] ? formatDate(patientData.ehr.visits[0].visitDate) : 'No visits yet'}
                      </p>
                    </div>
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

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black text-dark mb-8">My Appointments</h1>
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
                <p className="text-muted text-sm mt-1">Contact your facility to schedule an appointment</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Records Tab */}
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
                        <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">Clinical Notes</p>
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
                <p className="text-muted text-sm mt-1">Your visit history will appear here after consultations</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Prescriptions Tab */}
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
                <p className="text-muted text-sm mt-1">Prescriptions from your consultations will appear here</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PatientPortal;