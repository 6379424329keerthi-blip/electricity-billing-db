import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Consumers from './pages/Consumers';
import SmartMeters from './pages/SmartMeters';
import MeterReadings from './pages/MeterReadings';
import Tariffs from './pages/Tariffs';
import Bills from './pages/Bills';
import Payments from './pages/Payments';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import { Zap } from 'lucide-react';

const PAGE_CONFIG = {
  dashboard: { title: 'Grid Operations Dashboard', subtitle: 'Real-time smart meter metrics and financial reconciliation' },
  consumers: { title: 'Consumer Directory', subtitle: 'Manage residential, commercial, and industrial utility accounts' },
  meters: { title: 'Smart Meter Fleet', subtitle: 'Hardware telemetry, installation history, and heartbeat status' },
  readings: { title: 'Meter Readings & Load Telemetry', subtitle: 'Record and simulate periodic kilowatt-hour (kWh) readings' },
  tariffs: { title: 'Tariff Slabs & Pricing Rules', subtitle: 'Configure progressive tiered tariff structures and grid capacity fees' },
  bills: { title: 'Electricity Invoicing & Statements', subtitle: 'Automated slab bill calculations, printable invoices, and status tracking' },
  payments: { title: 'Payments & Revenue Ledger', subtitle: 'Multi-mode clearing (Cash, UPI, Card, Net Banking) and balance tracking' },
  analytics: { title: 'Consumption & Load Analytics', subtitle: 'Peak load insights, category distribution, and anomaly detection' },
  reports: { title: 'Utility Reports & Compliance', subtitle: 'Monthly revenue, aggregated consumption, arrears, and security audits' },
  profile: { title: 'Account Settings & System Health', subtitle: 'User credentials, database engine status, and security preferences' },
};

export function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedBillForInvoice, setSelectedBillForInvoice] = useState(null);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          color: '#ffffff',
        }}
      >
        <Zap size={44} color="#3b82f6" className="animate-pulse" style={{ marginBottom: '16px' }} />
        <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>Connecting to SmartGrid Database...</div>
        <div style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '6px' }}>Verifying PostgreSQL session</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const activeConfig = PAGE_CONFIG[currentPage] || PAGE_CONFIG.dashboard;

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            onNavigate={setCurrentPage}
            onSelectBill={(bill) => {
              setSelectedBillForInvoice(bill);
              setCurrentPage('bills');
            }}
          />
        );
      case 'consumers':
        return <Consumers />;
      case 'meters':
        return <SmartMeters />;
      case 'readings':
        return <MeterReadings />;
      case 'tariffs':
        return <Tariffs />;
      case 'bills':
        return (
          <Bills
            selectedBillForInvoice={selectedBillForInvoice}
            onClearSelectedBill={() => setSelectedBillForInvoice(null)}
          />
        );
      case 'payments':
        return <Payments />;
      case 'analytics':
        return <Analytics />;
      case 'reports':
        return <Reports />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="main-content">
        <Navbar
          pageTitle={activeConfig.title}
          subtitle={activeConfig.subtitle}
        />
        <main className="page-body">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
