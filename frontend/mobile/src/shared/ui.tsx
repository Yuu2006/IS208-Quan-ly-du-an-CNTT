import { ReactNode } from 'react';
import { Link, NavLink, Navigate, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Camera,
  CalendarCheck,
  Car,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  ClipboardCheck,
  Clock3,
  Eye,
  EyeOff,
  FileCheck2,
  Flag,
  Home,
  Image,
  Layers,
  Leaf,
  LocateFixed,
  Lock,
  LogOut,
  MapPin,
  Pencil,
  PackageCheck,
  PackagePlus,
  Plus,
  QrCode,
  Save,
  ScanLine,
  Search,
  Settings,
  ShieldCheck,
  Store,
  Thermometer,
  Trash2,
  Truck,
  Upload,
  User,
  UserCircle,
  X
} from 'lucide-react';
import { CertificateStatus } from '../data';
import { UserRole, useAuth } from '../auth';

export const statusLabels = {
  draft: 'Nháp',
  ready: 'Sẵn sàng',
  in_transit: 'Đang vận chuyển',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy'
};

export const statusClasses = {
  draft: 'border-slate-300 text-slate-500 bg-slate-50',
  ready: 'border-leaf/30 text-leaf bg-green-50',
  in_transit: 'border-amber-300 text-amber-700 bg-amber-50',
  delivered: 'border-emerald-300 text-emerald-700 bg-emerald-50',
  cancelled: 'border-red-300 text-red-700 bg-red-50'
};

export const roleHome: Record<UserRole, string> = {
  inspector: '/inspector',
  farm: '/farm',
  store: '/store',
  transporter: '/transporter'
};

export const roleLabels: Record<UserRole, string> = {
  inspector: 'Khách hàng',
  farm: 'Nông trại',
  store: 'Store',
  transporter: 'Transporter'
};

export const userStatusLabels = {
  active: 'Đang hoạt động',
  inactive: 'Tạm khóa'
};

export function RequireRole({ role, children }: { role: UserRole; children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <LoginPrompt />;
  if (user.role !== role) return <Navigate to={roleHome[user.role]} replace />;
  return children;
}

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-0 sm:p-4">
      <section className="flex min-h-screen w-full items-center justify-center sm:min-h-[calc(100vh-2rem)]">
        <div className="phone-frame">
          <div className="phone-screen">{children}</div>
        </div>
      </section>
    </main>
  );
}

export function AppHeader({ title, subtitle, icon, back = false, action }: { title: string; subtitle?: string; icon?: ReactNode; back?: boolean; action?: ReactNode }) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-white/90 px-5 py-4 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {back ? (
            <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Quay lai">
              <ChevronLeft size={21} />
            </button>
          ) : icon ? (
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-green-50 border border-green-200 text-green-700">{icon}</div>
          ) : null}
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-ink">{title}</h1>
            {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
    </header>
  );
}

