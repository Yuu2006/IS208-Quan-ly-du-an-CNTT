import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
import { confirmStoreDelivery, getStoreDeliveries, getStoreIssues, StoreDelivery, StoreIssue } from '../../api';
import { deliveries as fallbackDeliveries } from '../../data';
import { AppHeader, Badge, BottomNav, Metric, ProfileRow, QuickAction } from '../../shared/ui';

function useStoreDeliveries() {
  const [deliveries, setDeliveries] = useState<StoreDelivery[]>([...fallbackDeliveries]);

  useEffect(() => {
    let active = true;

    getStoreDeliveries()
      .then((items) => {
        if (active && items.length) setDeliveries(items);
      })
      .catch(() => {
        if (active) setDeliveries([...fallbackDeliveries]);
      });

    return () => {
      active = false;
    };
  }, []);

  return { deliveries, setDeliveries };
}

function useStoreIssues() {
  const [issues, setIssues] = useState<StoreIssue[]>(issueReports);

  useEffect(() => {
    let active = true;

    getStoreIssues()
      .then((items) => {
        if (active && items.length) setIssues(items);
      })
      .catch(() => {
        if (active) setIssues(issueReports);
      });

    return () => {
      active = false;
    };
  }, []);

  return issues;
}

export function StoreDashboard() {
  const { user } = useAuth();
  const { deliveries } = useStoreDeliveries();
  const issues = useStoreIssues();
  const metrics = useMemo(() => ({
    pending: deliveries.filter((delivery) => delivery.status === 'Arriving').length,
    arrived: deliveries.filter((delivery) => delivery.status === 'Arrived').length,
    issues: issues.length
  }), [deliveries, issues]);

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <AppHeader title="Khu nhận hàng" subtitle={user?.fullName ?? 'Nhân viên cửa hàng'} icon={<Store />} action={<Link to="/settings" className="icon-btn"><UserCircle size={20} /></Link>} />
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <div className="grid grid-cols-3 gap-2"><Metric label="Chờ nhận" value={String(metrics.pending)} icon={<PackagePlus />} /><Metric label="Đã nhận" value={String(metrics.arrived)} icon={<CheckCircle2 />} /><Metric label="Sự cố" value={String(metrics.issues)} icon={<AlertCircle />} /></div>
        <div className="grid grid-cols-2 gap-3">
          <QuickAction to="/store/receipts" icon={<ClipboardCheck />} label="Lịch sử nhận hàng" />
          <QuickAction to="/store/issues" icon={<Flag />} label="Lịch sử lỗi" />
        </div>
        {deliveries.map((delivery) => <Link to={`/store/receive/${delivery.batchId}`} key={delivery.id} className="block rounded-xl bg-white p-4 shadow-card"><div className="mb-2 flex justify-between"><p className="font-bold text-ink">{delivery.batchId}</p><Badge tone={delivery.status === 'Issue' ? 'red' : delivery.status === 'Arrived' ? 'green' : 'amber'}>{delivery.status === 'Issue' ? 'Sự cố' : delivery.status === 'Arrived' ? 'Đã đến' : 'Đang đến'}</Badge></div><p className="font-semibold text-slate-700">{delivery.product}</p><p className="text-sm text-muted">{delivery.supplier} · {delivery.eta}</p></Link>)}
      </div>
      <BottomNav />
    </div>
  );
}

