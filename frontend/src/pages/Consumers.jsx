import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, Search, Edit2, Trash2, Cpu, Eye, AlertCircle } from 'lucide-react';
import ConsumerModal from '../components/ConsumerModal';

const Consumers = () => {
  const { isAdmin, isStaff } = useAuth();
  const [consumers, setConsumers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selectedConsumer, setSelectedConsumer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [consumerToEdit, setConsumerToEdit] = useState(null);
  const [error, setError] = useState('');

  const fetchConsumers = async () => {
    try {
      setLoading(true);
      const res = await api.getConsumers({ search, category });
      setConsumers(res.consumers || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch consumers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsumers();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchConsumers();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete consumer "${name}"? This action requires no active billing history.`)) {
      return;
    }
    try {
      await api.deleteConsumer(id);
      fetchConsumers();
    } catch (err) {
      alert(err.message || 'Failed to delete consumer');
    }
  };

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
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flex: '1', maxWidth: '480px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              placeholder="Search by name, consumer number, phone, email..."
              className="form-control"
              style={{ paddingLeft: '36px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Filter
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            className="form-control"
            style={{ width: '170px' }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Industrial">Industrial</option>
          </select>

          {(isAdmin || isStaff) && (
            <button
              onClick={() => {
                setConsumerToEdit(null);
                setShowModal(true);
              }}
              className="btn btn-primary"
            >
              <Plus size={16} />
              <span>Add Consumer</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b' }}>
          {error}
        </div>
      )}

      {/* Consumers Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Consumer No</th>
              <th>Full Name</th>
              <th>Category</th>
              <th>Phone</th>
              <th>Smart Meter</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  Loading consumers from database...
                </td>
              </tr>
            ) : consumers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  No consumer records match the search filter.
                </td>
              </tr>
            ) : (
              consumers.map((c) => (
                <tr key={c.consumer_id}>
                  <td style={{ fontWeight: 700, color: '#1e40af' }}>{c.consumer_number}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{c.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.email}</div>
                  </td>
                  <td>
                    <span className="badge badge-category">{c.consumer_category}</span>
                  </td>
                  <td>{c.phone}</td>
                  <td>
                    {c.meter_number ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Cpu size={14} color="#2563eb" />
                        <span style={{ fontWeight: 600, color: '#2563eb' }}>{c.meter_number}</span>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No meter assigned</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        c.status === 'ACTIVE'
                          ? 'badge-active'
                          : c.status === 'INACTIVE'
                          ? 'badge-partial'
                          : 'badge-unpaid'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        title="Edit profile"
                        onClick={() => {
                          setConsumerToEdit(c);
                          setShowModal(true);
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        <Edit2 size={13} />
                      </button>
                      {isAdmin && (
                        <button
                          title="Delete consumer"
                          onClick={() => handleDelete(c.consumer_id, c.full_name)}
                          className="btn btn-danger btn-sm"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Consumer Modal */}
      {showModal && (
        <ConsumerModal
          consumer={consumerToEdit}
          onClose={() => setShowModal(false)}
          onSaveSuccess={() => fetchConsumers()}
        />
      )}
    </div>
  );
};

export default Consumers;
