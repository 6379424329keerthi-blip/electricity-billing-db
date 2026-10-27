import React, { useState } from 'react';
import { X, Cpu, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const MeterModal = ({ consumers = [], onClose, onSaveSuccess }) => {
  const [meterNumber, setMeterNumber] = useState(`MTR-${Math.floor(3000 + Math.random() * 9000)}`);
  const [consumerId, setConsumerId] = useState(consumers[0]?.consumer_id || '');
  const [meterType, setMeterType] = useState('Digital Smart 3-Phase');
  const [installationDate, setInstallationDate] = useState(new Date().toISOString().split('T')[0]);
  const [meterStatus, setMeterStatus] = useState('ACTIVE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!consumerId) {
      setError('Please select a consumer to link this smart meter.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createMeter({
        meter_number: meterNumber.trim(),
        consumer_id: parseInt(consumerId, 10),
        meter_type: meterType,
        installation_date: installationDate,
        meter_status: meterStatus,
      });

      if (onSaveSuccess) {
        onSaveSuccess(res);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to register smart meter.');
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
              <Cpu size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
                Register Smart Meter
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                Assign smart hardware unit to a consumer account
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
              <label className="form-label">Meter Serial / Hardware ID *</label>
              <input
                type="text"
                className="form-control"
                value={meterNumber}
                onChange={(e) => setMeterNumber(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assign To Consumer *</label>
              <select
                className="form-control"
                value={consumerId}
                onChange={(e) => setConsumerId(e.target.value)}
                required
              >
                {consumers.map((c) => (
                  <option key={c.consumer_id} value={c.consumer_id}>
                    {c.consumer_number} — {c.full_name} ({c.consumer_category})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Hardware Type</label>
                <select
                  className="form-control"
                  value={meterType}
                  onChange={(e) => setMeterType(e.target.value)}
                >
                  <option value="Digital Smart 1-Phase">Digital Smart 1-Phase</option>
                  <option value="Digital Smart 3-Phase">Digital Smart 3-Phase</option>
                  <option value="High-Tension Smart CT-PT">High-Tension Smart CT-PT</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Operational Status</label>
                <select
                  className="form-control"
                  value={meterStatus}
                  onChange={(e) => setMeterStatus(e.target.value)}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Installation Date</label>
              <input
                type="date"
                className="form-control"
                value={installationDate}
                onChange={(e) => setInstallationDate(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Registering...' : 'Register Smart Meter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeterModal;
