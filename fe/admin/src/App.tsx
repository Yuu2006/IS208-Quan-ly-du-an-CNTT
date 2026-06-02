import { useState } from 'react';
import dashboardData from './mocks/dashboard.json';

// Layout
import { MainLayout } from './components/layout/MainLayout';

// Feature Screens
import { DashboardScreen } from './features/dashboard/DashboardScreen';
import { AccountsScreen } from './features/accounts/AccountsScreen';
import { PartnersScreen } from './features/partners/PartnersScreen';
import { ShippingScreen } from './features/shipping/ShippingScreen';
import { AuditLogScreen } from './features/audit/AuditLogScreen';
import { ReportsScreen } from './features/reports/ReportsScreen';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [targetShipmentId, setTargetShipmentId] = useState<string | null>(null);

  const {
    dashboardSummary,
    accounts,
    partners,
    logistics,
    auditLogScreen,
    reports,
  } = dashboardData;

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <DashboardScreen data={dashboardSummary} />}
      {activeTab === 'accounts' && <AccountsScreen data={accounts} />}
      {activeTab === 'partners' && <PartnersScreen data={partners} />}
      {activeTab === 'shipping' && <ShippingScreen data={logistics} targetShipmentId={targetShipmentId} />}
      {activeTab === 'audit' && <AuditLogScreen data={auditLogScreen} />}
      {activeTab === 'reports' && <ReportsScreen data={reports} onNavigateToShipment={(id) => {
        setTargetShipmentId(id);
        setActiveTab('shipping');
      }} />}
    </MainLayout>
  );
}

export default App;
