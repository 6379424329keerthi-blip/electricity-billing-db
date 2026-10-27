import React, { useState, useEffect } from 'react';
import { X, Activity, Zap, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const ReadingModal = ({ meters = [], onClose, onReadingSuccess }) => {
  const [metersList, setMetersList] = useState(meters);
  const [selectedMeterId, setSelectedMeterId] = useState(meters[0]?.meter_id || '');
  const [prevReading, setPrevReading] = useState(0);
  const [currReading, setCurrReading] = useState('');
  const [readingDate, setReadingDate] = useState(new Date().toISOString().split('T')[0]);
  const [readingType, setReadingType] = useState('Regular');
  const [loading, setLoading] = useState(false);
  const [fetchingPrev, setFetchingPrev] = useState(false);
  const [error, setError] = useState('');

  // Sync or fetch meters if list is empty
  useEffect(() => {
    if (meters && meters.length > 0) {
      setMetersList(meters);
      if (!selectedMeterId) {
        setSelectedMeterId(meters[0].meter_id);
      }
    } else {
      api.getMeters()
        .then((res) => {
          if (res.meters && res.meters.length > 0) {
            setMetersList(res.meters);
            setSelectedMeterId(res.meters[0].meter_id);
          }
        })
        .catch((err) => console.error('Failed to load meters for modal:', err));
    }
  }, [meters]);

  // Fetch previous reading when meter is selected
  useEffect(() => {
    if (!selectedMeterId) return;

    const fetchLatest = async () => {
      setFetchingPrev(true);
      try {
        const res = await api.getLatestMeterReading(selectedMeterId);
        if (res.latestReading) {
          const prev = parseFloat(res.latestReading.current_reading);
          setPrevReading(prev);
          setCurrReading((prev + 180).toFixed(2));
        } else {
          setPrevReading(0);
          setCurrReading('150.00');
        }
      } catch (err) {
        console.error('Error fetching latest reading:', err);
      } finally {
        setFetchingPrev(false);
      }
    };

    fetchLatest();
  }, [selectedMeterId]);

  const p = parseFloat(prevReading) || 0;
  const c = parseFloat(currReading) || 0;
  const consumption = c >= p ? (c - p).toFixed(2) : 0;

  const handleSimulateRandom = () => {
    // Add realistic 120-250 kWh increment
    const increment = Math.floor(120 + Math.random() * 130);
    setCurrReading((p + increment).toFixed(2));
    setReadingType('Simulated');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (c < p) {
      setError('Current reading cannot be lower than previous reading.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createReading({
        meter_id: parseInt(selectedMeterId, 10),
        previous_reading: p,
        current_reading: c,
        reading_date: readingDate,
        reading_type: readingType,
      });

      if (onReadingSuccess) {
        onReadingSuccess(res);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record meter reading.');
    } finally {
      setLoading(false);
    }
  };

  const activeMeter = metersList.find((m) => m.meter_id === parseInt(selectedMeterId, 10));

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
              <Activity size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
                Record Smart Meter Reading
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                Simulate or record periodic electricity consumption
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

            {/* Smart Meter Dropdown */}
            <div className="form-group">
              <label className="form-label">Select Smart Meter *</label>
              <select
                className="form-control"
                value={selectedMeterId}
                onChange={(e) => setSelectedMeterId(e.target.value)}
                required
              >
                {metersList.map((m) => (
                  <option key={m.meter_id} value={m.meter_id}>
                    {m.meter_number} — {m.consumer_name} ({m.consumer_category})
                  </option>
                ))}
              </select>
              {activeMeter && (
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                  Consumer: {activeMeter.consumer_name} | {activeMeter.consumer_category} | {activeMeter.meter_type}
                </div>
              )}
            </div>

            {/* Readings Inputs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Previous Reading (kWh) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={prevReading}
                  onChange={(e) => setPrevReading(e.target.value)}
                  disabled={fetchingPrev}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Current Reading (kWh) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={currReading}
                  onChange={(e) => setCurrReading(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Auto Simulation Button */}
            <div style={{ marginBottom: '16px' }}>
              <button
                type="button"
                onClick={handleSimulateRandom}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', borderColor: '#bfdbfe', backgroundColor: '#eff6ff', color: '#1e40af' }}
              >
                <Zap size={14} />
                ⚡ Auto-Simulate Typical Monthly Reading (+120 to +250 kWh)
              </button>
            </div>

            {/* Live Calculation Strip */}
            <div
              style={{
                backgroundColor: c >= p ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${c >= p ? '#bbf7d0' : '#fecaca'}`,
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Calculated Net Consumption:
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#334155' }}>
                  {c} kWh - {p} kWh
                </div>
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: c >= p ? '#15803d' : '#b91c1c',
                }}
              >
                {c >= p ? `${consumption} kWh` : 'INVALID (Negative)'}
              </div>
            </div>

            {/* Date and Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Reading Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={readingDate}
                  onChange={(e) => setReadingDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reading Method</label>
                <select
                  className="form-control"
                  value={readingType}
                  onChange={(e) => setReadingType(e.target.value)}
                >
                  <option value="Regular">Regular Smart Sync</option>
                  <option value="Simulated">Simulated Demo</option>
                  <option value="Estimated">Estimated Assessment</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || c < p}>
              {loading ? 'Recording...' : 'Save Meter Reading'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReadingModal;
