import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Cpu,
  Activity,
  Layers,
  Receipt,
  CreditCard,
  BarChart3,
  FileSpreadsheet,
  User,
  LogOut,
  Zap,
} from 'lucide-react';

const Sidebar = ({ currentPage, onNavigate }) => {
  const { user, logout, isAdmin, isStaff, isConsumer } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'STAFF', 'CONSUMER'] },
    { id: 'consumers', label: 'Consumers', icon: Users, roles: ['ADMIN', 'STAFF'] },
    { id: 'meters', label: 'Smart Meters', icon: Cpu, roles: ['ADMIN', 'STAFF'] },
    { id: 'readings', label: 'Meter Readings', icon: Activity, roles: ['ADMIN', 'STAFF', 'CONSUMER'] },
    { id: 'tariffs', label: 'Tariff Rules', icon: Layers, roles: ['ADMIN', 'STAFF'] },
    { id: 'bills', label: 'Electricity Bills', icon: Receipt, roles: ['ADMIN', 'STAFF', 'CONSUMER'] },
    { id: 'payments', label: 'Payments', icon: CreditCard, roles: ['ADMIN', 'STAFF', 'CONSUMER'] },
    { id: 'analytics', label: 'Consumption Analytics', icon: BarChart3, roles: ['ADMIN', 'STAFF', 'CONSUMER'] },
    { id: 'reports', label: 'Reports & Audits', icon: FileSpreadsheet, roles: ['ADMIN', 'STAFF'] },
    { id: 'profile', label: 'Account Profile', icon: User, roles: ['ADMIN', 'STAFF', 'CONSUMER'] },
  ];

  const allowedItems = menuItems.filter((item) => item.roles.includes(user?.role));

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6, #10b981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
            }}
          >
            <Zap size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: '700', letterSpacing: '-0.02em', color: '#fff' }}>
              SmartGrid DB
            </div>
            <div style={{ fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Electricity & Billing
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 12px 10px' }}>
          Navigation
        </div>
        <ul style={{ listStyle: 'none' }}>
          {allowedItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <li key={item.id} style={{ marginBottom: '4px' }}>
                <button
                  onClick={() => onNavigate(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: active ? '600' : '500',
                    color: active ? '#ffffff' : '#94a3b8',
                    backgroundColor: active ? 'rgba(59, 130, 246, 0.18)' : 'transparent',
                    border: active ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = '#94a3b8';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon size={18} color={active ? '#60a5fa' : '#94a3b8'} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Footer Profile */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#2563eb',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '0.875rem',
                flexShrink: 0,
              }}
            >
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user?.fullName || 'User'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span
                  style={{
                    fontSize: '0.675rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor:
                      user?.role === 'ADMIN'
                        ? '#dc2626'
                        : user?.role === 'STAFF'
                        ? '#d97706'
                        : '#059669',
                    color: '#fff',
                  }}
                >
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
