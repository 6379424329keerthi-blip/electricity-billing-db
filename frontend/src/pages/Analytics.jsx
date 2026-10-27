import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BarChart3, TrendingUp, Zap, AlertTriangle, ArrowUpRight } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

const Analytics = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.getDashboardSummary();
        setSummaryData(res);
      } catch (err) {
        setError(err.message || 'Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
        <Zap className="animate-pulse" size={36} color="#2563eb" style={{ margin: '0 auto 12px' }} />
        <p style={{ fontWeight: 600 }}>Calculating grid consumption analytics from PostgreSQL records...</p>
      </div>
    );
  }

  if (error || !summaryData) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b' }}>
        {error}
      </div>
    );
  }

  const { charts, highConsumptionAlerts } = summaryData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Analytics Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
              Grid Electricity Demand Trend (kWh)
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Historical monthly energy dispatch calculated from smart meter readings
            </p>
          </div>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.monthlyConsumption} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val) => [`${val.toLocaleString()} kWh`, 'Demand']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Line
                  type="monotone"
                  dataKey="kwh"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 6, fill: '#2563eb' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
              Consumer Category Consumption Comparison
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Aggregate energy share by consumer tariff segment
            </p>
          </div>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.consumptionByCategory} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val) => [`${val.toLocaleString()} kWh`, 'Total Consumed']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="kwh" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subquery Demonstrated: Consumers with Above-Average Consumption */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="#d97706" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                Anomaly Detection: Consumers with Unusually High Consumption
              </h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '2px' }}>
              Consumers with recorded electricity consumption exceeding the grid average
            </p>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Consumer Number</th>
                <th>Consumer Name</th>
                <th>Category</th>
                <th>Smart Meter</th>
                <th>Cycle Reading Date</th>
                <th>Recorded Load (kWh)</th>
                <th>Grid Threshold Deviation</th>
              </tr>
            </thead>
            <tbody>
              {highConsumptionAlerts.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: '#1e40af' }}>{row.consumer_number}</td>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{row.full_name}</td>
                  <td>
                    <span className="badge badge-category">{row.consumer_category}</span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#2563eb' }}>{row.meter_number}</td>
                  <td>{row.reading_date}</td>
                  <td style={{ fontWeight: 800, color: '#b91c1c', fontSize: '0.9375rem' }}>
                    {parseFloat(row.consumption_units).toFixed(2)} kWh
                  </td>
                  <td style={{ color: '#d97706', fontWeight: 600 }}>
                    Exceeds city-wide average by +{Math.round(parseFloat(row.consumption_units) - 1200)} kWh
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
