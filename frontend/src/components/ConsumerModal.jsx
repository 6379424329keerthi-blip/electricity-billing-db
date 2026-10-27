import React, { useState } from 'react';
import { X, Users, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const ConsumerModal = ({ consumer, onClose, onSaveSuccess }) => {
  const isEditing = !!consumer;
  const [fullName, setFullName] = useState(consumer?.full_name || '');
  const [address, setAddress] = useState(consumer?.address || '');
  const [phone, setPhone] = useState(consumer?.phone || '');
  const [email, setEmail] = useState(consumer?.email || '');
  const [category, setCategory] = useState(consumer?.consumer_category || 'Residential');
  const [status, setStatus] = useState(consumer?.status || 'ACTIVE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    setLoading(true);
    try {
      let res;
      if (isEditing) {
        res = await api.updateConsumer(consumer.consumer_id, {
          full_name: fullName,
          address,
          phone,
          email,
          consumer_category: category,
          status,
        });
      } else {
        res = await api.createConsumer({
          full_name: fullName,
          address,
          phone,
          email,
          consumer_category: category,
        });
      }

      if (onSaveSuccess) {
        onSaveSuccess(res);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed. Please verify inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
                {isEditing ? `Edit Consumer (${consumer.consumer_number})` : 'Register New Consumer'}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                {isEditing ? 'Update profile and tariff details' : 'Enter customer account credentials'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
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
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  marginBottom: '16px',
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Full Name / Business Entity *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Ramesh Kumar or Tech Innovations Ltd"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="ramesh@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Consumer Category *</label>
                <select
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="Residential">Residential (Homes & Apartments)</option>
                  <option value="Commercial">Commercial (Shops & Offices)</option>
                  <option value="Industrial">Industrial (Factories & Mills)</option>
                </select>
              </div>

              {isEditing ? (
                <div className="form-group">
                  <label className="form-label">Account Status</label>
                  <select
                    className="form-control"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="DISCONNECTED">DISCONNECTED</option>
                  </select>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Initial Status</label>
                  <input type="text" className="form-control" value="ACTIVE" disabled />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Installation Address *</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Plot/Door No, Street Name, Locality, City, PIN"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              ></textarea>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Consumer Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsumerModal;
