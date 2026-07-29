import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import XHealthLogo from '../components/ui/XHealthLogo';

const PatientLogin = () => {
  const [mode, setMode] = useState('login'); // login or register
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    nationalId: '', dateOfBirth: '', gender: '', phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/patient-portal');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'PATIENT',
        phone: form.phone,
        nationalId: form.nationalId,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
      });
      await login(form.email, form.password);
      navigate('/patient-portal');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #dddddb 0%, #d5d5d3 50%, #d0d0ce 100%)' }}
    >
      {/* Background curves */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <motion.path d="M -100 400 Q 300 100 700 400 Q 1100 700 1540 300"
            stroke="#c8c8c8" strokeWidth="1" fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 3 }} />
          <motion.path d="M -100 650 Q 400 250 800 550 Q 1200 850 1540 450"
            stroke="#c0c0c0" strokeWidth="0.6" fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.4 }}
            transition={{ duration: 3.5, delay: 0.5 }} />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <XHealthLogo size="lg" />
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl p-8"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.95)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.10)',
          }}
        >
          {/* Mode toggle */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 capitalize ${
                  mode === m ? 'bg-dark text-white shadow-sm' : 'text-muted hover:text-dark'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark transition-colors"
                    placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Password</label>
                  <input name="password" type="password" value={form.password} onChange={handleChange} required
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark transition-colors"
                    placeholder="••••••••" />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-500 text-xs px-4 py-3 rounded-xl">{error}</div>
                )}

                <motion.button type="submit" disabled={loading}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-dark text-white rounded-2xl font-semibold text-sm tracking-widest uppercase disabled:opacity-50">
                  {loading ? 'Signing in...' : 'Access My Health'}
                </motion.button>

                <p className="text-center text-xs text-muted">
                  Are you a healthcare worker?{' '}
                  <a href="/login" className="text-dark font-semibold hover:underline">Staff Login →</a>
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Full Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} required
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark"
                      placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">National ID *</label>
                    <input name="nationalId" value={form.nationalId} onChange={handleChange} required
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark"
                      placeholder="ID number" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Email *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark"
                    placeholder="your@email.com" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Date of Birth</label>
                    <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Gender</label>
                    <select name="gender" value={form.gender} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark">
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark"
                    placeholder="+250 7XX XXX XXX" />
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Password *</label>
                  <input name="password" type="password" value={form.password} onChange={handleChange} required
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark"
                    placeholder="Create a password" />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-500 text-xs px-4 py-3 rounded-xl">{error}</div>
                )}

                <motion.button type="submit" disabled={loading}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-dark text-white rounded-2xl font-semibold text-sm tracking-widest uppercase disabled:opacity-50">
                  {loading ? 'Creating account...' : 'Create My Account'}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted mt-6"
        >
          X-Health Rwanda © 2026 — Your health, secured.
        </motion.p>
      </div>
    </div>
  );
};

export default PatientLogin;