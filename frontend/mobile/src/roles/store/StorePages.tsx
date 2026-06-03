import { ReactNode, useEffect, useMemo, useState } from 'react';
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
import { confirmStoreDelivery, getStoreDeliveries, getStoreIssues, reportStoreIssue, StoreDelivery, StoreIssue, StoreIssuePayload } from '../../api';
import { AppHeader, Badge, BottomNav, Metric, ProfileRow, QuickAction } from '../../shared/ui';

function useStoreDeliveries(status?: 'pending' | 'delivered') {
  const [deliveries, setDeliveries] = useState<StoreDelivery[]>([]);

  useEffect(() => {
    let active = true;

    getStoreDeliveries(status)
      .then((items) => {
        if (active) setDeliveries(items);
      })
      .catch(() => {
        if (active) setDeliveries([]);
      });

    return () => {
      active = false;
    };
  }, [status]);

  return { deliveries, setDeliveries };
}

function useStoreIssues() {
  const [issues, setIssues] = useState<StoreIssue[]>([]);

  useEffect(() => {
    let active = true;

    getStoreIssues()
      .then((items) => {
        if (active) setIssues(items);
      })
      .catch(() => {
        if (active) setIssues([]);
      });

    return () => {
      active = false;
    };
  }, []);

  return issues;
}

function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 text-center shadow-card">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-slate-50 text-muted">
        {icon}
      </div>
      <p className="font-extrabold text-ink">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}

export function StoreDashboard() {
  const { user } = useAuth();
  const { deliveries } = useStoreDeliveries('pending');
  const { deliveries: confirmedDeliveries } = useStoreDeliveries('delivered');
  const issues = useStoreIssues();
  const metrics = useMemo(() => ({
    pending: deliveries.length,
    arrived: confirmedDeliveries.length,
    issues: issues.length
  }), [confirmedDeliveries.length, deliveries.length, issues.length]);

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <AppHeader title="Khu nhận hàng" subtitle={user?.fullName ?? 'Nhân viên cửa hàng'} icon={<Store />} action={<Link to="/settings" className="icon-btn"><UserCircle size={20} /></Link>} />
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <div className="grid grid-cols-3 gap-2"><Metric label="Chờ nhận" value={String(metrics.pending)} icon={<PackagePlus />} /><Metric label="Đã nhận" value={String(metrics.arrived)} icon={<CheckCircle2 />} /><Metric label="Sự cố" value={String(metrics.issues)} icon={<AlertCircle />} /></div>
        <div className="grid grid-cols-2 gap-3">
          <QuickAction to="/store/receipts" icon={<ClipboardCheck />} label="Lịch sử nhận hàng" />
          <QuickAction to="/store/issues" icon={<Flag />} label="Lịch sử lỗi" />
        </div>
        {deliveries.length ? (
          deliveries.map((delivery) => <Link to={`/store/receive/${delivery.batchId}`} key={delivery.id} className="block rounded-xl bg-white p-4 shadow-card"><div className="mb-2 flex justify-between"><p className="font-bold text-ink">{delivery.batchId}</p><Badge tone="amber">Chờ xác nhận</Badge></div><p className="font-semibold text-slate-700">{delivery.product}</p><p className="text-sm text-muted">{delivery.supplier} · {delivery.eta}</p></Link>)
        ) : (
          <EmptyState icon={<PackagePlus size={24} />} title="Không có đơn chờ xác nhận" description="Chỉ các đơn đã đến kho với trạng thái ARRIVED_WAREHOUSE mới hiển thị ở đây." />
        )}
      </div>
      <BottomNav />
    </div>
  );
}