export function StoreReceiveDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { deliveries, setDeliveries } = useStoreDeliveries();
  const [saving, setSaving] = useState(false);
  const delivery = deliveries.find((item) => item.batchId === id) ?? deliveries[0];
  const statusTone = delivery.status === 'Issue' ? 'red' : delivery.status === 'Arrived' ? 'green' : 'amber';
  const statusText = delivery.status === 'Issue' ? 'Sự cố' : delivery.status === 'Arrived' ? 'Đã đến' : 'Đang đến';
  const [productName, quantityText] = delivery.product.split(' - ');

  async function confirmDelivery() {
    setSaving(true);
    try {
      const confirmed = await confirmStoreDelivery(delivery.batchId, user?.id);
      setDeliveries((items) => items.map((item) => item.batchId === confirmed.batchId ? confirmed : item));
      navigate('/store/receipts');
    } catch {
      navigate('/store/receipts');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <AppHeader title="Chi tiết sản phẩm" subtitle={delivery.batchId} back />
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 pb-28">
        <section className="rounded-2xl bg-white p-5 shadow-card">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-primary">{delivery.batchId}</p>
              <h2 className="mt-1 text-xl font-extrabold leading-tight text-ink">{productName}</h2>
              {quantityText && <p className="mt-1 text-sm font-semibold text-slate-600">{quantityText}</p>}
            </div>
            <Badge tone={statusTone}>{statusText}</Badge>
          </div>
          <p className="rounded-xl bg-sky-50 px-3 py-2 text-sm font-semibold text-slate-700">{delivery.supplier}</p>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-card">
          <ProfileRow label="Mã lô" value={delivery.batchId} />
          <ProfileRow label="Nhà cung cấp" value={delivery.supplier} />
          <ProfileRow label="Thời gian" value={delivery.eta} />
          <ProfileRow label="Tình trạng" value={statusText} last />
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-card">
          <label className="form-label">Ghi chú kiểm nhận</label>
          <textarea className="input min-h-24 resize-none" placeholder="Nhập số lượng thực nhận, tình trạng bao bì hoặc ghi chú chất lượng..." />
        </section>
      </div>

      <div className="sticky bottom-0 z-20 space-y-3 border-t border-line bg-white/95 px-5 py-4 backdrop-blur">
        <button className="primary-btn flex w-full items-center justify-center gap-2" type="button" onClick={confirmDelivery} disabled={saving}>
          <CheckCircle2 size={18} /> {saving ? 'Đang xác nhận...' : 'Xác nhận nhận hàng'}
        </button>
        <Link to="/store/report" className="outline-btn flex w-full items-center justify-center gap-2 border-red-200 text-red-600">
          <Flag size={18} /> Báo cáo sự cố
        </Link>
      </div>
    </div>
  );
}

