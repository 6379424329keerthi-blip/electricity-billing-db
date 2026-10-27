import React, { useState } from 'react';
import { X, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const PaymentModal = ({ bill, onClose, onPaymentSuccess }) => {
  const outstanding = parseFloat(bill.outstanding_balance ?? (bill.total_amount - (bill.total_paid || 0)));
  const [amount, setAmount] = useState(outstanding.toFixed(2));
  const [method, setMethod] = useState('UPI');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError('Payment amount must be greater than zero.');
      return;
    }

    if (val > outstanding + 0.05) {
      setError(`Payment cannot exceed outstanding balance of ₹${outstanding.toFixed(2)}.`);
      return;
    }

    setLoading(true);
    try {
      const res = await api.recordPayment({
        bill_id: bill.bill_id,
        amount_paid: val,
        payment_method: method,
        payment_reference: reference.trim() || undefined,
      });

      if (onPaymentSuccess) {
        onPaymentSuccess(res);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Payment transaction failed. Please check inputs.');
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
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CreditCard size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
                Record Bill Payment
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                Bill Ref: {bill.bill_number}
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

            {/* Bill Summary Strip */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '14px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                <span style={{ color: '#64748b' }}>Consumer:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>
                  {bill.consumer_name} ({bill.consumer_number})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                <span style={{ color: '#64748b' }}>Total Billed:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>
                  ₹{parseFloat(bill.total_amount).toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                <span style={{ color: '#64748b' }}>Already Paid:</span>
                <span style={{ fontWeight: 600, color: '#059669' }}>
                  ₹{parseFloat(bill.total_paid || 0).toFixed(2)}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1rem',
                  borderTop: '1px dashed #cbd5e1',
                  paddingTop: '8px',
                }}
              >
                <span style={{ fontWeight: 700, color: '#0f172a' }}>Outstanding Balance:</span>
                <span style={{ fontWeight: 800, color: '#dc2626' }}>
                  ₹{outstanding.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Amount Input */}
            <div className="form-group">
              <label className="form-label">Payment Amount (INR) *</label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: 700,
                    color: '#64748b',
                  }}
                >
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={outstanding}
                  className="form-control"
                  style={{ paddingLeft: '28px', fontSize: '1rem', fontWeight: 600 }}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setAmount(outstanding.toFixed(2))}
                  className="btn btn-secondary btn-sm"
                >
                  Full Payment (₹{outstanding.toFixed(2)})
                </button>
                {outstanding > 500 && (
                  <button
                    type="button"
                    onClick={() => setAmount((outstanding / 2).toFixed(2))}
                    className="btn btn-secondary btn-sm"
                  >
                    50% Partial (₹{(outstanding / 2).toFixed(2)})
                  </button>
                )}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="form-group">
              <label className="form-label">Payment Mode *</label>
              <select
                className="form-control"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                required
              >
                <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                <option value="Card">Debit / Credit Card</option>
                <option value="Bank Transfer">Net Banking / NEFT / IMPS</option>
                <option value="Cash">Cash at Counter</option>
              </select>
            </div>

            {/* Custom Payment Reference */}
            <div className="form-group">
              <label className="form-label">Transaction Reference (Optional)</label>
              <input
                type="text"
                placeholder="e.g. UPI-REF-9842718 / Bank Ref (auto-generated if empty)"
                className="form-control"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Processing...' : `Confirm Payment of ₹${parseFloat(amount || 0).toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
