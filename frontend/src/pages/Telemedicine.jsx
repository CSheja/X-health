import React, { useState, useEffect, useRef } from 'react';
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

// Video Session Component
const VideoSession = ({ session, onEnd }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [connected, setConnected] = useState(false);
  const [soapNotes, setSoapNotes] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [newRx, setNewRx] = useState({ medication: '', dose: '', frequency: '', duration: '' });
  const [ending, setEnding] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true, audio: true
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setConnected(true);
      } catch (err) {
        console.error('Camera error:', err);
        setCameraError(true);
        setConnected(true);
      }
    };
    startCamera();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const addPrescription = () => {
    if (!newRx.medication || !newRx.dose) return;
    setPrescriptions([...prescriptions, { ...newRx }]);
    setNewRx({ medication: '', dose: '', frequency: '', duration: '' });
  };

  const handleEndSession = async () => {
    setEnding(true);
    try {
      await API.post('/telemedicine/sessions/end', {
        appointmentId: session.id,
        soapNotes,
        prescriptions,
      });
      if (localStream) localStream.getTracks().forEach(t => t.stop());
      onEnd();
    } catch (err) {
      console.error(err);
    } finally {
      setEnding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex"
      style={{ background: '#0a0a0a' }}
    >
      {/* Video area */}
      <div className="flex-1 relative">
        {/* Remote video placeholder */}
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: '#111111' }}>
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl font-bold">
                {session.patient?.user?.name?.charAt(0)}
              </span>
            </div>
            <p className="text-white font-semibold">{session.patient?.user?.name}</p>
            <p className="text-gray-500 text-sm mt-1">Connecting via WebRTC...</p>
            <div className="flex gap-1 justify-center mt-3">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-gray-500"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Local video */}
        <div className="absolute bottom-6 right-6 w-48 h-36 rounded-2xl overflow-hidden border-2 border-gray-700"
          style={{ background: '#1a1a1a' }}>
          {!cameraError ? (
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-500 text-xs text-center px-2">Camera unavailable</p>
            </div>
          )}
          <div className="absolute bottom-2 left-2">
            <span className="text-xs text-white bg-black/60 px-2 py-0.5 rounded-full">You</span>
          </div>
        </div>

        {/* Session info */}
        <div className="absolute top-6 left-6">
          <div className="flex items-center gap-3 bg-black/60 backdrop-blur-sm rounded-2xl px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white text-sm font-medium">Live Session</span>
            <span className="text-gray-400 text-sm">— Room: xhealth-{session.id?.slice(0, 8)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={handleEndSession} disabled={ending}
            className="px-8 py-3 rounded-2xl bg-red-600 text-white font-semibold text-sm disabled:opacity-50"
          >
            {ending ? 'Ending...' : 'End Session'}
          </motion.button>
        </div>
      </div>

      {/* Right panel — EHR and notes */}
      <div className="w-96 flex flex-col"
        style={{ background: 'rgba(20,20,20,0.95)', borderLeft: '1px solid #2a2a2a' }}>

        {/* Patient info */}
        <div className="p-6 border-b border-gray-800">
          <p className="text-xs text-gray-500 tracking-widest uppercase mb-2">Patient</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
              <span className="text-dark font-bold">{session.patient?.user?.name?.charAt(0)}</span>
            </div>
            <div>
              <p className="text-white font-semibold">{session.patient?.user?.name}</p>
              <p className="text-gray-500 text-xs">{session.patient?.nationalId}</p>
            </div>
          </div>
        </div>

        {/* SOAP Notes */}
        <div className="p-6 border-b border-gray-800 flex-1">
          <p className="text-xs text-gray-500 tracking-widest uppercase mb-3">SOAP Notes</p>
          <textarea
            value={soapNotes}
            onChange={(e) => setSoapNotes(e.target.value)}
            placeholder="Subjective: Patient reports...&#10;Objective: Vitals normal...&#10;Assessment: Diagnosis...&#10;Plan: Treatment plan..."
            className="w-full h-48 bg-gray-900 text-white text-sm rounded-xl p-4 outline-none resize-none placeholder-gray-600 border border-gray-800 focus:border-gray-600"
          />
        </div>

        {/* Prescriptions */}
        <div className="p-6">
          <p className="text-xs text-gray-500 tracking-widest uppercase mb-3">
            Prescriptions {prescriptions.length > 0 && `(${prescriptions.length})`}
          </p>

          {prescriptions.map((rx, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-900 rounded-xl p-3 mb-2">
              <div>
                <p className="text-white text-sm font-medium">{rx.medication}</p>
                <p className="text-gray-500 text-xs">{rx.dose} — {rx.frequency} — {rx.duration}</p>
              </div>
              <button onClick={() => setPrescriptions(prescriptions.filter((_, j) => j !== i))}
                className="text-gray-600 hover:text-red-400 text-xs ml-2">✕</button>
            </div>
          ))}

          <div className="space-y-2 mt-2">
            <input value={newRx.medication} onChange={(e) => setNewRx({ ...newRx, medication: e.target.value })}
              placeholder="Medication name"
              className="w-full bg-gray-900 text-white text-sm rounded-xl px-4 py-2.5 outline-none border border-gray-800 focus:border-gray-600 placeholder-gray-600" />
            <div className="grid grid-cols-3 gap-2">
              <input value={newRx.dose} onChange={(e) => setNewRx({ ...newRx, dose: e.target.value })}
                placeholder="Dose"
                className="bg-gray-900 text-white text-xs rounded-xl px-3 py-2 outline-none border border-gray-800 focus:border-gray-600 placeholder-gray-600" />
              <input value={newRx.frequency} onChange={(e) => setNewRx({ ...newRx, frequency: e.target.value })}
                placeholder="Frequency"
                className="bg-gray-900 text-white text-xs rounded-xl px-3 py-2 outline-none border border-gray-800 focus:border-gray-600 placeholder-gray-600" />
              <input value={newRx.duration} onChange={(e) => setNewRx({ ...newRx, duration: e.target.value })}
                placeholder="Duration"
                className="bg-gray-900 text-white text-xs rounded-xl px-3 py-2 outline-none border border-gray-800 focus:border-gray-600 placeholder-gray-600" />
            </div>
            <button onClick={addPrescription}
              className="w-full py-2 bg-white text-dark text-xs font-semibold rounded-xl hover:bg-gray-100 transition-colors">
              + Add Prescription
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Telemedicine Page
const Telemedicine = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await API.get('/telemedicine/sessions');
      setSessions(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  const handleStart = async (session) => {
    try {
      await API.post('/telemedicine/sessions/start', { appointmentId: session.id });
      setActiveSession(session);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnd = () => {
    setActiveSession(null);
    fetchSessions();
  };

  const upcomingCount = sessions.filter(s => s.status === 'SCHEDULED' || s.status === 'CONFIRMED').length;
  const completedCount = sessions.filter(s => s.status === 'COMPLETED').length;

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-black text-dark">Telemedicine</h1>
          <p className="text-muted text-sm mt-1">Browser-based video consultations via WebRTC</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Sessions', value: sessions.length, dark: false },
          { label: 'Upcoming', value: upcomingCount, dark: true },
          { label: 'Completed', value: completedCount, dark: false },
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

      {/* Sessions list */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.9)' }}
      >
        <div className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-gray-100">
          {['Patient', 'Clinician', 'Date', 'Time', 'Action'].map(h => (
            <p key={h} className="text-xs font-semibold tracking-widest uppercase text-muted">{h}</p>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-dark border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted text-sm">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-4xl mb-3">◈</p>
            <p className="text-dark font-semibold">No telemedicine sessions yet</p>
            <p className="text-muted text-sm mt-1">Book a telemedicine appointment to get started</p>
          </div>
        ) : (
          sessions.map((s, i) => (
            <motion.div key={s.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-gray-50 hover:bg-white/60 transition-all"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-dark flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{s.patient?.user?.name?.charAt(0)}</span>
                </div>
                <p className="text-sm font-medium text-dark truncate">{s.patient?.user?.name}</p>
              </div>
              <p className="text-sm text-muted self-center">Dr. {s.clinician?.user?.name}</p>
              <p className="text-sm text-dark self-center">{formatDate(s.scheduledAt)}</p>
              <p className="text-sm text-muted self-center">{formatTime(s.scheduledAt)}</p>
              <div className="self-center">
                {s.status === 'COMPLETED' ? (
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-600">
                    Completed
                  </span>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => handleStart(s)}
                    className="px-4 py-1.5 bg-dark text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Start Session
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Active video session */}
      <AnimatePresence>
        {activeSession && (
          <VideoSession session={activeSession} onEnd={handleEnd} />
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Telemedicine;