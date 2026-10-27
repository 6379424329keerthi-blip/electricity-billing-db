import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Activity, Plus, Search, Zap, CheckCircle2, Clock } from 'lucide-react';
import ReadingModal from '../components/ReadingModal';

const MeterReadings = () => {
  const { isAdmin, isStaff } = useAuth();
  const [readings, setReadings] = useState([]);
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const fetchReadings = async () => {
    try {
      setLoading(true);
      const [readingsRes, metersRes] = await Promise.all([
        api.getReadings({ search }),
        api.getMeters(),
      ]);
      setReadings(readingsRes.readings || []);
      setMeters(metersRes.meters || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch meter readings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toolbar */}
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
              placeholder="Search by meter or consumer..."
              className="form-control"
              style={{ paddingLeft: '36px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchReadings()}
            />
          </div>
          <button onClick={fetchReadings} className="btn btn-secondary">
            Search
          </button>
        </div>

        {(isAdmin || isStaff) && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary"
            >
              <Zap size={16} />
              <span>Record / Simulate Reading</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b' }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Reading ID</th>
              <th>Meter No</th>
              <th>Consumer</th>
              <th>Prev Reading</th>
              <th>Curr Reading</th>
              <th>Consumed (kWh)</th>
              <th>Reading Date</th>
              <th>Type</th>
              <th>Billing Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  Loading readings telemetry...
                </td>
              </tr>
            ) : readings.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  No meter readings found.
                </td>
              </tr>
            ) : (
              readings.map((r) => (
                <tr key={r.reading_id}>
                  <td style={{ fontWeight: 600, color: '#64748b' }}>#{r.reading_id}</td>
                  <td style={{ fontWeight: 700, color: '#2563eb' }}>{r.meter_number}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.consumer_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.consumer_category}</div>
                  </td>
                  <td>{parseFloat(r.previous_reading).toFixed(2)}</td>
                  <td style={{ fontWeight: 600 }}>{parseFloat(r.current_reading).toFixed(2)}</td>
                  <td>
                    <span
                      style={{
                        fontWeight: 800,
                        color: parseFloat(r.consumption_units) > 1000 ? '#b91c1c' : '#15803d',
                        fontSize: '0.9375rem',
                      }}
                    >
                      {parseFloat(r.consumption_units).toFixed(2)} kWh
                    </span>
                  </td>
                  <td>{r.reading_date}</td>
                  <td>
                    <span className="badge badge-category" style={{ fontSize: '0.7rem' }}>
                      {r.reading_type}
                    </span>
                  </td>
                  <td>
                    {r.generated_bill_id ? (
                      <span className="badge badge-paid">
                        <CheckCircle2 size={12} style={{ marginRight: '4px' }} />
                        Billed
                      </span>
                    ) : (
                      <span className="badge badge-partial">
                        <Clock size={12} style={{ marginRight: '4px' }} />
                        Unbilled
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <ReadingModal
          meters={meters}
          onClose={() => setShowModal(false)}
          onReadingSuccess={() => fetchReadings()}
        />
      )}
    </div>
  );
};

export default MeterReadings;
