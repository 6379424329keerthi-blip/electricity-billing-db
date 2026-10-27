import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Layers, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

const Tariffs = () => {
  const { isAdmin } = useAuth();
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editRate, setEditRate] = useState('');
  const [editFixed, setEditFixed] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchTariffs = async () => {
    try {
      setLoading(true);
      const res = await api.getTariffs({ category: categoryFilter });
      setTariffs(res.tariffs || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch tariffs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTariffs();
  }, [categoryFilter]);

  const handleStartEdit = (slab) => {
    setEditingId(slab.slab_id);
    setEditRate(slab.rate_per_unit);
    setEditFixed(slab.fixed_charge);
  };

  const handleSaveEdit = async (slabId) => {
    try {
      await api.updateTariff(slabId, {
        rate_per_unit: parseFloat(editRate),
        fixed_charge: parseFloat(editFixed),
      });
      setEditingId(null);
      setSuccessMsg('Tariff slab updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchTariffs();
    } catch (err) {
      alert(err.message || 'Failed to update tariff slab.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Category Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#fff',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Filter Category:</span>
          <select
            className="form-control"
            style={{ width: '180px' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Industrial">Industrial</option>
          </select>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46' }}>
          {successMsg}
        </div>
      )}

      {/* Slabs Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Slab ID</th>
              <th>Consumer Category</th>
              <th>Consumption Unit Slabs</th>
              <th>Rate / Unit (₹)</th>
              <th>Fixed Charge (₹)</th>
              <th>Duty / Tax (%)</th>
              <th>Effective From</th>
              {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  Loading active regulatory tariff slabs...
                </td>
              </tr>
            ) : tariffs.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  No tariff slabs found.
                </td>
              </tr>
            ) : (
              tariffs.map((t) => {
                const isEditing = editingId === t.slab_id;
                const min = parseFloat(t.minimum_units);
                const max = t.maximum_units !== null ? parseFloat(t.maximum_units) : null;

                return (
                  <tr key={t.slab_id}>
                    <td style={{ fontWeight: 600, color: '#64748b' }}>#{t.slab_id}</td>
                    <td>
                      <span className="badge badge-category">{t.consumer_category}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                      {max !== null ? `${min} to ${max} kWh` : `Above ${min} kWh (Unbounded)`}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.05"
                          className="form-control"
                          style={{ width: '90px', padding: '4px 8px' }}
                          value={editRate}
                          onChange={(e) => setEditRate(e.target.value)}
                        />
                      ) : (
                        <span style={{ fontWeight: 800, color: '#1e40af', fontSize: '0.9375rem' }}>
                          ₹{parseFloat(t.rate_per_unit).toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          step="1"
                          className="form-control"
                          style={{ width: '90px', padding: '4px 8px' }}
                          value={editFixed}
                          onChange={(e) => setEditFixed(e.target.value)}
                        />
                      ) : (
                        `₹${parseFloat(t.fixed_charge).toFixed(2)}`
                      )}
                    </td>
                    <td>{parseFloat(t.tax_percentage).toFixed(1)}%</td>
                    <td>{t.effective_from}</td>
                    {isAdmin && (
                      <td style={{ textAlign: 'right' }}>
                        {isEditing ? (
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => handleSaveEdit(t.slab_id)}
                              className="btn btn-success btn-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="btn btn-secondary btn-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(t)}
                            className="btn btn-secondary btn-sm"
                          >
                            <Edit2 size={13} />
                            <span>Edit Rate</span>
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tariffs;
