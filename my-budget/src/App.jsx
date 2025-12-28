
import React, { useState } from 'react';
import './App.css';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import Income from './components/Income';
import Expense from './components/Expense';
import Alert from './components/Alerts';
import Settings from './components/Settings';
import Login from './components/Login';
import Register from './components/Register';
import Reports from './components/Reports'

import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { selectTheme } from './redux/settingsSlice';


function App() {
  // Sidebar toggle state
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);
  const theme = useSelector(selectTheme);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme || 'light');
  }, [theme]);


  // Read auth token from Redux (safe: Provider is in main.jsx)
  const token = useSelector((s) => s.user?.token) ?? null;

  // Route guard
  const RequireAuth = ({ children }) => {
    return token ? children : <Navigate to="/login" replace />;
  };

  // Toggle sidebar (used by Header burger and Sidebar close)
  const OpenSidebar = () => {
    setOpenSidebarToggle((prev) => !prev);
  };

  // Optional: hide header/sidebar on login/register
  const location = useLocation();
  const onAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="grid-container">
      {/* Global layout (hidden on auth pages if desired) */}
      {!onAuthPage && (
        <>
          <Header OpenSidebar={OpenSidebar} />
          <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
        </>
      )}

      {/* App routes */}
      <Routes>
        {/* Protected routes */}
        <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/income" element={<RequireAuth><Income /></RequireAuth>} />
        <Route path="/expenses" element={<RequireAuth><Expense /></RequireAuth>} />
        <Route path="/alerts" element={<RequireAuth><Alert /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
        <Route path="/reports" element={<RequireAuth><Reports /></RequireAuth>} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
