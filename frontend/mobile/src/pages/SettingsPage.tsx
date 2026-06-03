import { Link, useNavigate } from 'react-router-dom';
import { LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../auth';
import { AppHeader, Badge, BottomNav, LoginPrompt, ProfileRow, roleLabels, userStatusLabels } from '../shared/ui';
import { CustomerNav } from '../roles/inspector/InspectorPages';

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return <LoginPrompt />;
  return (
    <div className="flex min-h-full flex-col bg-paper">
      <AppHeader title="Hồ sơ" subtitle="Thông tin tài khoản" icon={<UserCircle size={22} />} />
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <section className="rounded-2xl bg-white p-5 text-center shadow-card"><div className="mx-auto mb-3 grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-leaf to-primary text-3xl font-bold text-white">{user.fullName[0]}</div><h2 className="font-extrabold text-ink">{user.fullName}</h2><p className="text-sm text-muted">{user.email}</p><Badge>{roleLabels[user.role]}</Badge></section>
        <section className="rounded-2xl bg-white p-5 shadow-card">
          <ProfileRow label="Họ tên" value={user.fullName} />
          <ProfileRow label="Email" value={user.email} />
          <ProfileRow label="SĐT" value={user.phone} />
          <ProfileRow label="Vai trò" value={roleLabels[user.role]} />
          <ProfileRow label="Trạng thái" value={userStatusLabels[user.status]} last />
        </section>
        <button className="outline-btn flex w-full items-center justify-center gap-2 border-red-200 text-red-600" onClick={() => { logout(); navigate('/auth/login'); }}><LogOut size={18} /> Đăng xuất</button>
      </div>
      {user.role === 'inspector' ? <CustomerNav /> : <BottomNav />}
    </div>
  );
}
