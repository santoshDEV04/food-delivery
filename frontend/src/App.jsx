import React from 'react';
import { Routes, Route } from 'react-router-dom';

import LoginPage from './pages/LoginPage.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import ManagerDashboard from './components/ManagerDashboard.jsx';
import MemberDashboard from './components/MemberDashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

const App = () => {
  return (
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<LoginPage />} />

        {/* Admin Route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Manager Route */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={['MANAGER']}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Member Route */}
        <Route
          path="/member"
          element={
            <ProtectedRoute allowedRoles={['MEMBER']}>
              <MemberDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
  );
};

export default App;
