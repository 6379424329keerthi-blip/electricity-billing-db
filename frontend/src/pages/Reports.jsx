import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FileSpreadsheet, Printer, Shield, DollarSign, Activity, AlertCircle } from 'lucide-react';

const Reports = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('monthlyRevenue');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchActiveReport = async () => {
    try {
      setLoading(true);
      setError('');
      let res;
      if (activeTab === 'monthlyRevenue') {
        res = await api.getMonthlyRevenueReport();
        setReportData(res.report || []);
      } else if (activeTab === 'monthlyConsumption') {
        res = await api.getMonthlyConsumptionReport();
        setReportData(res.report || []);
      } else if (activeTab === 'outstandingBills') {
        res = await api.getOutstandingBillsReport();
        setReportData(res.report || []);
      } else if (activeTab === 'auditLogs') {
        res = await api.getAuditLogs();
        setReportData(res.logs || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveReport();
  }, [activeTab]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header and Print Button */}
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
        {/* Report Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('monthlyRevenue')}
            className={`btn btn-sm ${activeTab === 'monthlyRevenue' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <DollarSign size={14} />
            <span>Monthly Revenue & Efficiency</span>
          </button>
          <button
            onClick={() => setActiveTab('monthlyConsumption')}
            className={`btn btn-sm ${activeTab === 'monthlyConsumption' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Activity size={14} />
            <span>Monthly Consumption Summary</span>
          </button>
          <button
            onClick={() => setActiveTab('outstandingBills')}
            className={`btn btn-sm ${activeTab === 'outstandingBills' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <AlertCircle size={14} />
            <span>Outstanding & Overdue Dues</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('auditLogs')}
              className={`btn btn-sm ${activeTab === 'auditLogs' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Shield size={14} />
              <span>Security Audit Trail</span>
            </button>
          )}
        </div>

        <button onClick={() => window.print()} className="btn btn-secondary btn-sm">
          <Printer size={14} />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b' }}>
          {error}
        </div>
      )}

      {/* Report 1: Monthly Revenue & Collection Efficiency */}
      {activeTab === 'monthlyRevenue' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Billing Month</th>
                <th>Total Bills</th>
                <th>Units Billed (kWh)</th>
                <th>Gross Invoiced (₹)</th>
                <th>Total Collected (₹)</th>
                <th>Uncollected Dues (₹)</th>
                <th>Collection Efficiency (%)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '36px' }}>Generating revenue statement...</td></tr>
              ) : (
                reportData.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: '#1e40af' }}>{row.billing_month}</td>
                    <td>{row.total_bills}</td>
                    <td style={{ fontWeight: 600 }}>{parseFloat(row.total_units_billed).toLocaleString()} kWh</td>
                    <td style={{ fontWeight: 800 }}>₹{parseFloat(row.total_billed_amount).toLocaleString()}</td>
                    <td style={{ fontWeight: 800, color: '#059669' }}>₹{parseFloat(row.total_collected_amount).toLocaleString()}</td>
                    <td style={{ fontWeight: 700, color: '#dc2626' }}>₹{parseFloat(row.uncollected_balance).toLocaleString()}</td>
                    <td>
                      <span className="badge badge-paid">
                        {parseFloat(row.collection_efficiency_pct).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Report 2: Monthly Consumption Summary */}
      {activeTab === 'monthlyConsumption' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Consumer Category</th>
                <th>Active Consumers</th>
                <th>Readings Count</th>
                <th>Total Load (kWh)</th>
                <th>Average Load / Consumer</th>
                <th>Peak Load (kWh)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '36px' }}>Generating consumption summary...</td></tr>
              ) : (
                reportData.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: '#1e40af' }}>{row.month}</td>
                    <td><span className="badge badge-category">{row.consumer_category}</span></td>
                    <td>{row.total_consumers}</td>
                    <td>{row.total_readings}</td>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>{parseFloat(row.total_kwh).toLocaleString()} kWh</td>
                    <td>{parseFloat(row.avg_kwh).toFixed(2)} kWh</td>
                    <td style={{ fontWeight: 700, color: '#b91c1c' }}>{parseFloat(row.max_kwh).toLocaleString()} kWh</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Report 3: Outstanding & Overdue Bills */}
      {activeTab === 'outstandingBills' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bill Number</th>
                <th>Consumer Number</th>
                <th>Consumer Name</th>
                <th>Category</th>
                <th>Phone</th>
                <th>Total Bill (₹)</th>
                <th>Amount Paid (₹)</th>
                <th>Outstanding (₹)</th>
                <th>Due Date</th>
                <th>Days Past Due</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" style={{ textAlign: 'center', padding: '36px' }}>Generating arrears list...</td></tr>
              ) : (
                reportData.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: '#1e40af' }}>{row.bill_number}</td>
                    <td>{row.consumer_number}</td>
                    <td style={{ fontWeight: 600 }}>{row.consumer_name}</td>
                    <td><span className="badge badge-category">{row.consumer_category}</span></td>
                    <td>{row.phone}</td>
                    <td>₹{parseFloat(row.total_amount).toFixed(2)}</td>
                    <td style={{ color: '#059669' }}>₹{parseFloat(row.total_paid).toFixed(2)}</td>
                    <td style={{ fontWeight: 800, color: '#dc2626' }}>₹{parseFloat(row.outstanding_amount).toFixed(2)}</td>
                    <td>{row.due_date}</td>
                    <td>
                      <span className={`badge ${row.days_past_due > 0 ? 'badge-overdue' : 'badge-partial'}`}>
                        {row.days_past_due > 0 ? `${row.days_past_due} days overdue` : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Report 4: Audit Logs */}
      {activeTab === 'auditLogs' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Timestamp</th>
                <th>User / Operator</th>
                <th>Action</th>
                <th>Entity Type</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '36px' }}>Loading audit logs...</td></tr>
              ) : (
                reportData.map((row) => (
                  <tr key={row.log_id}>
                    <td style={{ fontWeight: 600, color: '#64748b' }}>#{row.log_id}</td>
                    <td style={{ fontSize: '0.8125rem' }}>
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{row.user_name || 'System Engine'}</div>
                      <div style={{ fontSize: '0.725rem', color: '#64748b' }}>{row.user_role}</div>
                    </td>
                    <td>
                      <span className="badge badge-category" style={{ fontWeight: 700 }}>
                        {row.action}
                      </span>
                    </td>
                    <td><code>{row.entity_type}</code></td>
                    <td style={{ fontSize: '0.8125rem', color: '#334155' }}>{row.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reports;