export function StoreReceiveDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { deliveries, setDeliveries } = useStoreDeliveries('pending');
  const [saving, setSaving] = useState(false);
  const delivery = deliveries.find((item) => item.batchId === id);
  if (!delivery) {
    return (
      <div className="flex min-h-full flex-col bg-paper">
        <AppHeader title="Chi tiết sản phẩm" subtitle="Không tìm thấy lô hàng" back />
        <div className="flex-1 px-5 py-5">
          <EmptyState icon={<PackageCheck size={24} />} title="Không có dữ liệu nhận hàng" description="Lô hàng này chưa có trong dữ liệu vận chuyển hiện tại." />
        </div>
        <BottomNav />
      </div>
    );
  }

  const selectedDelivery = delivery;
  const statusText = 'Chờ xác nhận';
  const [productName, quantityText] = selectedDelivery.product.split(' - ');

  async function confirmDelivery() {
    setSaving(true);
    try {
      const confirmed = await confirmStoreDelivery(selectedDelivery.batchId, user?.id);
      setDeliveries((items) => items.filter((item) => item.batchId !== confirmed.batchId));
      navigate('/store/receipts');
    } catch {
      navigate('/store/receipts');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <AppHeader title="Chi tiết sản phẩm" subtitle={selectedDelivery.batchId} back />
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 pb-28">
        <section className="rounded-2xl bg-white p-5 shadow-card">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-primary">{selectedDelivery.batchId}</p>
              <h2 className="mt-1 text-xl font-extrabold leading-tight text-ink">{productName}</h2>
              {quantityText && <p className="mt-1 text-sm font-semibold text-slate-600">{quantityText}</p>}
            </div>
            <Badge tone="amber">{statusText}</Badge>
          </div>
          <p className="rounded-xl bg-green-50 px-3 py-2 text-sm font-semibold text-slate-700">{selectedDelivery.supplier}</p>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-card">
          <ProfileRow label="Mã lô" value={selectedDelivery.batchId} />
          <ProfileRow label="Nhà cung cấp" value={selectedDelivery.supplier} />
          <ProfileRow label="Thời gian" value={selectedDelivery.eta} />
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
        <Link to={`/store/report/${selectedDelivery.batchId}`} className="outline-btn flex w-full items-center justify-center gap-2 border-red-200 text-red-600">
          <Flag size={18} /> Báo cáo sự cố
        </Link>
      </div>
    </div>
  );
}

export function StoreReceiptHistory() {
  const { deliveries: confirmedDeliveries } = useStoreDeliveries('delivered');

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <AppHeader title="Lịch sử nhận hàng" subtitle="Các lô đã xác nhận tại store" icon={<ClipboardCheck size={22} />} />
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
        {confirmedDeliveries.length ? confirmedDeliveries.map((delivery) => (
          <Link to={`/store/receipts/${delivery.batchId}`} key={delivery.id} className="block rounded-xl bg-white p-4 shadow-card">
            <div className="mb-2 flex items-start justify-between gap-3"><p className="font-bold text-ink">{delivery.batchId}</p><Badge>Đã xác nhận</Badge></div>
            <p className="font-semibold text-slate-700">{delivery.product}</p>
            <p className="mt-1 text-sm text-muted">{delivery.supplier} · {delivery.eta}</p>
          </Link>
        )) : (
          <EmptyState icon={<ClipboardCheck size={24} />} title="Chưa có lịch sử nhận hàng" description="Các lô đã xác nhận sẽ xuất hiện tại đây." />
        )}
      </div>
      <BottomNav />
    </div>
  );
}

export function StoreReceiptDetail() {
  const { id } = useParams();
  const { deliveries } = useStoreDeliveries('delivered');
  const delivery = deliveries.find((item) => item.batchId === id && item.status === 'Arrived');
  if (!delivery) {
    return (
      <div className="flex min-h-full flex-col bg-paper">
        <AppHeader title="Chi tiết đã xác nhận" subtitle="Không tìm thấy phiếu nhận" back />
        <div className="flex-1 px-5 py-5">
          <EmptyState icon={<ClipboardCheck size={24} />} title="Không có dữ liệu phiếu nhận" description="Phiếu nhận này chưa tồn tại hoặc chưa được xác nhận." />
        </div>
        <BottomNav />
      </div>
    );
  }

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

export function StoreIssueHistory() {
  const issues = useStoreIssues();

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <AppHeader title="Đơn lỗi" subtitle="Các báo cáo hàng hóa bất thường" icon={<Flag size={22} />} />
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
        {issues.length ? issues.map((issue) => (
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
        )) : (
          <EmptyState icon={<Flag size={24} />} title="Chưa có báo cáo lỗi" description="Các sự cố hàng hóa thật sẽ hiển thị tại đây sau khi được ghi nhận." />
        )}
      </div>
      <BottomNav />
    </div>
  );
}

