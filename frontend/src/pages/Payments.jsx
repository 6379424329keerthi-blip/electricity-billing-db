import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Search, CheckCircle2, Clock, Filter } from 'lucide-react';

const Payments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.getPayments({ method: methodFilter, search });
      setPayments(res.payments || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [methodFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Action Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          backgroundColor: '#fff',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', gap: '10px', flex: '1', maxWidth: '420px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              placeholder="Search reference, bill number, consumer..."
              className="form-control"
              style={{ paddingLeft: '36px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPayments()}
            />
          </div>
          <button onClick={fetchPayments} className="btn btn-secondary">
            Search
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            className="form-control"
            style={{ width: '170px' }}
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option value="">All Payment Modes</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cash">Cash</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b' }}>
          {error}
        </div>
      )}

      {/* Payments Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Receipt Ref</th>
              <th>Bill Number</th>
              <th>Consumer</th>
              <th>Amount Paid (₹)</th>
              <th>Payment Mode</th>
              <th>Transaction Date</th>
              <th>Status</th>
              <th>Recorded By</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  Loading payment transactions from database...
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  No payment transactions found matching the filter.
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.payment_id}>
                  <td style={{ fontWeight: 700, color: '#1e40af' }}>{p.payment_reference}</td>
                  <td style={{ fontWeight: 600, color: '#2563eb' }}>{p.bill_number}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.consumer_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.consumer_number}</div>
                  </td>
                  <td style={{ fontWeight: 800, color: '#059669', fontSize: '0.9375rem' }}>
                    ₹{parseFloat(p.amount_paid).toFixed(2)}
                  </td>
                  <td>
                    <span className="badge badge-category" style={{ fontWeight: 600 }}>
                      {p.payment_method}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8125rem' }}>
                    {new Date(p.payment_date).toLocaleString([], {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td>
                    <span className="badge badge-paid">
                      <CheckCircle2 size={12} style={{ marginRight: '4px' }} />
                      {p.payment_status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                    {p.recorded_by_name || 'System / Auto'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
