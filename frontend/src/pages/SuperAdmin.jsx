import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/layout/Layout';
import API from '../services/api';

const ROLES = [
  { value: 'SYSADMIN', label: 'Super Admin', color: 'bg-purple-100 text-purple-700' },
  { value: 'ADMIN', label: 'Facility Admin', color: 'bg-blue-100 text-blue-700' },
  { value: 'CLINICIAN', label: 'Clinician', color: 'bg-green-100 text-green-700' },
  { value: 'PHARMACIST', label: 'Pharmacist', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'CHW', label: 'CHW', color: 'bg-orange-100 text-orange-700' },
  { value: 'DHO', label: 'District Health Officer', color: 'bg-red-100 text-red-700' },
  { value: 'PATIENT', label: 'Patient', color: 'bg-gray-100 text-gray-700' },
];

const getRoleStyle = (role) => {
  const found = ROLES.find(r => r.value === role);
  return found ? found.color : 'bg-gray-100 text-gray-700';
};

const getRoleLabel = (role) => {
  const found = ROLES.find(r => r.value === role);
  return found ? found.label : role;
};

// Create User Modal
const CreateUserModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'CLINICIAN', phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/auth/register', form);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
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
            <h2 className="text-xl font-bold text-dark">Create User</h2>
            <p className="text-xs text-muted mt-0.5">Add a new staff member to the platform</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-muted hover:bg-gray-200">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Full Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark transition-colors"
              placeholder="Dr. Marie Uwase" />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Email *</label>
            <input name="email" value={form.email} onChange={handleChange} required type="email"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark transition-colors"
              placeholder="doctor@xhealth.rw" />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark transition-colors"
              placeholder="+250 7XX XXX XXX" />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Role *</label>
            <select name="role" value={form.role} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark transition-colors">
              {ROLES.filter(r => r.value !== 'PATIENT').map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-dark mb-1.5">Temporary Password *</label>
            <input name="password" value={form.password} onChange={handleChange} required type="password"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark text-sm outline-none focus:border-dark transition-colors"
              placeholder="They will change this on first login" />
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
              {loading ? 'Creating...' : 'Create User'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Main SuperAdmin page
const SuperAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [stats, setStats] = useState({});

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data.data);
      // Calculate stats
      const s = {};
      res.data.data.forEach(u => {
        s[u.role] = (s[u.role] || 0) + 1;
      });
      setStats(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'ALL' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <Layout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-black text-dark">User Management</h1>
          <p className="text-muted text-sm mt-1">
            {users.length} total users across all roles
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreate(true)}
          className="px-6 py-3 bg-dark text-white rounded-xl text-sm font-semibold tracking-wide flex items-center gap-2"
        >
          <span>+</span> Create User
        </motion.button>
      </motion.div>

      {/* Role stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { role: 'CLINICIAN', label: 'Clinicians', icon: '◎' },
          { role: 'PHARMACIST', label: 'Pharmacists', icon: '◉' },
          { role: 'CHW', label: 'CHWs', icon: '◐' },
          { role: 'ADMIN', label: 'Admins', icon: '◆' },
        ].map((item, i) => (
          <motion.div
            key={item.role}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            onClick={() => setFilterRole(filterRole === item.role ? 'ALL' : item.role)}
            className={`rounded-2xl p-5 cursor-pointer transition-all duration-200 ${
              filterRole === item.role ? 'bg-dark text-white' : 'bg-white border border-border'
            }`}
          >
            <p className={`text-xs font-semibold tracking-widest uppercase mb-2 ${
              filterRole === item.role ? 'text-gray-400' : 'text-muted'
            }`}>{item.label}</p>
            <p className={`text-3xl font-black ${
              filterRole === item.role ? 'text-white' : 'text-dark'
            }`}>{stats[item.role] || 0}</p>
          </motion.div>
        ))}
      </div>

      {/* Search and filter */}
      <div className="flex gap-4 mb-6">
        <div
          className="flex items-center gap-3 px-5 py-3 rounded-2xl flex-1 max-w-md"
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
            placeholder="Search by name or email..."
            className="bg-transparent text-dark text-sm outline-none flex-1 placeholder-muted"
          />
        </div>

        <div className="flex gap-2">
          {['ALL', ...ROLES.map(r => r.value)].slice(0, 5).map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                filterRole === role
                  ? 'bg-dark text-white'
                  : 'bg-white border border-border text-muted hover:text-dark'
              }`}
            >
              {role === 'ALL' ? 'All' : getRoleLabel(role)}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
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
        <div className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-gray-100">
          {['Name', 'Email', 'Role', 'Status', 'Joined'].map(h => (
            <p key={h} className="text-xs font-semibold tracking-widest uppercase text-muted">{h}</p>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-dark border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted text-sm">Loading users...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-4xl mb-3">◎</p>
            <p className="text-dark font-semibold">No users found</p>
          </div>
        ) : (
          filtered.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-gray-50 hover:bg-white/60 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-dark flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
                </div>
                <p className="text-sm font-semibold text-dark truncate">{user.name}</p>
              </div>
              <p className="text-sm text-muted self-center truncate">{user.email}</p>
              <div className="self-center">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getRoleStyle(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
              </div>
              <div className="self-center">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  user.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {user.status}
                </span>
              </div>
              <p className="text-sm text-muted self-center">
                {new Date(user.createdAt).toLocaleDateString('en-RW', {
                  year: 'numeric', month: 'short', day: 'numeric'
                })}
              </p>
            </motion.div>
          ))
        )}
      </motion.div>

      <AnimatePresence>
        {showCreate && (
          <CreateUserModal
            onClose={() => setShowCreate(false)}
            onSuccess={fetchUsers}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default SuperAdmin;