import { useState, useEffect } from 'react';
import dashboardData from './mocks/dashboard.json';
import { AuthProvider, useAuth } from './auth';

// Layout
import { MainLayout } from './components/layout/MainLayout';
import { AdminLoginPage } from './pages/AdminLoginPage';

// Feature Screens
import { DashboardScreen } from './features/dashboard/DashboardScreen';
import { AccountsScreen } from './features/accounts/AccountsScreen';
import { PartnersScreen } from './features/partners/PartnersScreen';
import { ShippingScreen } from './features/shipping/ShippingScreen';
import { AuditLogScreen } from './features/audit/AuditLogScreen';
import { ReportsScreen } from './features/reports/ReportsScreen';

/** Component bảo vệ route Admin và chỉ render dashboard khi đã đăng nhập quản trị. */
function AdminAppContent() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [targetShipmentId, setTargetShipmentId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab !== 'shipping') {
      setTargetShipmentId(null);
    }
  }, [activeTab]);

  const {
    dashboardSummary,
    accounts,
    partners,
    logistics,
    auditLogScreen,
    reports,
  } = dashboardData;

  if (!user) return <AdminLoginPage />;

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={logout}>
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

/** Khởi tạo AuthProvider riêng cho giao diện Admin BlueFood. */
function App() {
  return (
    <AuthProvider>
      <AdminAppContent />
    </AuthProvider>
  );
}

export default App;
