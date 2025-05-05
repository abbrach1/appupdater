import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AdminUpload from './components/AdminUpload';
import AdminLogin from './components/AdminLogin';
import { AuthProvider, useAuth } from './components/AuthProvider';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AdminPrivateRoute({ children }) {
  // Simple session check for admin
  const isAdmin = window.sessionStorage.getItem('isAdmin') === 'true';
  return isAdmin ? children : <Navigate to="/admin" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/upload" element={<AdminPrivateRoute><AdminUpload /></AdminPrivateRoute>} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
