import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import type { AdminUser } from '../../auth';

interface MainLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: AdminUser;
  onLogout: () => void;
  children: ReactNode;
}

/** Layout chính của Admin gồm sidebar và vùng nội dung nghiệp vụ. */
export function MainLayout({ activeTab, setActiveTab, user, onLogout, children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
