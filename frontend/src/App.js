import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Telemedicine from './pages/Telemedicine';
import Pharmacy from './pages/Pharmacy';
import Surveillance from './pages/Surveillance';
import CHW from './pages/CHW';
import SuperAdmin from './pages/SuperAdmin';

// Role-based portal landing
const RoleRouter = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case 'SYSADMIN':
    case 'ADMIN':
      return <Navigate to="/dashboard" />;
    case 'CLINICIAN':
      return <Navigate to="/clinician" />;
    case 'PHARMACIST':
      return <Navigate to="/pharmacy" />;
    case 'CHW':
      return <Navigate to="/chw" />;
    case 'DHO':
      return <Navigate to="/surveillance" />;
    case 'PATIENT':
      return <Navigate to="/patient-portal" />;
    default:
      return <Navigate to="/dashboard" />;
  }
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #dddddb 0%, #d5d5d3 50%, #d0d0ce 100%)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-dark border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted text-sm tracking-widest uppercase">Loading</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><RoleRouter /></ProtectedRoute>} />
      <Route path="/admin/users" element={
  <ProtectedRoute allowedRoles={['SYSADMIN', 'ADMIN']}>
  <SuperAdmin />
</ProtectedRoute>
} />

      {/* Admin + Sysadmin routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['SYSADMIN', 'ADMIN']}>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/patients" element={
        <ProtectedRoute allowedRoles={['SYSADMIN', 'ADMIN', 'CLINICIAN']}>
          <Patients />
        </ProtectedRoute>
      } />
      <Route path="/appointments" element={
        <ProtectedRoute allowedRoles={['SYSADMIN', 'ADMIN', 'CLINICIAN']}>
          <Appointments />
        </ProtectedRoute>
      } />
      <Route path="/telemedicine" element={
        <ProtectedRoute allowedRoles={['SYSADMIN', 'ADMIN', 'CLINICIAN']}>
          <Telemedicine />
        </ProtectedRoute>
      } />
      <Route path="/pharmacy" element={
        <ProtectedRoute allowedRoles={['SYSADMIN', 'ADMIN', 'PHARMACIST']}>
          <Pharmacy />
        </ProtectedRoute>
      } />
      <Route path="/surveillance" element={
        <ProtectedRoute allowedRoles={['SYSADMIN', 'ADMIN', 'DHO']}>
          <Surveillance />
        </ProtectedRoute>
      } />
      <Route path="/chw" element={
        <ProtectedRoute allowedRoles={['SYSADMIN', 'ADMIN', 'CHW']}>
          <CHW />
        </ProtectedRoute>
      } />

      {/* Clinician portal */}
      <Route path="/clinician" element={
        <ProtectedRoute allowedRoles={['CLINICIAN']}>
          <Dashboard />
        </ProtectedRoute>
      } />

      {/* Patient portal */}
      <Route path="/patient-portal" element={
        <ProtectedRoute allowedRoles={['PATIENT']}>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;