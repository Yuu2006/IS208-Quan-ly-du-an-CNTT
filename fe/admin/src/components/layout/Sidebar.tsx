import { LayoutDashboard, Users, Truck, ShieldAlert, BarChart3, ShieldCheck, Leaf, Bell, AlertTriangle, Info } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'accounts', label: 'Tài khoản', icon: Users },
    { id: 'partners', label: 'Đối tác', icon: ShieldCheck },
    { id: 'shipping', label: 'Vận chuyển', icon: Truck },
    { id: 'audit', label: 'Nhật ký hệ thống', icon: ShieldAlert },
    { id: 'reports', label: 'Báo cáo', icon: BarChart3 },
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-xl bg-sage-600 text-white flex items-center justify-center shadow-md">
          <Leaf size={24} />
        </div>
        <div>
          <div className="font-bold text-xl text-slate-800 tracking-tight">BlueFood</div>
          <div className="text-xs uppercase tracking-widest text-slate-450 font-medium">Quản trị chuỗi cung ứng thực phẩm sạch</div>
        </div>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${isActive
                ? 'bg-sage-100 text-sage-800 border border-sage-200 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
            >
              <div className={`p-1.5 rounded-lg ${isActive ? 'bg-sage-200/50 text-sage-700' : 'bg-slate-100 text-slate-500'}`}>
                <Icon size={18} />
              </div>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-100 relative">
        {showNotifications && (
          <div className="absolute bottom-full left-0 mb-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <h4 className="font-bold text-slate-800 text-sm">Thông báo</h4>
              <button className="text-[4px] text-slate-400 font-medium hover:text-slate-600 uppercase tracking-wider">Đánh dấu đã đọc</button>
            </div>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              <div className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3 group/item">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
                  <AlertTriangle size={14} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800 mb-0.5">Cảnh báo lô hàng #1293</div>
                  <div className="text-xs text-slate-500 leading-relaxed">Nhiệt độ bảo quản vượt ngưỡng cho phép tại kho trung chuyển.</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-2">10 phút trước</div>
                </div>
              </div>
              <div className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3 group/item">
                <div className="w-8 h-8 rounded-full bg-sage-100 text-sage-600 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
                  <Info size={14} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800 mb-0.5">Đối tác mới đăng ký</div>
                  <div className="text-xs text-slate-500 leading-relaxed">Nông trại Hòa Bình vừa gửi yêu cầu phê duyệt hồ sơ.</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-2">1 giờ trước</div>
                </div>
              </div>
            </div>
            <div className="p-3 text-center border-t border-slate-100 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
              <span className="text-xs font-bold text-slate-600">Xem tất cả thông báo</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group border border-transparent hover:border-slate-200 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-sage-600 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">
              AD
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-slate-800 group-hover:text-sage-700 transition-colors truncate">Quản trị viên</div>
              <div className="text-xs text-slate-500 truncate">Super Admin</div>
            </div>
          </div>

          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-full transition-all duration-200 ${showNotifications
              ? 'bg-sage-100 text-sage-600 shadow-inner'
              : 'text-slate-400 hover:text-slate-600 hover:bg-gray-100'
              }`}
          >
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full border-2 border-white"></span>
            <Bell size={20} />
          </button>
        </div>
      </div>
    </aside>
  );
}

