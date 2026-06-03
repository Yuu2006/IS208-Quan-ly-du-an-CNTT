import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import QRCode from 'qrcode';
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
import { assignBatchTransport, createBatchRecord, createCertificateForBatch, deleteCertificateFromBatch, DeliveryStaff, DestinationStore, getDeliveryStaff, getDestinationStores, updateBatchRecord, updateCertificateForBatch } from '../../api';
import { Batch, BatchStatus, Certificate, CertificateStatus } from '../../data';
import { AppHeader, Badge, BottomNav, LoginPrompt, Metric, ProfileRow, certificateLabels, certificateTones, statusClasses, statusLabels } from '../../shared/ui';

export const emptyCertificate: Omit<Certificate, 'id'> = {
  name: '',
  issuer: '',
  issuedDate: '',
  expiryDate: '',
  status: 'valid',
  note: ''
};

export type CertificateAction = 'upload' | 'update' | 'delete' | 'search';

function buildTraceQrValue(batch: Batch) {
  const rawPath = batch.qrCodePath?.trim();
  const tracePath = rawPath && /^https?:\/\//i.test(rawPath)
    ? new URL(rawPath).pathname
    : rawPath;
  const shouldUseStoredPath = tracePath?.startsWith('/trace/') && !tracePath.toLowerCase().endsWith('.png');
  const normalizedPath = shouldUseStoredPath ? tracePath : `/trace/${encodeURIComponent(batch.batchCode)}`;

  return `${window.location.origin}${normalizedPath}`;
}

function BatchQrImage({ batch }: { batch: Batch }) {
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    let active = true;
    const value = buildTraceQrValue(batch);

    QRCode.toDataURL(value, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 208,
      color: {
        dark: '#24324a',
        light: '#ffffff'
      }
    }).then((src) => {
      if (active) setImageSrc(src);
    }).catch(() => {
      if (active) setImageSrc('');
    });

    return () => {
      active = false;
    };
  }, [batch]);

  if (!imageSrc) {
    return <QrCode size={142} className="text-ink" strokeWidth={1.7} />;
  }

  return <img src={imageSrc} alt={`QR truy xuất lô ${batch.batchCode}`} className="h-52 w-52" />;
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function toDateInputValue(value: string) {
  const [day, month, year] = value.split('/').map((part) => part.trim());
  if (!day || !month || !year) return value;
  return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function fromDateInputValue(value: string) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  if (!day || !month || !year) return value;
  return `${day}/${month}/${year}`;
}

function nextBatchCode(batches: Batch[]) {
  const usedCodes = new Set(batches.map((batch) => batch.batchCode));
  const maxSequence = batches.reduce((max, batch) => {
    const match = /^BF-2026-(\d+)$/.exec(batch.batchCode);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  for (let sequence = maxSequence + 1; sequence < maxSequence + 10_000; sequence += 1) {
    const code = `BF-2026-${String(sequence).padStart(4, '0')}`;
    if (!usedCodes.has(code)) return code;
  }

  return `BF-2026-${Date.now().toString(36).toUpperCase()}`;
}

export function FarmDashboard({ batches }: { batches: Batch[] }) {
  const pageSize = 2;
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(batches.length / pageSize));
  const visibleBatches = batches.slice((page - 1) * pageSize, page * pageSize);
  const stats = useMemo(() => ({
    total: batches.length,
    delivered: batches.filter((batch) => batch.status === 'delivered').length,
    transit: batches.filter((batch) => batch.status === 'in_transit').length,
    certs: batches.reduce((total, batch) => total + batch.certifications.length, 0)
  }), [batches]);
  return (
    <div className="flex min-h-full flex-col bg-paper">
      <AppHeader title="Nông trại" subtitle="Quản lý lô hàng" icon={<Leaf size={22} />} action={<Link to="/settings" className="icon-btn"><UserCircle /></Link>} />
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <div className="grid grid-cols-2 gap-3">
          <Metric label="Tổng lô hàng" value={String(stats.total)} icon={<Layers />} />
          <Metric label="Đã giao" value={String(stats.delivered)} icon={<CheckCircle2 />} />
          <Metric label="Đang VC" value={String(stats.transit)} icon={<Car />} />
          <Metric label="Chứng chỉ" value={String(stats.certs)} icon={<ShieldCheck />} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/farm/batches/create" className="primary-btn flex items-center justify-center gap-2"><PackagePlus size={19} /> Thêm lô</Link>
          <Link to="/farm/batches" className="outline-btn flex items-center justify-center gap-2"><Layers size={19} /> Tất cả</Link>
        </div>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-ink">Lô hàng gần đây</h3>
            <Link to="/farm/batches" className="text-xs font-bold text-primary">Quản lý</Link>
          </div>
          {visibleBatches.map((batch) => <BatchCard key={batch.id} batch={batch} />)}
          <PaginationControls page={page} pageCount={pageCount} onPageChange={setPage} />
        </section>
      </div>
      <BottomNav />
    </div>
  );
}

export function BatchList({ batches }: { batches: Batch[] }) {
  const pageSize = 4;
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(batches.length / pageSize));
  const visibleBatches = batches.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <AppHeader title="Quản lý lô hàng" subtitle={`${batches.length} lô đang quản lý`} action={<Link to="/farm/batches/create" className="icon-btn"><Plus size={21} /></Link>} />
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
        {visibleBatches.map((batch) => <BatchCard key={batch.id} batch={batch} />)}
        <PaginationControls page={page} pageCount={pageCount} onPageChange={setPage} />
      </div>
      <BottomNav />
    </div>
  );
}

