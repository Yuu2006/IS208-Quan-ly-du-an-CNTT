import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Layers, QrCode, ScanLine, Search, Settings, UserCircle } from 'lucide-react';
import { useAuth } from '../../auth';
import { Batch } from '../../data';
import { AppHeader, Badge, LoginPrompt } from '../../shared/ui';

export type ScanHistoryItem = {
  id: string;
  batchId: string;
  productName: string;
  scannedAt: string;
  origin: string;
  freshness: number;
};

export function getScanTimestamp(scannedAt: string) {
  const [datePart, timePart = '00:00'] = scannedAt.split('·').map((part) => part.trim());
  const [day, month, year] = datePart.split('/').map(Number);
  const [hour = 0, minute = 0] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute).getTime();
}

export function getFreshnessScore(batch: Batch) {
  const expiryParts = batch.expiryDate.split('/').map(Number);
  if (expiryParts.length !== 3 || expiryParts.some((part) => Number.isNaN(part))) return 80;

  const [day, month, year] = expiryParts;
  const expiry = new Date(year, month - 1, day).getTime();
  const daysLeft = Math.ceil((expiry - Date.now()) / 86_400_000);
  return Math.max(35, Math.min(96, 70 + daysLeft * 3));
}

export function buildInspectorHistory(items: Batch[]): ScanHistoryItem[] {
  if (!items.length) return [];

  return items.map((batch, index) => ({
    id: `batch-${batch.id}`,
    batchId: batch.batchCode,
    productName: batch.productName,
    scannedAt: index === 0 ? '31/05/2026 · 09:15' : `${String(Math.max(1, 30 - index)).padStart(2, '0')}/05/2026 · ${String(14 + index).padStart(2, '0')}:00`,
    origin: batch.location,
    freshness: getFreshnessScore(batch)
  })).sort((a, b) => getScanTimestamp(b.scannedAt) - getScanTimestamp(a.scannedAt));
}

export const transportHistory = [
  { id: 'tr-001', batchId: 'BF-2024-0891', time: '30/05/2026 · 08:45', event: 'CP-02 cập nhật vị trí tại cổng nông trại, 4°C, lô hàng ổn định' },
  { id: 'tr-002', batchId: 'BF-2024-0891', time: '30/05/2026 · 10:20', event: 'CP-03 cập nhật vị trí trên QL20, 5°C, lô hàng ổn định' },
  { id: 'tr-003', batchId: 'BF-2024-0891', time: '30/05/2026 · 12:05', event: 'CP-04 cập nhật gần điểm đến, 4°C, lô hàng ổn định' }
];

