import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Database } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@smartgrid.io');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
        }}
      >
        {/* Card Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
            padding: '32px 28px',
            color: '#fff',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            }}
          >
            <Zap size={30} color="#fbbf24" />
          </div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            SmartGrid Utility Portal
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#bfdbfe', marginTop: '4px' }}>
            Electricity Consumption & Smart Meter Billing Database
          </p>
        </div>

        {/* Card Body */}
        <div style={{ padding: '28px' }}>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                marginBottom: '20px',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                />
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  placeholder="admin@smartgrid.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                />
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.9375rem', fontWeight: 600 }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Role Switcher */}
          <div style={{ marginTop: '28px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '10px',
                textAlign: 'center',
              }}
            >
              Demo Assessment Quick Switcher
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@smartgrid.io', 'Admin@123')}
                style={{
                  padding: '8px 6px',
                  borderRadius: '6px',
                  border: '1px solid #dc2626',
                  backgroundColor: email === 'admin@smartgrid.io' ? '#fef2f2' : '#fff',
                  color: '#dc2626',
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                ADMIN
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('staff@smartgrid.io', 'Staff@123')}
                style={{
                  padding: '8px 6px',
                  borderRadius: '6px',
                  border: '1px solid #d97706',
                  backgroundColor: email === 'staff@smartgrid.io' ? '#fffbeb' : '#fff',
                  color: '#d97706',
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                STAFF
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('rahul.sharma@example.com', 'Consumer@123')}
                style={{
                  padding: '8px 6px',
                  borderRadius: '6px',
                  border: '1px solid #059669',
                  backgroundColor: email === 'rahul.sharma@example.com' ? '#ecfdf5' : '#fff',
                  color: '#059669',
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                CONSUMER
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
