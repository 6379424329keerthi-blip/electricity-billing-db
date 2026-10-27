import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, Database, CheckCircle2 } from 'lucide-react';

const Navbar = ({ pageTitle, subtitle, searchTerm, onSearchChange }) => {
  const { user } = useAuth();

  return (
    <header className="top-navbar">
      <div>
        <h1 className="page-title">{pageTitle}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Search input */}
        {onSearchChange && (
          <div style={{ position: 'relative', width: '280px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              placeholder="Quick search..."
              value={searchTerm || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '36px', height: '38px', borderRadius: '20px' }}
            />
          </div>
        )}

        {/* User Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.875rem',
            }}
          >
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1e293b' }}>
              {user?.fullName}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
              {user?.role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
