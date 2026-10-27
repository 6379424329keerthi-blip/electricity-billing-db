import React, { useRef } from 'react';
import { X, Printer, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

const InvoiceModal = ({ bill, onClose }) => {
  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPaid = bill.bill_status === 'Paid';
  const isPartial = bill.bill_status === 'Partially Paid';
  const isOverdue = bill.bill_status === 'Overdue';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '780px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Actions */}
        <div className="modal-header no-print">
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
              Electricity Utility Invoice
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Reference Bill No: {bill.bill_number}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={handlePrint} className="btn btn-secondary btn-sm">
              <Printer size={16} />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Utility Bill Document */}
        <div className="modal-body" style={{ padding: '32px' }}>
          {/* Header Banner */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '2px solid #2563eb',
              paddingBottom: '20px',
              marginBottom: '24px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#2563eb',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Zap size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                    SMARTGRID ELECTRICITY DISTRIBUTION
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Central Power Corporation & Smart Metering Division
                  </p>
                </div>
              </div>
              <div style={{ marginTop: '12px', fontSize: '0.8125rem', color: '#475569' }}>
                GSTIN: 33AAAAA0000A1Z5 | CIN: U40108TZ2021SGC012345<br />
                Toll Free Helpline: 1800-425-9999 | support@smartgrid.io
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                  backgroundColor: isPaid ? '#ecfdf5' : isPartial ? '#fffbeb' : '#fef2f2',
                  color: isPaid ? '#047857' : isPartial ? '#b45309' : '#b91c1c',
                  border: `1px solid ${isPaid ? '#a7f3d0' : isPartial ? '#fde68a' : '#fecaca'}`,
                }}
              >
                STATUS: {bill.bill_status}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                <strong>Bill No:</strong> {bill.bill_number}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                <strong>Bill Date:</strong> {new Date(bill.generated_at).toLocaleDateString()}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#dc2626', fontWeight: 600 }}>
                <strong>Due Date:</strong> {new Date(bill.due_date).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Consumer & Meter Information Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              backgroundColor: '#f8fafc',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginBottom: '24px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Consumer Details
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                {bill.consumer_name}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#475569', marginTop: '2px' }}>
                <strong>Consumer ID:</strong> {bill.consumer_number}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#475569' }}>
                <strong>Tariff Category:</strong> {bill.consumer_category}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#475569' }}>
                <strong>Address:</strong> {bill.address}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#475569' }}>
                <strong>Phone:</strong> {bill.phone}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Smart Meter Details
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                {bill.meter_number}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#475569', marginTop: '2px' }}>
                <strong>Meter Type:</strong> {bill.meter_type || 'Digital Smart 3-Phase'}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#475569' }}>
                <strong>Billing Period:</strong> {bill.billing_period_start} to {bill.billing_period_end}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#475569' }}>
                <strong>Previous Reading:</strong> {bill.previous_reading || '0'} kWh
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#475569' }}>
                <strong>Current Reading:</strong> {bill.current_reading || '0'} kWh
              </div>
            </div>
          </div>

          {/* Consumption Units Summary Banner */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              padding: '12px 18px',
              borderRadius: '8px',
              marginBottom: '24px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8125rem', color: '#1e40af', fontWeight: 500 }}>
                Billed Cycle Energy Consumption (Current: {bill.current_reading || bill.units_consumed} kWh, Previous: {bill.previous_reading || 0} kWh)
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e3a8a' }}>
                Net Units Consumed: {bill.units_consumed} kWh
              </div>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb' }}>
              {bill.units_consumed} <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>kWh</span>
            </div>
          </div>

          {/* Itemized Charges Table */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '24px',
              fontSize: '0.875rem',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: '#334155' }}>Charge Description</th>
                <th style={{ textAlign: 'center', padding: '10px 12px', color: '#334155' }}>Basis / Rate</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', color: '#334155' }}>Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 12px' }}>
                  <strong>Energy Charges (Tiered Progressive Slabs)</strong>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Calculated according to approved regulatory slab boundaries
                  </div>
                </td>
                <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                  {bill.units_consumed} kWh
                </td>
                <td style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 600 }}>
                  ₹{parseFloat(bill.energy_charge).toFixed(2)}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 12px' }}>
                  <strong>Fixed Demand Charges</strong>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Standard monthly grid connection capacity fee
                  </div>
                </td>
                <td style={{ textAlign: 'center', padding: '10px 12px' }}>Monthly</td>
                <td style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 600 }}>
                  ₹{parseFloat(bill.fixed_charge).toFixed(2)}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 12px' }}>
                  <strong>Electricity Duty / Applicable Taxes</strong>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Statutory state levy on energy & capacity charges
                  </div>
                </td>
                <td style={{ textAlign: 'center', padding: '10px 12px' }}>Category Rate</td>
                <td style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 600 }}>
                  ₹{parseFloat(bill.tax_amount).toFixed(2)}
                </td>
              </tr>
              {parseFloat(bill.adjustment_amount) !== 0 && (
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <strong>Adjustments / Regulatory Surcharge</strong>
                  </td>
                  <td style={{ textAlign: 'center', padding: '10px 12px' }}>Adjustment</td>
                  <td style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 600 }}>
                    ₹{parseFloat(bill.adjustment_amount).toFixed(2)}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#f8fafc', borderTop: '2px solid #cbd5e1' }}>
                <td colSpan="2" style={{ padding: '12px', fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                  Total Bill Amount
                </td>
                <td style={{ textAlign: 'right', padding: '12px', fontWeight: 800, fontSize: '1.25rem', color: '#1e40af' }}>
                  ₹{parseFloat(bill.total_amount).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td colSpan="2" style={{ padding: '8px 12px', color: '#047857', fontWeight: 600 }}>
                  Amount Already Cleared
                </td>
                <td style={{ textAlign: 'right', padding: '8px 12px', color: '#047857', fontWeight: 700 }}>
                  - ₹{parseFloat(bill.total_paid || 0).toFixed(2)}
                </td>
              </tr>
              <tr style={{ backgroundColor: '#eff6ff' }}>
                <td colSpan="2" style={{ padding: '10px 12px', fontWeight: 800, fontSize: '1.125rem', color: '#991b1b' }}>
                  Net Outstanding Payable
                </td>
                <td style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 800, fontSize: '1.25rem', color: '#991b1b' }}>
                  ₹{parseFloat(bill.outstanding_balance ?? (bill.total_amount - (bill.total_paid || 0))).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Footer Terms */}
          <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px dashed #cbd5e1', paddingTop: '16px' }}>
            <div>
              <strong>Payment Instructions:</strong> Pay online via UPI, Net Banking, or Credit Card on the portal. Cheques / Drafts payable to "Central Electricity Utility". Late fee of 1.5% per month applies after due date.
            </div>
            <div style={{ marginTop: '4px', textAlign: 'center', fontStyle: 'italic' }}>
              This is a computer-generated billing statement from Electricity Consumption and Smart Meter Billing Database.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer no-print">
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          <button onClick={handlePrint} className="btn btn-primary">
            <Printer size={16} />
            Print Bill Slip
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
