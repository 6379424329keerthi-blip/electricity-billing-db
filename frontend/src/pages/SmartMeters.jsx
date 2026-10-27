import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Cpu, Plus, Search, CheckCircle2, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import MeterModal from '../components/MeterModal';

const SmartMeters = () => {
  const { isAdmin, isStaff } = useAuth();
  const [meters, setMeters] = useState([]);
  const [consumers, setConsumers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const fetchMeters = async () => {
    try {
      setLoading(true);
      const [meterRes, consumerRes] = await Promise.all([
        api.getMeters({ status: statusFilter, search }),
        api.getConsumers(),
      ]);
      setMeters(meterRes.meters || []);
      setConsumers(consumerRes.consumers || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch meters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeters();
  }, [statusFilter]);

  const handleStatusToggle = async (meterId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
    try {
      await api.updateMeter(meterId, { meter_status: newStatus });
      fetchMeters();
    } catch (err) {
      alert(err.message || 'Failed to update meter status');
    }
  };

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
              placeholder="Search meter number or consumer..."
              className="form-control"
              style={{ paddingLeft: '36px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchMeters()}
            />
          </div>
          <button onClick={fetchMeters} className="btn btn-secondary">
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
            <option value="ACTIVE">ACTIVE</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>

          {isAdmin && (
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              <Plus size={16} />
              <span>Register Smart Meter</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b' }}>
          {error}
        </div>
      )}

      {/* Smart Meters Grid Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '18px',
        }}
      >
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Loading smart meters telemetry...
          </div>
        ) : meters.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
            No smart meters registered matching the filter.
          </div>
        ) : (
          meters.map((m) => {
            const isActive = m.meter_status === 'ACTIVE';
            const isMaint = m.meter_status === 'MAINTENANCE';

            return (
              <div
                key={m.meter_id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: `4px solid ${isActive ? '#10b981' : isMaint ? '#f59e0b' : '#94a3b8'}`,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
                        {m.meter_number}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {m.meter_type}
                      </div>
                    </div>
                    <span className={`badge ${isActive ? 'badge-active' : isMaint ? 'badge-maintenance' : 'badge-unpaid'}`}>
                      {m.meter_status}
                    </span>
                  </div>

                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '0.8125rem',
                      marginBottom: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>Assigned Consumer:</span>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{m.consumer_name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>Category:</span>
                      <span className="badge badge-category" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                        {m.consumer_category}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Readings Logged:</span>
                      <span style={{ fontWeight: 700, color: '#2563eb' }}>{m.total_readings_count} cycles</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.725rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={12} />
                    <span>Last heartbeat: {new Date(m.last_communication_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(m.last_communication_at).toLocaleDateString()})</span>
                  </div>
                </div>

                {(isAdmin || isStaff) && (
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleStatusToggle(m.meter_id, m.meter_status)}
                      className="btn btn-secondary btn-sm"
                    >
                      <RefreshCw size={12} />
                      <span>{isActive ? 'Mark Maintenance' : 'Set to Active'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <MeterModal
          consumers={consumers}
          onClose={() => setShowModal(false)}
          onSaveSuccess={() => fetchMeters()}
        />
      )}
    </div>
  );
};

export default SmartMeters;