export function StoreReceiptHistory() {
  const { deliveries } = useStoreDeliveries();
  const confirmedDeliveries = deliveries.filter((delivery) => delivery.status === 'Arrived');

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <AppHeader title="Lịch sử nhận hàng" subtitle="Các lô đã xác nhận tại store" icon={<ClipboardCheck size={22} />} />
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
        {confirmedDeliveries.map((delivery) => (
          <Link to={`/store/receipts/${delivery.batchId}`} key={delivery.id} className="block rounded-xl bg-white p-4 shadow-card">
            <div className="mb-2 flex items-start justify-between gap-3"><p className="font-bold text-ink">{delivery.batchId}</p><Badge>Đã xác nhận</Badge></div>
            <p className="font-semibold text-slate-700">{delivery.product}</p>
            <p className="mt-1 text-sm text-muted">{delivery.supplier} · {delivery.eta}</p>
          </Link>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}

export function StoreReceiptDetail() {
  const { id } = useParams();
  const { deliveries } = useStoreDeliveries();
  const delivery = deliveries.find((item) => item.batchId === id && item.status === 'Arrived') ?? deliveries.find((item) => item.status === 'Arrived') ?? deliveries[0];
  const [productName, quantityText] = delivery.product.split(' - ');

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <AppHeader title="Chi tiết đã xác nhận" subtitle={delivery.batchId} back />
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <section className="rounded-2xl bg-white p-5 shadow-card">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-primary">{delivery.batchId}</p>
              <h2 className="mt-1 text-xl font-extrabold leading-tight text-ink">{productName}</h2>
              {quantityText && <p className="mt-1 text-sm font-semibold text-slate-600">{quantityText}</p>}
            </div>
            <Badge>Đã xác nhận</Badge>
          </div>
          <p className="rounded-xl bg-green-50 px-3 py-2 text-sm font-semibold text-leaf">{delivery.supplier}</p>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-card">
          <ProfileRow label="Mã lô" value={delivery.batchId} />
          <ProfileRow label="Sản phẩm" value={productName} />
          <ProfileRow label="Số lượng" value={quantityText ?? 'Toàn bộ lô'} />
          <ProfileRow label="Nhà cung cấp" value={delivery.supplier} />
          <ProfileRow label="Thời gian nhận" value={delivery.eta} />
          <ProfileRow label="Trạng thái" value="Đã xác nhận" last />
        </section>
      </div>
      <BottomNav />
    </div>
  );
}

export const issueReports = [
  {
    id: 'issue-001',
    code: 'DL-2024-0001',
    batchId: 'BF-2024-0888',
    product: 'Ớt chuông - 95 kg',
    supplier: 'Delta Agro Ltd.',
    issueType: 'Bao bì hư hỏng',
    affectedQuantity: '1 phần - 18 kg',
    reportedAt: '30/05/2026 · 08:05',
    status: 'Cần xử lý',
    description: 'Một phần thùng hàng bị móp và ẩm ở góc bao bì. Nhân viên cần kiểm tra lại chất lượng trước khi nhập kho và tách riêng số lượng bị ảnh hưởng.',
    imageUrl: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 640 360%22%3E%3Cdefs%3E%3ClinearGradient id=%22bg%22 x1=%220%22 y1=%220%22 x2=%221%22 y2=%221%22%3E%3Cstop stop-color=%22%23fee2e2%22/%3E%3Cstop offset=%221%22 stop-color=%22%23f8fafc%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22640%22 height=%22360%22 fill=%22url(%23bg)%22/%3E%3Crect x=%22108%22 y=%2290%22 width=%22424%22 height=%22192%22 rx=%2228%22 fill=%22%23fff%22 stroke=%22%23fecaca%22 stroke-width=%228%22/%3E%3Cpath d=%22M170 139h300M170 183h230M170 227h270%22 stroke=%22%2394a3b8%22 stroke-width=%2216%22 stroke-linecap=%22round%22/%3E%3Cpath d=%22M462 86l58 57-55 58 48 51%22 fill=%22none%22 stroke=%22%23ef4444%22 stroke-width=%2218%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/%3E%3Ccircle cx=%22508%22 cy=%22276%22 r=%2230%22 fill=%22%23ef4444%22/%3E%3Cpath d=%22M508 260v20%22 stroke=%22%23fff%22 stroke-width=%228%22 stroke-linecap=%22round%22/%3E%3Ccircle cx=%22508%22 cy=%22292%22 r=%224%22 fill=%22%23fff%22/%3E%3C/svg%3E'
  }
];

export function StoreIssueHistory() {
  const issues = useStoreIssues();

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <AppHeader title="Đơn lỗi" subtitle="Các báo cáo hàng hóa bất thường" icon={<Flag size={22} />} />
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
        {issues.map((issue) => (
          <Link to={`/store/issues/${issue.id}`} key={issue.id} className="block rounded-xl bg-white p-4 shadow-card">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-ink">{issue.code}</p>
                <p className="mt-0.5 text-xs font-semibold text-primary">{issue.batchId}</p>
              </div>
              <Badge tone="red">{issue.status}</Badge>
            </div>
            <p className="font-semibold text-slate-700">{issue.product}</p>
            <p className="mt-1 text-sm text-muted">{issue.issueType} · {issue.reportedAt}</p>
          </Link>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}

export function StoreIssueDetail() {
  const { id } = useParams();
  const issues = useStoreIssues();
  const issue = issues.find((item) => item.id === id) ?? issues[0];

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <AppHeader title={issue.code} subtitle={issue.batchId} back />
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <section className="overflow-hidden rounded-2xl bg-white shadow-card">
          <img src={issue.imageUrl} alt={`Ảnh hiện trường ${issue.code}`} className="h-44 w-full object-cover" />
          <div className="p-5">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-ink">{issue.product}</h2>
                <p className="mt-1 text-sm text-muted">{issue.supplier}</p>
              </div>
              <Badge tone="red">{issue.status}</Badge>
            </div>
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{issue.issueType}</p>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-card">
          <ProfileRow label="Mã đơn lỗi" value={issue.code} />
          <ProfileRow label="Mã lô" value={issue.batchId} />
          <ProfileRow label="Số lượng ảnh hưởng" value={issue.affectedQuantity} />
          <ProfileRow label="Thời điểm báo cáo" value={issue.reportedAt} last />
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-card">
          <h3 className="mb-2 font-extrabold text-ink">Thông tin lỗi</h3>
          <p className="text-sm leading-6 text-slate-600">{issue.description}</p>
        </section>
      </div>
      <BottomNav />
    </div>
  );
}

export function StoreIssueReport() {
  const [affectedScope, setAffectedScope] = useState<'all' | 'partial'>('all');

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <AppHeader title="Báo cáo lỗi hàng hóa" subtitle="Nhân viên cửa hàng báo cáo" back />
      <form className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <section className="rounded-2xl bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-red-50 text-red-600">
              <Flag size={24} />
            </div>
            <div>
              <h2 className="font-extrabold text-ink">Nhân viên cửa hàng báo cáo</h2>
              <p className="text-xs text-muted">Ghi nhận sự cố để xử lý lô hàng.</p>
            </div>
          </div>

          <label className="form-label">Loại sự cố</label>
          <select className="input mb-3">
            <option>Bao bì hư hỏng</option>
            <option>Sai số lượng</option>
            <option>Không đạt chất lượng</option>
            <option>Không đúng nhiệt độ</option>
            <option>Khác</option>
          </select>

          <label className="form-label">Mô tả chi tiết</label>
          <textarea className="input mb-3 min-h-28 resize-none" placeholder="Mô tả tình trạng thực tế, vị trí phát hiện và mức độ ảnh hưởng..." />

          <label className="form-label">Số lượng bị ảnh hưởng</label>
          <div className="mb-3 grid grid-cols-2 gap-2">
            <label className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-extrabold ${affectedScope === 'all' ? 'border-red-200 bg-red-50 text-red-600' : 'border-line bg-white text-muted'}`}>
              <input className="sr-only" type="radio" name="affectedScope" checked={affectedScope === 'all'} onChange={() => setAffectedScope('all')} />
              Toàn bộ
            </label>
            <label className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-extrabold ${affectedScope === 'partial' ? 'border-red-200 bg-red-50 text-red-600' : 'border-line bg-white text-muted'}`}>
              <input className="sr-only" type="radio" name="affectedScope" checked={affectedScope === 'partial'} onChange={() => setAffectedScope('partial')} />
              1 phần
            </label>
          </div>
          {affectedScope === 'partial' && (
            <input className="input mb-3" type="number" min="0" placeholder="Nhập số lượng bị ảnh hưởng" />
          )}

          <label className="form-label">Ảnh chụp hiện trường (nếu có)</label>
          <label className="mb-3 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 bg-red-50/60 px-4 py-5 text-center text-red-600">
            <Camera size={28} />
            <span className="mt-2 text-sm font-extrabold">Chụp ảnh hoặc tải ảnh hiện trường</span>
            <span className="mt-1 text-xs font-semibold text-red-400">Hỗ trợ ảnh từ camera hoặc thư viện</span>
            <input className="sr-only" type="file" accept="image/*" capture="environment" />
          </label>
        </section>

        <button className="primary-btn flex w-full items-center justify-center gap-2 bg-red-500 hover:bg-red-600" type="button">
          <Flag size={18} /> Gửi báo cáo lỗi
        </button>
      </form>
    </div>
  );
}
