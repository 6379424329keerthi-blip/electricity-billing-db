import React, { useState } from 'react';
import { X, Receipt, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

const BillGenerateModal = ({ readings = [], onClose, onGenerateSuccess }) => {
  // Only readings without existing bills
  const unbilledReadings = readings.filter((r) => !r.generated_bill_id);
  const [selectedReadingId, setSelectedReadingId] = useState(unbilledReadings[0]?.reading_id || '');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [adjustment, setAdjustment] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activeReading = readings.find((r) => r.reading_id === parseInt(selectedReadingId, 10));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedReadingId) {
      setError('Please select an eligible meter reading.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.generateBill({
        reading_id: parseInt(selectedReadingId, 10),
        due_date: dueDate,
        adjustment_amount: parseFloat(adjustment) || 0,
      });

      if (onGenerateSuccess) {
        onGenerateSuccess(res);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Bill generation failed.');
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
              <Receipt size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
                Generate Utility Bill
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                Calculate charges using tiered progressive tariff slabs
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

            {unbilledReadings.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#64748b' }}>
                <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 10px' }} />
                <div style={{ fontWeight: 600, color: '#0f172a' }}>All Meter Readings are Billed</div>
                <div style={{ fontSize: '0.8125rem' }}>
                  There are no unbilled readings pending. Record a new reading first to generate a bill.
                </div>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Select Unbilled Meter Reading *</label>
                  <select
                    className="form-control"
                    value={selectedReadingId}
                    onChange={(e) => setSelectedReadingId(e.target.value)}
                    required
                  >
                    {unbilledReadings.map((r) => (
                      <option key={r.reading_id} value={r.reading_id}>
                        {r.consumer_name} ({r.consumer_number}) — {r.consumption_units} kWh ({r.reading_date})
                      </option>
                    ))}
                  </select>
                </div>

                {activeReading && (
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '14px',
                      marginBottom: '16px',
                      fontSize: '0.875rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>Category:</span>
                      <span style={{ fontWeight: 600 }}>{activeReading.consumer_category}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>Meter Number:</span>
                      <span style={{ fontWeight: 600 }}>{activeReading.meter_number}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>Reading Period End:</span>
                      <span style={{ fontWeight: 600 }}>{activeReading.reading_date}</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderTop: '1px dashed #cbd5e1',
                        paddingTop: '6px',
                        fontWeight: 700,
                        color: '#1e40af',
                      }}
                    >
                      <span>Units To Bill:</span>
                      <span>{activeReading.consumption_units} kWh</span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Payment Due Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Adjustment / Surcharge (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={adjustment}
                      onChange={(e) => setAdjustment(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Close
            </button>
            {unbilledReadings.length > 0 && (
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Calculating & Saving...' : 'Generate Bill Now'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillGenerateModal;
