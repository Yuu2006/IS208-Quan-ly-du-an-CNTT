import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: ReactNode;
}

export function MainLayout({ activeTab, setActiveTab, children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header activeTab={activeTab} />
        <main className="flex-1 p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