export function BottomNav() {
  const { user } = useAuth();
  const items = user?.role === 'store'
    ? [
        { to: '/store', label: 'Nhận hàng', icon: PackageCheck, end: true },
        { to: '/store/receipts', label: 'Lịch sử', icon: Clock3 },
        { to: '/store/issues', label: 'Lỗi', icon: Flag },
        { to: '/settings', label: 'Hồ sơ', icon: UserCircle }
      ]
    : user?.role === 'farm'
      ? [
          { to: '/farm', label: 'Nông trại', icon: Leaf, end: true },
          { to: '/farm/batches', label: 'Lô hàng', icon: Layers },
          { to: '/settings', label: 'Tôi', icon: UserCircle }
        ]
    : user?.role === 'transporter'
      ? [
          { to: '/transporter', label: 'Vận chuyển', icon: Truck, end: true },
          { to: '/transporter/checkpoint', label: 'Checkpoint', icon: MapPin },
          { to: '/settings', label: 'Hồ sơ', icon: UserCircle }
        ]
      : [
          { to: '/', label: 'Trang chủ', icon: Home },
          { to: '/scanner', label: 'Quét', icon: ScanLine },
          { to: '/farm', label: 'Nông trại', icon: Leaf },
          { to: '/store', label: 'Cửa hàng', icon: Store },
          { to: '/settings', label: 'Tôi', icon: UserCircle }
        ];
  return (
    <nav className={`sticky bottom-0 z-30 grid border-t border-line bg-white/95 px-2 py-2 backdrop-blur ${items.length === 3 ? 'grid-cols-3' : items.length === 4 ? 'grid-cols-4' : 'grid-cols-5'}`}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink key={item.to} to={item.to} end={'end' in item ? item.end : undefined} className={({ isActive }) => `grid min-h-12 place-items-center gap-1 rounded-lg px-1 py-1.5 text-center text-[11px] font-semibold leading-tight ${isActive ? 'text-primary' : 'text-muted'}`}>
            <Icon size={20} />
            <span className="block w-full truncate">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export const certificateLabels: Record<CertificateStatus, string> = {
  valid: 'Còn hiệu lực',
  expiring: 'Sắp hết hạn',
  expired: 'Hết hạn'
};

export const certificateTones: Record<CertificateStatus, 'green' | 'amber' | 'red'> = {
  valid: 'green',
  expiring: 'amber',
  expired: 'red'
};

export function ProfileRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return <div className={`flex items-center justify-between gap-4 py-3 ${last ? '' : 'border-b border-line'}`}><span className="text-sm font-semibold text-muted">{label}</span><span className="text-right text-sm font-extrabold text-ink">{value}</span></div>;
}

export function LoginPrompt() {
  return <div className="grid min-h-full place-items-center bg-paper p-8 text-center"><div><UserCircle className="mx-auto mb-4 text-muted" size={64} /><p className="mb-4 text-muted">Bạn chưa đăng nhập</p><Link to="/auth/login" className="primary-btn">Đăng nhập</Link></div></div>;
}

export function SimpleTask({ title, icon, tone }: { title: string; icon: ReactNode; tone: 'green' | 'amber' | 'blue' | 'red' }) {
  const toneClass = { green: 'text-leaf bg-green-50', amber: 'text-amber-600 bg-amber-50', blue: 'text-primary bg-green-50', red: 'text-red-600 bg-red-50' }[tone];
  return (
    <div className="min-h-full bg-paper">
      <AppHeader title={title} back />
      <div className="space-y-4 px-5 py-5">
        <div className={`grid h-24 place-items-center rounded-2xl ${toneClass}`}>{icon}</div>
        <label className="form-label">Ghi chu</label>
        <textarea className="input min-h-28 resize-none" placeholder="Nhập thông tin nghiệp vụ..." />
        <button className="primary-btn w-full">Xác nhận</button>
      </div>
    </div>
  );
}

export function QuickAction({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return <Link to={to} className="grid min-h-24 place-items-center rounded-xl bg-white p-3 text-center text-sm font-bold text-ink shadow-card"><span className="text-primary">{icon}</span>{label}</Link>;
}

export function Metric({ label, value, icon, centered = false }: { label: string; value: string; icon: ReactNode; centered?: boolean }) {
  return <div className={`rounded-xl bg-white p-3 shadow-card ${centered ? 'text-center' : ''}`}><div className={`mb-2 text-primary ${centered ? 'flex justify-center' : ''}`}>{icon}</div><p className="text-[11px] font-semibold text-muted">{label}</p><p className="mt-1 text-lg font-extrabold text-ink">{value}</p></div>;
}

export function Badge({ children, tone = 'green' }: { children: ReactNode; tone?: 'green' | 'amber' | 'red' }) {
  const classes = tone === 'red' ? 'bg-red-50 text-red-600' : tone === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-leaf';
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${classes}`}>{children}</span>;
}

export function TimelineItem({ title, completedAt, done, last }: { title: string; completedAt: string; done: boolean; last: boolean }) {
  return <div className="flex gap-3"><div className="flex flex-col items-center"><div className={`grid h-8 w-8 place-items-center rounded-full ${done ? 'bg-leaf text-white' : 'bg-slate-100 text-muted'}`}>{done ? <Check size={16} /> : <CircleDot size={16} />}</div>{!last && <div className="h-12 w-px bg-line" />}</div><div className="pt-1"><p className="font-bold text-ink">{title}</p><p className="text-xs text-muted">Bản ghi chuỗi cung ứng đã xác minh</p><p className={`mt-1 inline-flex items-center gap-1 text-xs font-bold ${done ? 'text-leaf' : 'text-muted'}`}><CalendarCheck size={13} /> {completedAt}</p></div></div>;
}
