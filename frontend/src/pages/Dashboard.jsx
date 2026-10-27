import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Cpu,
  Zap,
  Receipt,
  DollarSign,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

const PIE_COLORS = ['#10b981', '#ef4444', '#f59e0b', '#dc2626', '#3b82f6'];

const Dashboard = ({ onNavigate, onSelectBill }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.getDashboardSummary();
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
        <Zap className="animate-pulse" size={40} color="#3b82f6" style={{ margin: '0 auto 12px' }} />
        <p style={{ fontWeight: 600 }}>Loading real-time grid metrics from database...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '24px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b' }}>
        <p style={{ fontWeight: 600 }}>Error loading dashboard: {error}</p>
      </div>
    );
  }

  const { summary, charts, recentReadings, recentBills, highConsumptionAlerts } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* High Consumption Alert Banner if any */}
      {highConsumptionAlerts && highConsumptionAlerts.length > 0 && user?.role !== 'CONSUMER' && (
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.875rem' }}>
                Anomaly Detection: Unusually High Consumption Detected
              </div>
              <div style={{ fontSize: '0.775rem', color: '#b45309' }}>
                {highConsumptionAlerts.length} consumers exceeded city-wide average consumption this cycle. Top load: {highConsumptionAlerts[0]?.full_name} ({highConsumptionAlerts[0]?.consumption_units} kWh).
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('analytics')}
            className="btn btn-secondary btn-sm"
            style={{ borderColor: '#fde68a', backgroundColor: '#ffffff', color: '#92400e' }}
          >
            Investigate Anomaly
          </button>
        </div>
      )}

      {/* 7 Summary Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Total Consumers (Admin/Staff only) */}
        {user?.role !== 'CONSUMER' && (
          <div className="metric-card" style={{ '--card-accent': '#2563eb' }}>
            <div className="metric-icon-wrap" style={{ '--icon-bg': '#eff6ff', '--icon-color': '#2563eb' }}>
              <Users size={24} />
            </div>
            <div>
              <div className="metric-label">Total Consumers</div>
              <div className="metric-value">{summary.totalConsumers.toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Active Smart Meters */}
        <div className="metric-card" style={{ '--card-accent': '#10b981' }}>
          <div className="metric-icon-wrap" style={{ '--icon-bg': '#ecfdf5', '--icon-color': '#10b981' }}>
            <Cpu size={24} />
          </div>
          <div>
            <div className="metric-label">{user?.role === 'CONSUMER' ? 'My Smart Meter' : 'Active Meters'}</div>
            <div className="metric-value">{summary.activeSmartMeters.toLocaleString()}</div>
          </div>
        </div>

        {/* Total Electricity Consumed (kWh) */}
        <div className="metric-card" style={{ '--card-accent': '#f59e0b' }}>
          <div className="metric-icon-wrap" style={{ '--icon-bg': '#fffbeb', '--icon-color': '#f59e0b' }}>
            <Zap size={24} />
          </div>
          <div>
            <div className="metric-label">{user?.role === 'CONSUMER' ? 'My Total Energy (kWh)' : 'Total Load (kWh)'}</div>
            <div className="metric-value">{summary.totalElectricityKwh.toLocaleString()}</div>
          </div>
        </div>

        {/* Total Bills Generated / Received */}
        <div className="metric-card" style={{ '--card-accent': '#8b5cf6' }}>
          <div className="metric-icon-wrap" style={{ '--icon-bg': '#f5f3ff', '--icon-color': '#8b5cf6' }}>
            <Receipt size={24} />
          </div>
          <div>
            <div className="metric-label">{user?.role === 'CONSUMER' ? 'Bills Received' : 'Bills Generated'}</div>
            <div className="metric-value">{summary.totalBillsGenerated.toLocaleString()}</div>
          </div>
        </div>

        {/* Total Billed Amount */}
        <div className="metric-card" style={{ '--card-accent': '#0ea5e9' }}>
          <div className="metric-icon-wrap" style={{ '--icon-bg': '#f0f9ff', '--icon-color': '#0ea5e9' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="metric-label">Total Billed</div>
            <div className="metric-value">₹{summary.totalBilledAmount.toLocaleString()}</div>
          </div>
        </div>

        {/* Total Amount Paid (Consumer) / Collected Revenue (Admin/Staff) */}
        <div className="metric-card" style={{ '--card-accent': '#059669' }}>
          <div className="metric-icon-wrap" style={{ '--icon-bg': '#ecfdf5', '--icon-color': '#059669' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="metric-label">{user?.role === 'CONSUMER' ? 'Total Amount Paid' : 'Collected Revenue'}</div>
            <div className="metric-value">₹{summary.totalAmountCollected.toLocaleString()}</div>
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="metric-card" style={{ '--card-accent': '#ef4444' }}>
          <div className="metric-icon-wrap" style={{ '--icon-bg': '#fef2f2', '--icon-color': '#ef4444' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="metric-label">{user?.role === 'CONSUMER' ? 'Current Balance Due' : 'Outstanding Dues'}</div>
            <div className="metric-value" style={{ color: '#dc2626' }}>
              ₹{summary.outstandingPayments.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Interactive Visual Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Chart 1: Monthly Electricity Consumption (BarChart) */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Monthly Electricity Consumption (kWh)
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Aggregated smart meter readings across grid cycles
              </p>
            </div>
            <span className="badge badge-category">kWh Metric</span>
          </div>

          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyConsumption} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value) => [`${value} kWh`, 'Consumption']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="kwh" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Billing Revenue (Billed vs Collected) */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Revenue Invoiced vs Collected (₹)
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Cashflow clearance and accounts receivable comparison
              </p>
            </div>
            <span className="badge badge-paid">Clearance</span>
          </div>

          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyRevenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value) => [`₹${value.toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="billed" name="Billed (₹)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="collected" name="Collected (₹)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Paid vs Unpaid Bills (PieChart) */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Bill Settlement Pipeline
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Proportion of settled vs unpaid utility bills
              </p>
            </div>
            <span className="badge badge-category">Status Share</span>
          </div>

          <div style={{ height: '260px', display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.billsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {charts.billsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, item) => [`${value} bills (₹${item.payload.amount})`, name]}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Consumption by Category */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Consumption by Category
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Industrial, Commercial, and Residential load profile
              </p>
            </div>
            <span className="badge badge-category">Distribution</span>
          </div>

          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts.consumptionByCategory}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }} />
                <Tooltip
                  formatter={(value) => [`${value.toLocaleString()} kWh`, 'Total Consumed']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="kwh" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Readings & Recent Bills */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Recent Meter Readings */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Recent Smart Meter Readings
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Latest logged telemetric readings</p>
            </div>
            <button onClick={() => onNavigate('readings')} className="btn btn-secondary btn-sm">
              <span>View All</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Meter</th>
                  <th>Consumer</th>
                  <th>Units (kWh)</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentReadings.slice(0, 5).map((r) => (
                  <tr key={r.reading_id}>
                    <td style={{ fontWeight: 600, color: '#1e40af' }}>{r.meter_number}</td>
                    <td>{r.consumer_name}</td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{r.consumption_units}</td>
                    <td>{r.reading_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Bills Generated */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Recent Electricity Bills
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Latest invoiced accounts</p>
            </div>
            <button onClick={() => onNavigate('bills')} className="btn btn-secondary btn-sm">
              <span>View All</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill No</th>
                  <th>Consumer</th>
                  <th>Amount (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBills.slice(0, 5).map((b) => (
                  <tr
                    key={b.bill_id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      if (onSelectBill) onSelectBill(b);
                    }}
                  >
                    <td style={{ fontWeight: 600, color: '#2563eb' }}>{b.bill_number}</td>
                    <td>{b.consumer_name}</td>
                    <td style={{ fontWeight: 700 }}>₹{parseFloat(b.total_amount).toFixed(2)}</td>
                    <td>
                      <span
                        className={`badge ${
                          b.bill_status === 'Paid'
                            ? 'badge-paid'
                            : b.bill_status === 'Partially Paid'
                            ? 'badge-partial'
                            : 'badge-unpaid'
                        }`}
                      >
                        {b.bill_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
