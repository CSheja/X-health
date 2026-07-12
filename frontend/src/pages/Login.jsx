import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SwarmEngine from '../components/ui/SwarmEngine';
import XHealthLogo from '../components/ui/XHealthLogo';

const BackgroundCurves = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
      <motion.path
        d="M -100 400 Q 300 100 700 400 Q 1100 700 1540 300"
        stroke="#d0d0d0" strokeWidth="1" fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.6 }}
        transition={{ duration: 3, ease: 'easeInOut' }}
      />
      <motion.path
        d="M -100 600 Q 400 200 800 500 Q 1200 800 1540 400"
        stroke="#c8c8c8" strokeWidth="0.5" fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.4 }}
        transition={{ duration: 3.5, delay: 0.5, ease: 'easeInOut' }}
      />
      <motion.path
        d="M -100 200 Q 500 500 900 200 Q 1300 -100 1540 500"
        stroke="#b8b8b8" strokeWidth="0.5" fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.3 }}
        transition={{ duration: 4, delay: 1, ease: 'easeInOut' }}
      />
    </svg>
    <div
      className="absolute"
      style={{
        left: '35%', top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '700px', height: '700px',
        background: 'radial-gradient(circle, rgba(180,180,180,0.2) 0%, transparent 70%)',
        borderRadius: '50%',
      }}
    />
  </div>
);

const FloatingInput = ({ label, type, value, onChange, delay }) => {
  const [focused, setFocused] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <motion.div
        animate={{
          borderColor: focused ? '#111111' : '#e0e0e0',
          boxShadow: focused ? '0 0 0 3px rgba(17,17,17,0.08)' : '0 0 0 0px transparent',
        }}
        className="relative rounded-2xl border bg-white/80 backdrop-blur-sm overflow-hidden"
      >
        <label
          className="absolute left-5 text-xs font-semibold tracking-widest uppercase transition-all duration-200 pointer-events-none"
          style={{
            top: focused || value ? '10px' : '50%',
            transform: focused || value ? 'translateY(0) scale(0.85)' : 'translateY(-50%)',
            color: focused ? '#111111' : '#888888',
            transformOrigin: 'left',
          }}
        >
          {label}
        </label>
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required
          className="w-full px-5 pt-7 pb-3 bg-transparent text-dark text-sm outline-none"
        />
      </motion.div>
    </motion.div>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full overflow-hidden relative flex"
style={{ background: 'linear-gradient(135deg, #dddddb 0%, #d5d5d3 50%, #d0d0ce 100%)' }}    >
      <BackgroundCurves />

      {/* Left — Swarm centrepiece */}
      <div className="flex-1 relative flex flex-col">

        {/* Logo top left */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute top-10 left-10 z-10"
        >
          <XHealthLogo size="md" />
        </motion.div>

        {/* Swarm fills left side */}
        <div className="flex-1 relative">
        <SwarmEngine height="100%" autoRotate={true} initialShape="head" />        </div>

        {/* Bottom left tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="absolute bottom-10 left-10 z-10"
        >
          <p className="text-xs text-muted tracking-widest uppercase mb-2">The Future of</p>
          <h2 className="text-5xl font-black text-dark leading-none tracking-tight">
            Health<br />care
          </h2>
          <p className="text-xs text-muted tracking-widest uppercase mt-3">Rwanda — 2026</p>
        </motion.div>
      </div>

      {/* Right — Login panel */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
        className="relative z-10 flex items-center justify-center p-12"
        style={{ width: '420px', minHeight: '100vh' }}
      >
        <div className="w-full">
          <div
            className="rounded-3xl p-8"
            style={{
              background: 'rgba(255,255,255,0.78)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              border: '1px solid rgba(255,255,255,0.95)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <p className="text-xs text-muted tracking-widest uppercase mb-2">Welcome back</p>
              <h2 className="text-2xl font-bold text-dark">Sign in</h2>
              <p className="text-xs text-muted mt-1">Access your X-Health dashboard</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FloatingInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                delay={0.7}
              />
              <FloatingInput
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                delay={0.8}
              />

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 border border-red-100 text-red-500 text-xs px-4 py-3 rounded-xl"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="pt-2"
              >
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(17,17,17,0.25)' }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-dark text-white rounded-2xl font-semibold text-sm tracking-widest uppercase relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Authenticating
                    </span>
                  ) : (
                    'Enter Platform'
                  )}
                </motion.button>
              </motion.div>
            </form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="text-center text-xs text-muted mt-6 tracking-wide"
            >
              X-Health Rwanda © 2026
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;