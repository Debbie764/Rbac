import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('iam_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    const userData = { ...data.user, token: data.token };
    setUser(userData);
    localStorage.setItem('iam_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('iam_user');
  };

  if (loading) return <div className="loading">Initializing System...</div>;

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Auth onLogin={login} /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/dashboard/*" 
          element={user ? <Dashboard user={user} onLogout={logout} /> : <Navigate to="/login" />} 
        />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