export function CustomerNav() {
  const items = [
    { to: '/inspector', label: 'Quét QR', icon: ScanLine },
    { to: '/inspector/history', label: 'Lịch sử', icon: Layers },
    { to: '/settings', label: 'Tài khoản', icon: UserCircle }
  ];
  return (
    <nav className="sticky bottom-0 z-30 grid grid-cols-3 border-t border-line bg-white/95 px-3 py-2 backdrop-blur">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink key={item.to} to={item.to} end={item.to === '/inspector'} className={({ isActive }) => `grid place-items-center gap-1 rounded-lg py-1.5 text-[11px] font-semibold ${isActive ? 'text-primary' : 'text-muted'}`}>
            <Icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export function CustomerHome({ batches }: { batches: Batch[] }) {
  const { user } = useAuth();
  const inspectorHistory = useMemo(() => buildInspectorHistory(batches), [batches]);
  if (!user) return <LoginPrompt />;
  return (
    <div className="flex min-h-full flex-col bg-paper">
      <AppHeader
        title="Khách hàng"
        subtitle={`Xin chào, ${user.fullName}`}
        icon={<UserCircle size={22} />}
        action={<Link to="/settings" className="icon-btn"><Settings size={20} /></Link>}
      />
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <section className="rounded-2xl bg-gradient-to-br from-green-50 via-green-50 to-white p-5 text-center shadow-card">
          <div className="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-full border border-green-100 bg-white text-leaf shadow-card">
            <QrCode size={48} />
          </div>
          <h2 className="text-2xl font-extrabold leading-tight text-leaf">Quét mã để xem nguồn gốc</h2>
          <p className="mt-2 text-sm text-slate-600">Kiểm tra chứng nhận, hành trình vận chuyển và độ tươi của sản phẩm.</p>
          <Link to="/scanner" className="primary-btn mt-5 flex w-full items-center justify-center gap-2">
            <ScanLine size={19} /> Quét QR ngay
          </Link>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <Link to="/inspector/history" className="rounded-xl bg-white p-4 shadow-card">
            <Layers className="mb-3 text-primary" />
            <p className="font-bold text-ink">Lịch sử quét mã</p>
            <p className="mt-1 text-xs text-muted">{inspectorHistory.length} mã đã quét</p>
          </Link>
          <Link to="/settings" className="rounded-xl bg-white p-4 shadow-card">
            <UserCircle className="mb-3 text-primary" />
            <p className="font-bold text-ink">Thông tin tài khoản</p>
            <p className="mt-1 text-xs text-muted">Hồ sơ khách hàng</p>
          </Link>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-ink">Quét gần đây</h3>
            <Link to="/inspector/history" className="text-xs font-bold text-primary">Xem tất cả</Link>
          </div>
          <div className="space-y-3">
            {inspectorHistory.slice(0, 2).map((item) => <HistoryCard key={item.id} item={item} />)}
          </div>
        </section>
      </div>
      <CustomerNav />
    </div>
  );
}

export function ScanHistory({ batches }: { batches: Batch[] }) {
  const { user } = useAuth();
  const pageSize = 4;
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const inspectorHistory = useMemo(() => buildInspectorHistory(batches), [batches]);
  const filteredHistory = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return inspectorHistory;

    return inspectorHistory.filter((item) => item.productName.toLowerCase().includes(keyword));
  }, [inspectorHistory, searchTerm]);
  const pageCount = Math.max(1, Math.ceil(filteredHistory.length / pageSize));
  const visibleHistory = filteredHistory.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount));
  }, [pageCount]);

  if (!user) return <LoginPrompt />;
  return (
    <div className="flex min-h-full flex-col bg-paper">
      <AppHeader title="Lịch sử quét mã" subtitle="Các sản phẩm bạn đã kiểm tra" icon={<Layers size={22} />} />
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
        <div className="field bg-white shadow-card">
          <Search size={18} />
          <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Tìm theo tên sản phẩm..." />
        </div>

        {visibleHistory.length ? (
          visibleHistory.map((item) => <HistoryCard key={item.id} item={item} />)
        ) : (
          <div className="rounded-xl bg-white p-6 text-center shadow-card">
            <p className="font-bold text-ink">Không tìm thấy sản phẩm</p>
            <p className="mt-1 text-sm text-muted">Thử nhập tên khác trong lịch sử quét mã.</p>
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-card">
          <button type="button" className="icon-btn h-9 w-9" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} aria-label="Trang trước">
            <ChevronLeft size={18} />
          </button>
          <p className="text-xs font-bold text-muted">Trang {page}/{pageCount} · {filteredHistory.length} sản phẩm</p>
          <button type="button" className="icon-btn h-9 w-9" disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} aria-label="Trang sau">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <CustomerNav />
    </div>
  );
}

export function HistoryCard({ item }: { item: ScanHistoryItem }) {
  return (
    <Link to={`/trace/${item.batchId}`} className="block rounded-xl bg-white p-4 shadow-card">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-bold text-ink">{item.productName}</p>
          <p className="text-xs font-semibold text-primary">{item.batchId}</p>
        </div>
        <Badge>{item.freshness}/100</Badge>
      </div>
      <p className="text-sm text-slate-600">{item.origin}</p>
      <p className="mt-2 text-xs text-muted">{item.scannedAt}</p>
    </Link>
  );
}