export function StoreIssueDetail() {
  const { id } = useParams();
  const issues = useStoreIssues();
  const issue = issues.find((item) => item.id === id);
  if (!issue) {
    return (
      <div className="flex min-h-full flex-col bg-paper">
        <AppHeader title="Đơn lỗi" subtitle="Không tìm thấy báo cáo" back />
        <div className="flex-1 px-5 py-5">
          <EmptyState icon={<Flag size={24} />} title="Không có dữ liệu báo cáo" description="Báo cáo lỗi này chưa tồn tại trong dữ liệu hiện tại." />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <AppHeader title={issue.code} subtitle={issue.batchId} back />
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <section className="overflow-hidden rounded-2xl bg-white shadow-card">
          {issue.imageUrl && <img src={issue.imageUrl} alt={`Ảnh hiện trường ${issue.code}`} className="h-44 w-full object-cover" />}
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
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { deliveries, setDeliveries } = useStoreDeliveries('pending');
  const selectedDelivery = deliveries.find((delivery) => delivery.batchId === id);
  const [affectedScope, setAffectedScope] = useState<'all' | 'partial'>('all');
  const [incidentType, setIncidentType] = useState<StoreIssuePayload['incidentType']>('DAMAGED');
  const [description, setDescription] = useState('');
  const [quantityAffected, setQuantityAffected] = useState('');
  const [photoPath, setPhotoPath] = useState('');
  const [saving, setSaving] = useState(false);

  async function submitIssue() {
    if (!selectedDelivery || !description.trim()) return;

    setSaving(true);
    try {
      await reportStoreIssue(selectedDelivery.batchId, {
        accountId: user?.id,
        incidentType,
        description: description.trim(),
        quantityAffected: affectedScope === 'partial' ? Number(quantityAffected) : undefined,
        photoPath: photoPath.trim() || undefined
      });
      setDeliveries((items) => items.filter((item) => item.batchId !== selectedDelivery.batchId));
      navigate('/store/issues');
    } finally {
      setSaving(false);
    }
  }

  if (!selectedDelivery) {
    return (
      <div className="flex min-h-full flex-col bg-paper">
        <AppHeader title="Báo cáo lỗi hàng hóa" subtitle="Không tìm thấy đơn chờ xác nhận" back />
        <div className="flex-1 px-5 py-5">
          <EmptyState icon={<Flag size={24} />} title="Không có đơn để báo cáo" description="Chỉ đơn ARRIVED_WAREHOUSE đang chờ xác nhận mới có thể báo cáo sự cố." />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <AppHeader title="Báo cáo lỗi hàng hóa" subtitle={selectedDelivery.batchId} back />
      <form className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <section className="rounded-2xl bg-white p-5 shadow-card">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-ink">{selectedDelivery.batchId}</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">{selectedDelivery.product}</p>
            </div>
            <Badge tone="amber">Chờ xác nhận</Badge>
          </div>
          <p className="text-sm text-muted">{selectedDelivery.supplier} · {selectedDelivery.eta}</p>
        </section>

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
          <select className="input mb-3" value={incidentType} onChange={(event) => setIncidentType(event.target.value as StoreIssuePayload['incidentType'])}>
            <option value="DAMAGED">Bao bì hư hỏng</option>
            <option value="MISSING">Sai số lượng</option>
            <option value="QUALITY_ISSUE">Không đạt chất lượng</option>
            <option value="OTHER">Khác</option>
          </select>

          <label className="form-label">Mô tả chi tiết</label>
          <textarea className="input mb-3 min-h-28 resize-none" placeholder="Mô tả tình trạng thực tế, vị trí phát hiện và mức độ ảnh hưởng..." value={description} onChange={(event) => setDescription(event.target.value)} />

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
            <input className="input mb-3" type="number" min="0" placeholder="Nhập số lượng bị ảnh hưởng" value={quantityAffected} onChange={(event) => setQuantityAffected(event.target.value)} />
          )}

          <label className="form-label">Ảnh chụp hiện trường (nếu có)</label>
          <input className="input mb-3" placeholder="Nhập đường dẫn ảnh nếu có" value={photoPath} onChange={(event) => setPhotoPath(event.target.value)} />
        </section>

        <button className="primary-btn flex w-full items-center justify-center gap-2 bg-red-500 hover:bg-red-600" type="button" onClick={submitIssue} disabled={saving || !description.trim()}>
          <Flag size={18} /> {saving ? 'Đang gửi...' : 'Gửi báo cáo lỗi'}
        </button>
      </form>
    </div>
  );
}
