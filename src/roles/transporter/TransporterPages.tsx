import { Link } from 'react-router-dom';
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
import { useAuth } from '../../auth';
import { BottomNav, AppHeader, Badge, Metric } from '../../shared/ui';

export const transportHistory = [
  { id: 'tr-001', batchId: 'BF-2024-0891', time: '30/05/2026 · 08:45', event: 'CP-02 cập nhật vị trí tại cổng nông trại, 4°C, lô hàng ổn định' },
  { id: 'tr-002', batchId: 'BF-2024-0891', time: '30/05/2026 · 10:20', event: 'CP-03 cập nhật vị trí trên QL20, 5°C, lô hàng ổn định' },
  { id: 'tr-003', batchId: 'BF-2024-0891', time: '30/05/2026 · 12:05', event: 'CP-04 cập nhật gần điểm đến, 4°C, lô hàng ổn định' }
];

export function DriverDashboard() {
  const { user } = useAuth();
  const currentTransport = {
    batchId: 'BF-2024-0891',
    route: 'Green Valley Farm → Siêu thị Co.op Quận 1',
    location: 'CP-03',
    temperature: '4°C',
    condition: 'Ổn định'
  };

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <AppHeader title="Vận chuyển" subtitle={user?.fullName ?? 'Transporter'} icon={<Truck />} action={<Link to="/settings" className="icon-btn"><UserCircle size={20} /></Link>} />
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <section className="rounded-2xl bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-extrabold text-ink">{currentTransport.batchId}</h2><Badge tone="amber">Đang vận chuyển</Badge></div>
          <p className="text-sm text-muted">{currentTransport.route}</p>
          <div className="mt-5 grid grid-cols-4 gap-1 text-center text-[11px] text-muted">{['Đã nhận', 'Đang đi', 'Gần điểm đến', 'Đã giao'].map((step, index) => <div key={step}><div className={`mx-auto mb-1 grid h-7 w-7 place-items-center rounded-full ${index < 2 ? 'bg-leaf text-white' : 'bg-slate-100'}`}>{index < 2 ? <Check size={14} /> : <CircleDot size={14} />}</div>{step}</div>)}</div>
        </section>
        <div className="grid grid-cols-3 gap-2">
          <Metric label="Vị trí hiện tại" value={currentTransport.location} icon={<MapPin />} centered />
          <Metric label="Nhiệt độ hiện tại" value={currentTransport.temperature} icon={<Thermometer />} centered />
          <Metric label="Tình trạng hiện tại" value={currentTransport.condition} icon={<PackageCheck />} centered />
        </div>
        <Link to="/transporter/checkpoint" className="outline-btn flex w-full items-center justify-center gap-2"><MapPin size={18} /> Cập nhật checkpoint</Link>
        <section className="rounded-2xl bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-ink">Nhật ký checkpoint</h3>
            <Link to="/transporter/checkpoint" className="text-xs font-bold text-primary">Cập nhật</Link>
          </div>
          {transportHistory.slice(0, 3).map((item) => <p key={item.id} className="border-b border-line py-3 text-sm text-slate-600 last:border-0">{item.time} - {item.event}</p>)}
        </section>
      </div>
      <BottomNav />
    </div>
  );
}

export function TransportCheckpointUpdate() {
  return (
    <div className="flex min-h-full flex-col bg-paper">
      <AppHeader title="Cập nhật checkpoint" subtitle="Vị trí, nhiệt độ và tình trạng lô hàng" icon={<MapPin size={22} />} />
      <form className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <section className="rounded-2xl bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="font-extrabold text-ink">BF-2024-0891</p>
              <p className="text-xs text-muted">Green Valley Farm → Siêu thị Co.op Quận 1</p>
            </div>
            <Badge tone="amber">Đang vận chuyển</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Metric label="Trạm" value="CP-02" icon={<MapPin />} />
            <Metric label="Nhiệt độ" value="4°C" icon={<Thermometer />} />
            <Metric label="Lô hàng" value="Ổn định" icon={<PackageCheck />} />
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-card">
          <label className="form-label">Trạm kiểm soát</label>
          <select className="input mb-3">
            <option>CP-01 - Cổng nông trại</option>
            <option>CP-02 - Kho trung chuyển</option>
            <option>CP-03 - Trạm kiểm soát QL20</option>
            <option>CP-04 - Gần điểm giao</option>
          </select>

          <label className="form-label">Vị trí hiện tại</label>
          <div className="field mb-3">
            <MapPin size={18} />
            <input placeholder="Nhập vị trí hoặc tọa độ GPS" />
            <button type="button" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sky-50 text-primary" aria-label="Tự cập nhật GPS">
              <LocateFixed size={17} />
            </button>
          </div>

          <label className="form-label">Nhiệt độ khoang hàng</label>
          <input className="input mb-3" placeholder="Ví dụ: 4°C" />

          <label className="form-label">Tình trạng lô hàng</label>
          <select className="input mb-3">
            <option>Ổn định</option>
            <option>Cần theo dõi</option>
            <option>Không đạt điều kiện vận chuyển</option>
          </select>

          <label className="form-label">Ghi chú checkpoint</label>
          <textarea className="input min-h-24 resize-none" placeholder="Ghi nhận tình trạng thực tế tại trạm kiểm soát..." />
          <button className="primary-btn mt-4 w-full" type="button">Lưu cập nhật checkpoint</button>
        </section>
      </form>
      <BottomNav />
    </div>
  );
}
