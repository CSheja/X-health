import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import XHealthLogo from '../ui/XHealthLogo';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '⬡', roles: ['SYSADMIN', 'ADMIN', 'CLINICIAN'] },
  { label: 'Facility Overview', path: '/facility-admin', icon: '⬡', roles: ['ADMIN'] },
  { label: 'Clinician Portal', path: '/clinician-portal', icon: '⬡', roles: ['CLINICIAN'] },
  { label: 'User Management', path: '/admin/users', icon: '◈', roles: ['SYSADMIN', 'ADMIN'] },
  { label: 'Patients', path: '/patients', icon: '◎', roles: ['SYSADMIN', 'ADMIN'] },
  { label: 'Appointments', path: '/appointments', icon: '◷', roles: ['SYSADMIN', 'ADMIN', 'CLINICIAN'] },
  { label: 'Telemedicine', path: '/telemedicine', icon: '◈', roles: ['SYSADMIN', 'ADMIN', 'CLINICIAN'] },
  { label: 'Pharmacy', path: '/pharmacy', icon: '◉', roles: ['SYSADMIN', 'ADMIN', 'PHARMACIST'] },
  { label: 'Surveillance', path: '/surveillance', icon: '◆', roles: ['SYSADMIN', 'ADMIN', 'DHO'] },
  { label: 'CHW Reports', path: '/chw', icon: '◐', roles: ['SYSADMIN', 'ADMIN', 'CHW'] },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed left-0 top-0 h-full w-64 text-white flex flex-col z-50"
style={{
  background: 'rgba(10,10,10,0.82)',
  backdropFilter: 'blur(28px)',  WebkitBackdropFilter: 'blur(28px)',
  borderRight: '1px solid rgba(255,255,255,0.06)',
}}
    >
      {/* Logo */}
<div className="p-6 border-b border-gray-800">
  <XHealthLogo size="sm" light={true} />
</div>

      {/* User info */}
      <div className="p-6 border-b border-gray-800">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
            <span className="text-dark font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </motion.div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.filter(item => !item.roles || item.roles.includes(user?.role)).map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index + 0.3 }}
              onClick={() => navigate(item.path)}
              whileHover={{ x: 4 }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                text-sm font-medium transition-all duration-200 text-left
                ${isActive
                  ? 'bg-white text-dark'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-dark"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <motion.button
          whileHover={{ x: 4 }}          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          <span>→</span>
          Sign out
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;