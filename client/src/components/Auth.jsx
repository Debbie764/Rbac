import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Lock, ShieldCheck } from 'lucide-react';

const API_BASE = import.meta.env.MODE === 'development' 
  ? 'http://localhost:5000/api' 
  : '/api';

const Auth = ({ onLogin }) => {
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        username: formData.username,
        password: formData.password
      });
      onLogin(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    }
  };

  return (
    <div className="auth-container" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      background: 'radial-gradient(circle at top right, #e2e8f0, #f8fafc)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background elements */}
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40%', height: '40%', background: 'rgba(2, 132, 199, 0.05)', borderRadius: '50%', filter: 'blur(80px)' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '30%', height: '30%', background: 'rgba(15, 23, 42, 0.05)', borderRadius: '50%', filter: 'blur(60px)' }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '60px 40px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          background: 'white'
        }}
      >
        <div style={{ marginBottom: '40px' }}>
          <motion.div 
            initial={{ scale: 0.5, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            style={{
              background: 'var(--primary)',
              width: '70px',
              height: '70px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 10px 20px rgba(2, 132, 199, 0.2)'
            }}
          >
            <ShieldCheck size={36} color="white" />
          </motion.div>
          <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '10px', fontWeight: '800' }}>
            KOGI POLY IAM
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '700' }}>
            Institutional Governance
          </p>
          <div style={{ width: '40px', height: '3px', background: 'var(--primary)', margin: '15px auto', borderRadius: '2px', opacity: 0.3 }}></div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ 
              background: '#fef2f2', 
              color: '#ef4444', 
              padding: '12px', 
              borderRadius: '12px', 
              marginBottom: '25px',
              fontSize: '0.85rem',
              border: '1.5px solid #fee2e2'
            }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', top: '15px', left: '15px', color: 'var(--primary)' }} />
            <input 
              type="text" 
              placeholder="Username" 
              style={{ paddingLeft: '45px' }}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required 
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', top: '15px', left: '15px', color: 'var(--primary)' }} />
            <input 
              type="password" 
              placeholder="Password" 
              style={{ paddingLeft: '45px' }}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required 
            />
          </div>

          <button type="submit" className="primary" style={{ width: '100%', marginTop: '10px', padding: '16px', fontSize: '1rem' }}>
            AUTHENTICATE ACCESS
          </button>
        </form>

        <p style={{ marginTop: '30px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Restricted Institutional Access. <br/>
          Contact Administrator for provisioning.
        </p>

        <div style={{ marginTop: '40px', padding: '15px', borderTop: '1.5px solid var(--border-light)', display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <ShieldCheck size={14} style={{ marginRight: '5px' }} /> PBAC Security
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <Lock size={14} style={{ marginRight: '5px' }} /> TLS Encrypted
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
