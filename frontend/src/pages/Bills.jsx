import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Receipt, Plus, Search, Printer, CreditCard, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import InvoiceModal from '../components/InvoiceModal';
import PaymentModal from '../components/PaymentModal';
import BillGenerateModal from '../components/BillGenerateModal';

const Bills = ({ selectedBillForInvoice, onClearSelectedBill }) => {
  const { user, isAdmin, isStaff } = useAuth();
  const [bills, setBills] = useState([]);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [billForPayment, setBillForPayment] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [error, setError] = useState('');

  const fetchBills = async () => {
    try {
      setLoading(true);
      const [billsRes, readingsRes] = await Promise.all([
        api.getBills({ status: statusFilter, search }),
        (isAdmin || isStaff) ? api.getReadings() : Promise.resolve({ readings: [] }),
      ]);
      setBills(billsRes.bills || []);
      setReadings(readingsRes.readings || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [statusFilter]);

  // Open invoice if passed via props from dashboard
  useEffect(() => {
    if (selectedBillForInvoice) {
      setActiveInvoice(selectedBillForInvoice);
      if (onClearSelectedBill) onClearSelectedBill();
    }
  }, [selectedBillForInvoice]);

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
              placeholder="Search bill number or consumer..."
              className="form-control"
              style={{ paddingLeft: '36px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchBills()}
            />
          </div>
          <button onClick={fetchBills} className="btn btn-secondary">
            Search
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            className="form-control"
            style={{ width: '160px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Overdue">Overdue</option>
          </select>

          {(isAdmin || isStaff) && (
            <button onClick={() => setShowGenerateModal(true)} className="btn btn-primary">
              <Plus size={16} />
              <span>Generate Bill</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b' }}>
          {error}
        </div>
      )}

      {/* Bills Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Bill Number</th>
              <th>Consumer</th>
              <th>Period</th>
              <th>Units (kWh)</th>
              <th>Total (₹)</th>
              <th>Paid (₹)</th>
              <th>Outstanding (₹)</th>
              <th>Due Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  Loading electricity billing records...
                </td>
              </tr>
            ) : bills.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  No billing statements found matching the filter.
                </td>
              </tr>
            ) : (
              bills.map((b) => {
                const isPaid = b.bill_status === 'Paid';
                const isPartial = b.bill_status === 'Partially Paid';
                const isOverdue = b.bill_status === 'Overdue';
                const outstanding = parseFloat(b.outstanding_balance ?? (b.total_amount - (b.total_paid || 0)));

                return (
                  <tr key={b.bill_id}>
                    <td style={{ fontWeight: 700, color: '#1e40af' }}>{b.bill_number}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{b.consumer_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {b.consumer_number} | {b.consumer_category}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>
                      {b.billing_period_start} to {b.billing_period_end}
                    </td>
                    <td style={{ fontWeight: 700 }}>{parseFloat(b.units_consumed).toFixed(2)}</td>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>
                      ₹{parseFloat(b.total_amount).toFixed(2)}
                    </td>
                    <td style={{ color: '#059669', fontWeight: 600 }}>
                      ₹{parseFloat(b.total_paid || 0).toFixed(2)}
                    </td>
                    <td style={{ color: outstanding > 0 ? '#dc2626' : '#059669', fontWeight: 700 }}>
                      ₹{outstanding.toFixed(2)}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: isOverdue ? '#dc2626' : '#64748b' }}>
                      {b.due_date}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          isPaid
                            ? 'badge-paid'
                            : isPartial
                            ? 'badge-partial'
                            : isOverdue
                            ? 'badge-overdue'
                            : 'badge-unpaid'
                        }`}
                      >
                        {b.bill_status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          title="View / Print Invoice Slip"
                          onClick={() => setActiveInvoice(b)}
                          className="btn btn-secondary btn-sm"
                        >
                          <Printer size={13} />
                          <span>Invoice</span>
                        </button>
                        {!isPaid && (
                          <button
                            title="Pay this bill"
                            onClick={() => setBillForPayment(b)}
                            className="btn btn-success btn-sm"
                          >
                            <CreditCard size={13} />
                            <span>Pay</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {activeInvoice && (
        <InvoiceModal bill={activeInvoice} onClose={() => setActiveInvoice(null)} />
      )}

      {billForPayment && (
        <PaymentModal
          bill={billForPayment}
          onClose={() => setBillForPayment(null)}
          onPaymentSuccess={() => fetchBills()}
        />
      )}

      {showGenerateModal && (
        <BillGenerateModal
          readings={readings}
          onClose={() => setShowGenerateModal(false)}
          onGenerateSuccess={() => fetchBills()}
        />
      )}
    </div>
  );
};

export default Bills;
