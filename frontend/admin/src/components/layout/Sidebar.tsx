import { BarChart3, LayoutDashboard, ShieldAlert, ShieldCheck, Truck, Users, ChevronLeft, ChevronRight, AlertTriangle, Bell, Info, LogOut, X } from 'lucide-react';
import { useState } from 'react';
import type { AdminUser } from '../../auth';
import { BlueFoodLogo } from '../common/BlueFoodLogo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: AdminUser;
  onLogout: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'accounts', label: 'Tài khoản', icon: Users },
  { id: 'partners', label: 'Đối tác', icon: ShieldCheck },
  { id: 'shipping', label: 'Lô hàng & vận chuyển', icon: Truck },
  { id: 'audit', label: 'Nhật ký hệ thống', icon: ShieldAlert },
  { id: 'reports', label: 'Báo cáo', icon: BarChart3 },
];

/** Sidebar Admin điều hướng các phân hệ quản trị. */
export function Sidebar({ activeTab, setActiveTab, user, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return 'AD';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const initials = getInitials(user?.fullName);

  return (
    <aside className={`sticky top-0 z-50 flex h-screen flex-col border-r border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 ${isCollapsed ? 'w-20 items-center px-4' : 'w-72'}`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors hover:text-sage-600 focus:outline-none"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className={`mb-6 flex items-center gap-3 ${isCollapsed ? 'flex-col' : ''}`}>
        <BlueFoodLogo compact />
        {!isCollapsed && (
          <div className="min-w-0">
            <div className="text-lg font-bold tracking-tight text-slate-800">BlueFood</div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-slate-500">Quản trị chuỗi cung ứng</div>
          </div>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-2 w-full">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-bold transition-all duration-200 ${isActive
                ? 'border-sage-200 bg-sage-100 text-sage-800 shadow-sm'
                : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <div className={`rounded-lg p-1.5 shrink-0 ${isActive ? 'bg-sage-200/50 text-sage-700' : 'bg-slate-100 text-slate-500'}`}>
                <Icon size={18} />
              </div>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className={`relative mt-auto border-t border-slate-100 pt-6 flex ${isCollapsed ? 'flex-col items-center gap-4' : 'w-full items-center justify-between'}`}>
        {showNotifications && (
          <div className="absolute bottom-full left-0 z-50 mb-4 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-4">
              <h4 className="text-sm font-bold text-slate-800">Thông báo</h4>
              <button className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600">Đánh dấu đã đọc</button>
            </div>
            <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
              <div className="flex cursor-pointer gap-3 p-4 transition-colors hover:bg-slate-50">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <AlertTriangle size={14} />
                </div>
                <div>
                  <div className="mb-0.5 text-sm font-semibold text-slate-800">Cảnh báo lô hàng #1293</div>
                  <div className="text-xs leading-relaxed text-slate-500">Nhiệt độ bảo quản vượt ngưỡng cho phép tại kho trung chuyển.</div>
                  <div className="mt-2 text-[10px] font-medium text-slate-400">10 phút trước</div>
                </div>
              </div>
              <div className="flex cursor-pointer gap-3 p-4 transition-colors hover:bg-slate-50">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sage-600">
                  <Info size={14} />
                </div>
                <div>
                  <div className="mb-0.5 text-sm font-semibold text-slate-800">Đối tác mới đăng ký</div>
                  <div className="text-xs leading-relaxed text-slate-500">Nông trại Hòa Bình vừa gửi yêu cầu phê duyệt hồ sơ.</div>
                  <div className="mt-2 text-[10px] font-medium text-slate-400">1 giờ trước</div>
                </div>
              </div>
            </div>
            <div className="cursor-pointer border-t border-slate-100 bg-slate-50 p-3 text-center transition-colors hover:bg-slate-100">
              <span className="text-xs font-bold text-slate-600">Xem tất cả thông báo</span>
            </div>
          </div>
        )}

        {isCollapsed ? (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative rounded-full p-2 transition-all duration-200 ${showNotifications ? 'bg-sage-100 text-sage-600 shadow-inner' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
              title="Thông báo"
            >
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-amber-500" />
              <Bell size={20} />
            </button>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-600 text-sm font-bold text-white shadow-md ring-2 ring-white">
              {initials}
            </div>
            <div className="w-full h-px bg-slate-100 my-1"></div>
            <button 
              onClick={() => setShowLogoutModal(true)} 
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600" 
              title="Đăng xuất"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-3">
            {/* Tầng 1: Thông tin người dùng & Thông báo */}
            <div className="flex items-center gap-3 px-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-600 text-sm font-bold text-white shadow-md ring-2 ring-white">
                {initials}
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div title={user?.fullName} className="text-sm font-bold text-slate-800 truncate leading-tight">
                  {user?.fullName}
                </div>
                <div className="text-xs font-semibold text-slate-500 truncate mt-0.5">Super Admin</div>
              </div>

              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative shrink-0 rounded-full p-2 transition-all duration-200 ${showNotifications ? 'bg-sage-100 text-sage-600 shadow-inner' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                title="Thông báo"
              >
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-amber-500" />
                <Bell size={20} />
              </button>
            </div>

            <div className="w-full h-px bg-slate-100"></div>

            {/* Tầng 2: Nút đăng xuất */}
            <button 
              onClick={() => setShowLogoutModal(true)} 
              className="flex w-full h-8 items-center gap-2 rounded-md px-2 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600" 
            >
              <LogOut size={16} />
              <span className="truncate">Đăng xuất</span>
            </button>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white shadow-sm border border-red-100 text-red-500">
                  <LogOut size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Đăng xuất</h3>
              </div>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Bạn có chắc chắn muốn đăng xuất khỏi hệ thống BlueFood không? Phiên làm việc của bạn sẽ kết thúc.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    setShowLogoutModal(false);
                    onLogout();
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