export function BatchCard({ batch }: { batch: Batch }) {
  return (
    <Link to={`/farm/batches/${batch.id}`} className="mb-3 block rounded-xl bg-white p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between gap-2"><p className="font-bold text-leaf">{batch.batchCode}</p><span className={`rounded-full border px-2 py-1 text-[11px] font-bold ${statusClasses[batch.status]}`}>{statusLabels[batch.status]}</span></div>
      <p className="font-semibold text-ink">{batch.productName}</p>
      <p className="text-sm text-muted">{batch.quantity} kg · {batch.location}</p>
      <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-muted">
        <ShieldCheck size={15} className="text-primary" />
        {batch.certifications.length} chứng chỉ
      </div>
    </Link>
  );
}

export function PaginationControls({ page, pageCount, onPageChange }: { page: number; pageCount: number; onPageChange: (page: number) => void }) {
  return (
    <div className="mt-4 flex items-center justify-between rounded-xl border border-line bg-white px-3 py-2 shadow-card">
      <button
        type="button"
        className="grid h-9 w-9 place-items-center rounded-full bg-green-50 text-primary disabled:bg-slate-50 disabled:text-muted"
        disabled={page <= 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
        aria-label="Trang trước"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="text-xs font-extrabold text-muted">Trang {page}/{pageCount}</span>
      <button
        type="button"
        className="grid h-9 w-9 place-items-center rounded-full bg-green-50 text-primary disabled:bg-slate-50 disabled:text-muted"
        disabled={page >= pageCount}
        onClick={() => onPageChange(Math.min(pageCount, page + 1))}
        aria-label="Trang sau"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

export function BatchForm({ batches = [], onSave }: { batches?: Batch[]; onSave: (batch: Batch) => void | Promise<void> }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const editingBatch = batches.find((item) => item.id === id);
  const suggestedBatchCode = useMemo(() => editingBatch?.batchCode ?? nextBatchCode(batches), [batches, editingBatch?.batchCode]);
  const [form, setForm] = useState({
    batchCode: suggestedBatchCode,
    productName: editingBatch?.productName ?? '',
    productType: editingBatch?.productType ?? '',
    quantity: String(editingBatch?.quantity ?? ''),
    harvestDate: editingBatch?.harvestDate ?? '',
    expiryDate: editingBatch?.expiryDate ?? '',
    status: editingBatch?.status ?? 'draft' as BatchStatus,
    location: editingBatch?.location ?? '',
    notes: editingBatch?.notes ?? '',
    hasQR: editingBatch?.hasQR ?? true
  });
  const [formMessage, setFormMessage] = useState('');

  useEffect(() => {
    if (editingBatch) return;
    setForm((current) => {
      if (current.batchCode && !batches.some((batch) => batch.batchCode === current.batchCode)) return current;
      return { ...current, batchCode: suggestedBatchCode };
    });
  }, [batches, editingBatch, suggestedBatchCode]);

  function updateField(name: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setFormMessage('');
    const batchCode = form.batchCode.trim() || suggestedBatchCode;
    const nextBatch: Batch = {
      id: editingBatch?.id ?? createId('batch'),
      batchCode,
      productName: form.productName.trim() || 'Lô hàng mới',
      productType: form.productType.trim() || 'Nông sản',
      quantity: Number(form.quantity) || 0,
      harvestDate: form.harvestDate,
      expiryDate: form.expiryDate,
      status: form.status,
      location: form.location.trim(),
      certifications: editingBatch?.certifications ?? [],
      hasQR: true,
      qrCodePath: editingBatch?.qrCodePath ?? `/trace/${encodeURIComponent(batchCode)}`,
      notes: form.notes.trim()
    };

    if (editingBatch) {
      try {
        const updatedBatch = await updateBatchRecord(editingBatch.batchCode, nextBatch);
        await onSave(updatedBatch);
        navigate(`/farm/batches/${updatedBatch.id}`);
      } catch {
        setFormMessage('Không lưu được lô hàng. Vui lòng kiểm tra mã lô có bị trùng hoặc backend đang chạy.');
      }
      return;
    }

    try {
      const createdBatch = await createBatchRecord(nextBatch);
      await onSave(createdBatch);
      navigate(`/farm/batches/${createdBatch.id}`);
    } catch {
      setFormMessage('Không tạo được lô hàng. Mã lô có thể đã tồn tại trong cơ sở dữ liệu.');
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <AppHeader title={editingBatch ? 'Sửa lô hàng' : 'Thêm lô hàng'} subtitle="Thông tin tổng quan lô hàng" back />
      <form onSubmit={submit} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <section className="rounded-2xl bg-white p-5 shadow-card">
          <label className="form-label">Mã lô hàng</label>
          <input className="input mb-3" value={form.batchCode} onChange={(e) => updateField('batchCode', e.target.value)} placeholder="BF-2026-0001" />
          <label className="form-label">Tên sản phẩm</label>
          <input className="input mb-3" value={form.productName} onChange={(e) => updateField('productName', e.target.value)} placeholder="Cà chua hữu cơ" />
          <label className="form-label">Loại sản phẩm</label>
          <input className="input mb-3" value={form.productType} onChange={(e) => updateField('productType', e.target.value)} placeholder="Rau củ quả" />
          <label className="form-label">Số lượng (kg)</label>
          <input className="input mb-3" type="number" min="0" value={form.quantity} onChange={(e) => updateField('quantity', e.target.value)} placeholder="250" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Ngày thu hoạch</label>
              <input
                className="input"
                type="date"
                value={toDateInputValue(form.harvestDate)}
                onChange={(e) => updateField('harvestDate', fromDateInputValue(e.target.value))}
              />
            </div>
            <div>
              <label className="form-label">Hạn dùng</label>
              <input
                className="input"
                type="date"
                min={toDateInputValue(form.harvestDate)}
                value={toDateInputValue(form.expiryDate)}
                onChange={(e) => updateField('expiryDate', fromDateInputValue(e.target.value))}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-card">
          <label className="form-label">Trạng thái</label>
          <select className="input mb-3" value={form.status} onChange={(e) => updateField('status', e.target.value as BatchStatus)}>
            {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <label className="form-label">Vị trí nông trại</label>
          <input className="input mb-3" value={form.location} onChange={(e) => updateField('location', e.target.value)} placeholder="Đà Lạt, Lâm Đồng" />
          <label className="form-label">Ghi chú</label>
          <textarea className="input mb-3 min-h-24 resize-none py-3" value={form.notes} onChange={(e) => updateField('notes', e.target.value)} placeholder="Mô tả giống cây, điều kiện thu hoạch, đóng gói..." />
          <div className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-green-100 bg-green-50 px-3 text-sm font-bold text-primary">
            QR truy xuất sẽ được tự động tạo khi lưu lô hàng
            <QrCode size={19} />
          </div>
        </section>

        {formMessage ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
            {formMessage}
          </div>
        ) : null}

        <button className="primary-btn flex w-full items-center justify-center gap-2" type="submit"><Save size={18} /> Lưu lô hàng</button>
      </form>
    </div>
  );
}

export function BatchDetail({ batches, onDelete, onCertificatesChange, onTransportAssigned }: { batches: Batch[]; onDelete: (id: string) => void; onCertificatesChange: (batchId: string, certifications: Certificate[]) => void; onTransportAssigned?: (batch: Batch) => void | Promise<void> }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const batch = batches.find((item) => item.id === id) ?? batches[0];
  const [certForm, setCertForm] = useState<Omit<Certificate, 'id'>>(emptyCertificate);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [certificateAction, setCertificateAction] = useState<CertificateAction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [deliveryStaff, setDeliveryStaff] = useState<DeliveryStaff[]>([]);
  const [destinationStores, setDestinationStores] = useState<DestinationStore[]>([]);
  const [assignForm, setAssignForm] = useState({ driverAccountId: '', receiverPartnerId: '' });
  const [assigning, setAssigning] = useState(false);
  const [assignMessage, setAssignMessage] = useState('');
  const visibleCertificates = useMemo(() => {
    const list = batch?.certifications ?? [];
    if (!searchTerm.trim()) return list;
    const keyword = searchTerm.trim().toLowerCase();
    return list.filter((cert) => [cert.name, cert.issuer, cert.issuedDate, cert.expiryDate, cert.note, certificateLabels[cert.status]].some((value) => value.toLowerCase().includes(keyword)));
  }, [batch, searchTerm]);
  const selectedStore = useMemo(() => destinationStores.find((store) => store.id === assignForm.receiverPartnerId), [assignForm.receiverPartnerId, destinationStores]);
  const selectedStaff = useMemo(() => deliveryStaff.find((staff) => staff.id === assignForm.driverAccountId), [assignForm.driverAccountId, deliveryStaff]);

  useEffect(() => {
    if (batch?.status !== 'ready') return;
    let active = true;

    Promise.all([getDeliveryStaff(), getDestinationStores()])
      .then(([staffItems, storeItems]) => {
        if (!active) return;
        setDeliveryStaff(staffItems);
        setDestinationStores(storeItems);
        setAssignForm((current) => ({
          ...current,
          driverAccountId: current.driverAccountId || staffItems[0]?.id || '',
          receiverPartnerId: current.receiverPartnerId || storeItems[0]?.id || ''
        }));
      })
      .catch(() => {
        if (!active) return;
        setDeliveryStaff([]);
        setDestinationStores([]);
      });

    return () => {
      active = false;
    };
  }, [batch?.status]);

  if (!batch) return <Navigate to="/farm/batches" replace />;

  function chooseCertificateAction(action: CertificateAction) {
    setCertificateAction(action);
    setUploadMessage('');
    if (action !== 'update') {
      setEditingCertId(null);
      setCertForm(emptyCertificate);
    }
  }

  async function saveCertificate(event: FormEvent) {
    event.preventDefault();
    const nextCert: Certificate = {
      id: editingCertId ?? createId('cert'),
      name: certForm.name.trim() || 'Chứng chỉ mới',
      issuer: certForm.issuer.trim() || 'Đơn vị cấp',
      issuedDate: certForm.issuedDate,
      expiryDate: certForm.expiryDate,
      status: certForm.status,
      note: certForm.note.trim()
    };

    try {
      const updatedBatch = editingCertId
        ? await updateCertificateForBatch(batch.batchCode, nextCert)
        : await createCertificateForBatch(batch.batchCode, nextCert);
      onCertificatesChange(batch.id, updatedBatch.certifications);
    } catch {
      const nextCerts = editingCertId
        ? batch.certifications.map((cert) => cert.id === editingCertId ? nextCert : cert)
        : [nextCert, ...batch.certifications];
      onCertificatesChange(batch.id, nextCerts);
    }

    setCertForm(emptyCertificate);
    setEditingCertId(null);
    setCertificateAction(null);
    setUploadMessage('');
  }

  function editCertificate(cert: Certificate) {
    setCertificateAction('update');
    setUploadMessage('');
    setEditingCertId(cert.id);
    setCertForm({
      name: cert.name,
      issuer: cert.issuer,
      issuedDate: cert.issuedDate,
      expiryDate: cert.expiryDate,
      status: cert.status,
      note: cert.note
    });
  }

  async function removeCertificate(certId: string) {
    try {
      const updatedBatch = await deleteCertificateFromBatch(batch.batchCode, certId);
      onCertificatesChange(batch.id, updatedBatch.certifications);
    } catch {
      onCertificatesChange(batch.id, batch.certifications.filter((cert) => cert.id !== certId));
    }

    if (editingCertId === certId) {
      setEditingCertId(null);
      setCertForm(emptyCertificate);
    }
    setCertificateAction(null);
  }

  function handleCertificateFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const nameFromFile = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
    setCertificateAction('upload');
    setEditingCertId(null);
    setCertForm((current) => ({
      ...current,
      name: current.name || nameFromFile,
      note: current.note || `Đã chọn tệp ${file.name}. Điền thông tin còn lại rồi bấm lưu.`
    }));
    setUploadMessage(`Đã chọn tệp: ${file.name}`);
    event.target.value = '';
  }

  function closeCertificateModal() {
    setCertificateAction(null);
    setEditingCertId(null);
    setCertForm(emptyCertificate);
    setUploadMessage('');
  }

  function removeBatch() {
    onDelete(batch.id);
    navigate('/farm/batches');
  }

  async function submitTransportAssignment(event: FormEvent) {
    event.preventDefault();
    if (!assignForm.driverAccountId) {
      setAssignMessage('Chọn nhân viên giao hàng.');
      return;
    }
    if (!assignForm.receiverPartnerId) {
      setAssignMessage('Chọn cửa hàng điểm đến.');
      return;
    }

    setAssigning(true);
    setAssignMessage('');

    try {
      const updatedBatch = await assignBatchTransport(batch.batchCode, {
        driverAccountId: assignForm.driverAccountId,
        receiverPartnerId: assignForm.receiverPartnerId
      });
      await onTransportAssigned?.(updatedBatch);
      setAssignMessage('Đã phân công vận chuyển và chuyển lô sang trạng thái đang vận chuyển.');
    } catch {
      setAssignMessage('Không phân công được chuyến vận chuyển. Kiểm tra lô hàng có đang ở trạng thái sẵn sàng không.');
    } finally {
      setAssigning(false);
    }
  }

  return (
    <div className="relative flex min-h-full flex-col bg-paper">
      <AppHeader title={batch.batchCode} subtitle={batch.productName} back action={<Link to={`/farm/batches/${batch.id}/edit`} className="icon-btn"><Pencil size={19} /></Link>} />
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-ink">{batch.productName}</h2>
              <p className="mt-1 text-sm text-muted">{batch.productType} · {batch.quantity} kg</p>
            </div>
            <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-bold ${statusClasses[batch.status]}`}>{statusLabels[batch.status]}</span>
          </div>
          <ProfileRow label="Vị trí" value={batch.location || 'Chưa cập nhật'} />
          <ProfileRow label="Thu hoạch" value={batch.harvestDate || 'Chưa cập nhật'} />
          <ProfileRow label="Hạn dùng" value={batch.expiryDate || 'Chưa cập nhật'} />
          <div className="flex items-center justify-between gap-4 py-3">
            <span className="text-sm font-semibold text-muted">QR</span>
            {batch.hasQR ? (
              <button
                type="button"
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full bg-green-50 px-3 text-xs font-extrabold text-primary"
                onClick={() => setShowQrModal(true)}
              >
                <QrCode size={15} />
                Xem QR
              </button>
            ) : (
              <span className="text-right text-sm font-extrabold text-ink">Chưa tạo</span>
            )}
          </div>
          {batch.notes && <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">{batch.notes}</p>}
        </div>

        {batch.status === 'ready' && (
          <>
            <section className="rounded-2xl bg-white p-5 shadow-card">
              <div className="mb-4 flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-green-50 text-primary">
                  <Store size={21} />
                </div>
                <div>
                  <h3 className="font-extrabold text-ink">Địa điểm đến</h3>
                  <p className="mt-1 text-sm text-muted">Chọn cửa hàng nhận lô hàng trước khi phân công vận chuyển.</p>
                </div>
              </div>

              <label className="form-label">Cửa hàng điểm đến</label>
              <div className="field mb-3">
                <MapPin size={18} />
                <select
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold text-ink outline-0"
                  value={assignForm.receiverPartnerId}
                  onChange={(event) => {
                    setAssignMessage('');
                    setAssignForm((current) => ({ ...current, receiverPartnerId: event.target.value }));
                  }}
                  disabled={assigning || !destinationStores.length}
                >
                  {!destinationStores.length && <option value="">Chưa có cửa hàng</option>}
                  {destinationStores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}{store.address ? ` - ${store.address}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl bg-slate-50 px-3 py-3 text-sm">
                <p className="font-extrabold text-ink">{selectedStore?.name ?? 'Chưa chọn cửa hàng'}</p>
                <p className="mt-1 font-semibold text-muted">{selectedStore?.address || 'Chưa cập nhật địa chỉ'}</p>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-card">
              <div className="mb-4 flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-green-50 text-primary">
                  <Truck size={21} />
                </div>
                <div>
                  <h3 className="font-extrabold text-ink">Phân công vận chuyển</h3>
                  <p className="mt-1 text-sm text-muted">Chọn nhân viên giao hàng và chuyển lô sang trạng thái đang vận chuyển.</p>
                </div>
              </div>

              <form onSubmit={submitTransportAssignment}>
                <label className="form-label">Nhân viên giao hàng</label>
                <div className="field mb-3">
                  <User size={18} />
                  <select
                    className="min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold text-ink outline-0"
                    value={assignForm.driverAccountId}
                    onChange={(event) => {
                      setAssignMessage('');
                      setAssignForm((current) => ({ ...current, driverAccountId: event.target.value }));
                    }}
                    disabled={assigning || !deliveryStaff.length}
                  >
                    {!deliveryStaff.length && <option value="">Chưa có nhân viên giao hàng</option>}
                    {deliveryStaff.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.fullName}{staff.phone ? ` - ${staff.phone}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3 rounded-xl bg-slate-50 px-3 py-3 text-sm">
                  <p className="font-extrabold text-ink">{selectedStaff?.fullName ?? 'Chưa chọn nhân viên'}</p>
                  <p className="mt-1 font-semibold text-muted">{selectedStaff?.phone || selectedStaff?.email || 'Chưa cập nhật liên hệ'}</p>
                </div>

                {assignMessage && <p className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">{assignMessage}</p>}

                <button className="primary-btn flex w-full items-center justify-center gap-2 disabled:opacity-60" type="submit" disabled={assigning}>
                  <Truck size={18} />
                  {assigning ? 'Đang phân công...' : 'Xác nhận phân công'}
                </button>
              </form>
            </section>
          </>
        )}

        {batch.status === 'in_transit' && (
          <section className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-700">
            Lô hàng đã được phân công và đang trong quá trình vận chuyển.
          </section>
        )}

        <section className="rounded-2xl bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-extrabold text-ink">Chứng chỉ</h3>
            <Badge>{batch.certifications.length} mục</Badge>
          </div>

          <div className="field mb-4">
            <Search size={18} />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tra cứu theo tên, đơn vị cấp, ngày hết hạn..." />
          </div>

          <div className="space-y-3">
            {visibleCertificates.map((cert) => (
              <div key={cert.id} className="rounded-xl border border-line p-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-extrabold text-ink">{cert.name}</p>
                    <p className="text-xs font-semibold text-muted">{cert.issuer}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Badge tone={certificateTones[cert.status]}>{certificateLabels[cert.status]}</Badge>
                    <button type="button" className="grid h-9 w-9 place-items-center rounded-full border border-green-100 bg-green-50 text-primary" onClick={() => editCertificate(cert)} aria-label={`Cập nhật ${cert.name}`}>
                      <Pencil size={16} />
                    </button>
                    <button type="button" className="grid h-9 w-9 place-items-center rounded-full border border-red-100 bg-red-50 text-red-600" onClick={() => removeCertificate(cert.id)} aria-label={`Xóa ${cert.name}`}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted">Cấp: {cert.issuedDate || 'N/A'} · Hết hạn: {cert.expiryDate || 'N/A'}</p>
                {cert.note && <p className="mt-2 text-sm text-slate-600">{cert.note}</p>}
              </div>
            ))}
            {batch.certifications.length === 0 && <p className="rounded-xl bg-slate-50 p-3 text-sm font-semibold text-muted">Chưa có chứng chỉ cho lô hàng này.</p>}
            {batch.certifications.length > 0 && visibleCertificates.length === 0 && <p className="rounded-xl bg-slate-50 p-3 text-sm font-semibold text-muted">Không tìm thấy chứng chỉ phù hợp.</p>}
          </div>

          <button
            type="button"
            onClick={() => chooseCertificateAction('upload')}
            className="primary-btn mt-4 flex w-full items-center justify-center gap-2"
          >
            <Upload size={18} />
            Tải chứng chỉ
          </button>
        </section>

        <button type="button" className="outline-btn flex w-full items-center justify-center gap-2 border-red-200 text-red-600" onClick={removeBatch}><Trash2 size={18} /> Xóa lô hàng</button>
      </div>

      {(certificateAction === 'upload' || (certificateAction === 'update' && editingCertId)) && (
        <div className="absolute inset-0 z-40 flex items-end bg-slate-950/45 px-4 pb-4 backdrop-blur-sm">
          <form onSubmit={saveCertificate} className="max-h-[88%] w-full overflow-y-auto rounded-2xl bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,.32)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-ink">{certificateAction === 'upload' ? 'Tải chứng chỉ' : 'Cập nhật chứng chỉ'}</h3>
                <p className="mt-1 text-xs font-semibold text-muted">{batch.batchCode}</p>
              </div>
              <button type="button" className="icon-btn h-9 w-9" onClick={closeCertificateModal} aria-label="Đóng form chứng chỉ"><X size={18} /></button>
            </div>

            {certificateAction === 'upload' && (
              <label className="mb-4 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-green-200 bg-green-50/70 px-4 py-5 text-center text-primary">
                <Upload size={28} />
                <span className="mt-2 text-sm font-extrabold">Chọn tệp chứng chỉ</span>
                <span className="mt-1 text-xs font-semibold text-green-500">PDF, ảnh chụp hoặc hồ sơ chứng nhận</span>
                <input className="sr-only" type="file" accept=".pdf,image/*" onChange={handleCertificateFileUpload} />
              </label>
            )}

            {uploadMessage && <p className="mb-3 rounded-xl bg-green-50 px-3 py-2 text-sm font-semibold text-leaf">{uploadMessage}</p>}

            <label className="form-label">Tên chứng chỉ</label>
            <input className="input mb-3" value={certForm.name} onChange={(e) => setCertForm((current) => ({ ...current, name: e.target.value }))} placeholder="VietGAP, GlobalGAP..." />
            <label className="form-label">Đơn vị cấp</label>
            <input className="input mb-3" value={certForm.issuer} onChange={(e) => setCertForm((current) => ({ ...current, issuer: e.target.value }))} placeholder="Tên tổ chức cấp chứng nhận" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Ngày cấp</label>
                <input className="input" value={certForm.issuedDate} onChange={(e) => setCertForm((current) => ({ ...current, issuedDate: e.target.value }))} placeholder="01/01/2026" />
              </div>
              <div>
                <label className="form-label">Ngày hết hạn</label>
                <input className="input" value={certForm.expiryDate} onChange={(e) => setCertForm((current) => ({ ...current, expiryDate: e.target.value }))} placeholder="01/01/2027" />
              </div>
            </div>
            <label className="form-label mt-3">Trạng thái</label>
            <select className="input mb-3" value={certForm.status} onChange={(e) => setCertForm((current) => ({ ...current, status: e.target.value as CertificateStatus }))}>
              {Object.entries(certificateLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <label className="form-label">Ghi chú</label>
            <textarea className="input mb-4 min-h-20 resize-none py-3" value={certForm.note} onChange={(e) => setCertForm((current) => ({ ...current, note: e.target.value }))} placeholder="Thông tin phạm vi áp dụng, hồ sơ đánh giá..." />
            <button className="primary-btn flex w-full items-center justify-center gap-2" type="submit"><ShieldCheck size={18} /> {certificateAction === 'upload' ? 'Lưu chứng chỉ' : 'Cập nhật chứng chỉ'}</button>
          </form>
        </div>
      )}

      {showQrModal && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/45 px-5 backdrop-blur-sm">
          <div className="w-full rounded-2xl bg-white p-5 text-center shadow-[0_24px_70px_rgba(15,23,42,.32)]">
            <div className="mb-4 flex items-center justify-between gap-3 text-left">
              <div>
                <h3 className="font-extrabold text-ink">QR lô hàng</h3>
                <p className="mt-1 text-xs font-semibold text-muted">{batch.batchCode}</p>
              </div>
              <button type="button" className="icon-btn h-9 w-9" onClick={() => setShowQrModal(false)} aria-label="Đóng QR"><X size={18} /></button>
            </div>
            <div className="mx-auto grid h-52 w-52 place-items-center rounded-2xl border-2 border-green-100 bg-white shadow-card">
              <BatchQrImage batch={batch} />
            </div>
            <p className="mt-4 text-lg font-extrabold text-ink">{batch.batchCode}</p>
            <p className="mt-1 text-sm font-semibold text-muted">{batch.productName}</p>
          </div>
        </div>
      )}
    </div>
  );
}
