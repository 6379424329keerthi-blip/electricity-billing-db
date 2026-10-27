import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Lock, Database, Shield, CheckCircle2, AlertCircle, Server } from 'lucide-react';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    if (newPassword.length < 6) {
      setStatusMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setLoading(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setStatusMsg({ type: 'success', text: 'Password successfully changed!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px' }}>
      {/* Account Info Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 800,
            }}
          >
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              {user?.fullName}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor:
                    user?.role === 'ADMIN'
                      ? '#dc2626'
                      : user?.role === 'STAFF'
                      ? '#d97706'
                      : '#059669',
                  color: '#fff',
                }}
              >
                ROLE: {user?.role}
              </span>
              <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>{user?.email}</span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            backgroundColor: '#f8fafc',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '0.875rem',
          }}
        >
          <div>
            <span style={{ color: '#64748b' }}>Account User ID:</span>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>#{user?.userId || user?.user_id}</div>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Primary Email:</span>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{user?.email}</div>
          </div>
          {user?.consumerNumber && (
            <div>
              <span style={{ color: '#64748b' }}>Consumer Account:</span>
              <div style={{ fontWeight: 700, color: '#2563eb' }}>{user?.consumerNumber}</div>
            </div>
          )}
          <div>
            <span style={{ color: '#64748b' }}>Account Status:</span>
            <div style={{ fontWeight: 600, color: '#059669' }}>ACTIVE & VERIFIED</div>
          </div>
        </div>
      </div>

      {/* Database Connection & Architecture Status */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Database size={20} color="#16a34a" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
            DBMS Architecture & Storage Engine
          </h3>
        </div>

        <div
          style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '0.8125rem',
            color: '#15803d',
            lineHeight: 1.6,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <strong>Target RDBMS:</strong>
            <span>PostgreSQL 18 (Active Local Service & pgAdmin 4)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <strong>Database Name:</strong>
            <span><code>electricity_billing_db</code></span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <strong>Client Driver:</strong>
            <span>node-postgres (<code>pg.Pool</code> connection pool)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <strong>Normalization Level:</strong>
            <span>Third Normal Form (3NF) relational design</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>Integrity & Concurrency:</strong>
            <span>ACID Transactions (<code>client.query('BEGIN')</code> ... <code>COMMIT</code>)</span>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Lock size={20} color="#2563eb" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
            Security Settings: Change Password
          </h3>
        </div>

        {statusMsg.text && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: statusMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
              color: statusMsg.type === 'success' ? '#065f46' : '#991b1b',
              border: `1px solid ${statusMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            }}
          >
            {statusMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: '8px' }}
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
