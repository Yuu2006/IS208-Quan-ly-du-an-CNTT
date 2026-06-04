import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight, FileJson, Calendar, X, ArrowRight, User, History, ShieldCheck } from 'lucide-react';
import { ExportPreviewModal } from '../../components/common/ExportPreviewModal';
import { getAuditLogDetail, getAuditLogs, getAuditLogSummary, getBatchAuditTimeline, getTransportAuditTimeline, type AuditLogEntry, type AuditLogSummary, type AuditLogTimeline } from './auditApi';

const objectTypeByTab: Record<string, string> = {
  'Lô hàng & Vận chuyển': 'BATCH,TRANSPORT,TRANSPORT_CHECKPOINT,INCIDENT,QR',
  'Tài khoản & Phân quyền': 'ACCOUNT,AUTH'
};

const actionLabels: Record<string, string> = {
  BATCH_CREATED: 'Tạo lô hàng',
  BATCH_UPDATED: 'Cập nhật lô hàng',
  BATCH_CANCELLED: 'Hủy lô hàng',
  TRANSPORT_ASSIGNED: 'Phân công vận chuyển',
  TRANSPORT_CHECKPOINT_CREATED: 'Tạo checkpoint',
  TRANSPORT_CHECKPOINT_UPDATED: 'Cập nhật checkpoint',
  CHECKPOINT_UPDATED: 'Cập nhật checkpoint',
  DELIVERY_CONFIRMED: 'Xác nhận giao hàng',
  INCIDENT_REPORTED: 'Ghi nhận sự cố',
  ACCOUNT_CREATED: 'Tạo tài khoản',
  ACCOUNT_UPDATED: 'Cập nhật tài khoản',
  ACCOUNT_LOCKED: 'Khóa tài khoản',
  ACCOUNT_UNLOCKED: 'Mở khóa tài khoản',
  PARTNER_APPROVED: 'Duyệt đối tác',
  PARTNER_REJECTED: 'Từ chối đối tác',
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  LOGIN_FAILED: 'Đăng nhập thất bại',
  CERTIFICATE_CREATED: 'Tạo chứng nhận',
  CERTIFICATE_UPDATED: 'Cập nhật chứng nhận',
  TRANSPORT_CONTINUED: 'Tiếp tục vận chuyển'
};

const pageSize = 10;

const objectTypeLabels: Record<string, string> = {
  ACCOUNT: 'Tài khoản',
  AUTH: 'Xác thực',
  AUDIT_LOG: 'Audit Log',
  BATCH: 'Lô hàng',
  BATCH_STATUS_HISTORY: 'Lịch sử lô hàng',
  CERTIFICATE: 'Chứng nhận',
  INCIDENT: 'Sự cố',
  PARTNER: 'Đối tác',
  QR: 'QR',
  TRANSPORT: 'Vận chuyển',
  TRANSPORT_CHECKPOINT: 'Checkpoint'
};

const statusLabels: Record<string, string> = {
  CREATED: 'Mới tạo',
  AT_WAREHOUSE: 'Tại kho',
  IN_TRANSIT: 'Đang vận chuyển',
  ARRIVED: 'Đã đến',
  DELIVERED: 'Đã giao hàng',
  CANCELLED: 'Đã hủy',
  PENDING_PICKUP: 'Chờ lấy hàng',
  ACTIVE: 'Hiệu lực',
  INACTIVE: 'Hết hiệu lực',
  PENDING: 'Đang chờ',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  EXPIRED: 'Hết hạn',
  ARRIVED_WAREHOUSE: 'Đã đến kho'
};

function translateValue(value: unknown) {
  if (value === 'Bản ghi dữ liệu' || value === 'N/A') return 'Trống';
  if (typeof value !== 'string') return String(value);
  return statusLabels[value] || value;
}

const actionFilterOptions = [
  'LOGIN_SUCCESS',
  'LOGIN_FAILED',
  'BATCH_CREATED',
  'BATCH_UPDATED',
  'BATCH_CANCELLED',
  'TRANSPORT_ASSIGNED',
  'TRANSPORT_CHECKPOINT_UPDATED',
  'DELIVERY_CONFIRMED',
  'INCIDENT_REPORTED',
  'ACCOUNT_LOCKED',
  'ACCOUNT_UNLOCKED'
];

/** Định dạng thời gian Audit Log cho bảng và timeline Admin. */
function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/** Tạo nhãn payload ngắn để giữ nguyên bố cục bảng hiện tại. */
function payloadSummary(entry: AuditLogEntry) {
  const value = entry.newValue ?? entry.oldValue;
  if (!value) return 'Không có payload';
  if (typeof value === 'string') return value;
  if (typeof value !== 'object') return String(value);

  const record = value as Record<string, unknown>;
  const candidates = [record.batchCode, record.status, record.transportStatus, record.note, record.action]
    .filter(Boolean)
    .map(String);

  return candidates[0] ?? JSON.stringify(value);
}

function asRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function fieldLabel(field: string) {
  const labels: Record<string, string> = {
    batchCode: 'mã lô',
    productName: 'tên sản phẩm',
    productType: 'loại sản phẩm',
    quantity: 'số lượng',
    unit: 'đơn vị',
    status: 'trạng thái',
    harvestDate: 'ngày thu hoạch',
    packagedDate: 'ngày đóng gói',
    expiryDate: 'ngày hết hạn',
    transportStatus: 'trạng thái vận chuyển',
    statusAtCheckpoint: 'trạng thái checkpoint',
    locationName: 'vị trí',
    username: 'tên đăng nhập'
  };

  return labels[field] ?? field;
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === '') return 'trống';
  if (typeof value === 'string') return translateValue(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return 'dữ liệu';
}

function firstChangedField(oldRecord: Record<string, unknown>, newRecord: Record<string, unknown>) {
  const ignored = new Set(['createdAt', 'updatedAt']);
  return Object.keys(newRecord).find((key) => !ignored.has(key) && displayValue(oldRecord[key]) !== displayValue(newRecord[key]));
}

function businessPayloadSummary(entry: AuditLogEntry) {
  const oldRecord = asRecord(entry.oldValue);
  const newRecord = asRecord(entry.newValue);
  const batchCode = displayValue(newRecord.batchCode ?? oldRecord.batchCode ?? entry.objectId);

  if (entry.action === 'AUTH_LOGIN_SUCCESS' || entry.action === 'LOGIN_SUCCESS') {
    const username = entry.actor?.username ?? newRecord.username ?? newRecord.identifier ?? entry.objectId;
    const role = entry.actor?.role ?? newRecord.role;
    return `Tài khoản ${displayValue(username)} đăng nhập thành công${role ? ` với vai trò ${displayValue(role)}` : ''}`;
  }

  if (entry.action === 'BATCH_CREATED') return `Tạo lô hàng ${batchCode}`;

  if (entry.action === 'BATCH_UPDATED') {
    const changedField = firstChangedField(oldRecord, newRecord);
    if (!changedField) return `Cập nhật lô hàng ${batchCode}`;
    return `Cập nhật lô hàng ${batchCode}: ${fieldLabel(changedField)} từ ${displayValue(oldRecord[changedField])} sang ${displayValue(newRecord[changedField])}`;
  }

  if (entry.action === 'ACCOUNT_LOCKED') {
    const username = newRecord.username ?? oldRecord.username ?? entry.objectId;
    return `Khóa tài khoản ${displayValue(username)}`;
  }
  
  if (entry.action === 'TRANSPORT_ASSIGNED') {
    const fromLocation = (newRecord.farmPartner as any)?.partnerName || (newRecord.shipperPartner as any)?.partnerName || (newRecord.farmPartnerId ? `Farm ${newRecord.farmPartnerId}` : (newRecord.shipperPartnerId ? `Shipper ${newRecord.shipperPartnerId}` : 'Nơi lấy hàng'));
    const toLocation = (newRecord.storePartner as any)?.partnerName || (newRecord.receiverPartner as any)?.partnerName || (newRecord.storePartnerId ? `Cửa hàng ${newRecord.storePartnerId}` : (newRecord.receiverPartnerId ? `Nơi nhận ${newRecord.receiverPartnerId}` : 'Nơi giao hàng'));
    return `Phân công vận chuyển: Từ ${fromLocation} đến ${toLocation}`;
  }

  const candidate = newRecord.batchCode ?? newRecord.status ?? newRecord.transportStatus ?? newRecord.statusAtCheckpoint ?? newRecord.note ?? newRecord.action;
  return candidate ? `${actionLabels[entry.action] ?? entry.action}: ${displayValue(candidate)}` : (actionLabels[entry.action] ?? entry.action ?? payloadSummary(entry));
}

function getPaginationPages(currentPage: number, totalPages: number) {
  if (totalPages <= 1) return [1];
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages: Array<number | string> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) pages.push('...');
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < totalPages - 1) pages.push('...');
  pages.push(totalPages);

  return pages;
}

/** Ánh xạ Audit Log API sang row model sẵn có của màn hình. */
function mapEntry(entry: AuditLogEntry) {
  const isHigh = /LOCKED|CANCELLED|INCIDENT|FAILED|FORBIDDEN/.test(entry.action);
  const objectTypeLabel = objectTypeLabels[entry.objectType] ?? entry.objectType;
  return {
    id: entry.auditId,
    timestamp: formatDateTime(entry.timestamp),
    action: actionLabels[entry.action] ?? entry.action,
    rawAction: entry.action,
    batchId: `${objectTypeLabel}-${entry.objectId}`,
    objectType: entry.objectType,
    objectId: entry.objectId,
    actor: entry.actor?.fullName ?? entry.actor?.username ?? 'Hệ thống',
    payload: businessPayloadSummary(entry),
    rawPayload: entry,
    severity: isHigh ? 'high' : 'normal'
  };
}

/** Tính khoảng ngày theo bộ lọc thời gian UC28. */
function getDateRange(dateFilter: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (dateFilter === 'Hôm nay') {
    return { dateFrom: today.toISOString().slice(0, 10) };
  }

  if (dateFilter === '7 ngày qua' || dateFilter === '30 ngày qua') {
    const date = new Date(today);
    date.setDate(today.getDate() - (dateFilter === '7 ngày qua' ? 6 : 29));
    return { dateFrom: date.toISOString().slice(0, 10) };
  }

  return {};
}

export function AuditLogScreen({ data }: { data: any }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedTimeline, setSelectedTimeline] = useState<AuditLogTimeline | null>(null);
  const [selectedPayload, setSelectedPayload] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Tất cả nhật ký');
  const [dateFilter, setDateFilter] = useState('7 ngày qua');
  const [searchId, setSearchId] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [actorIdFilter] = useState('');
  const [ipFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [summary, setSummary] = useState<AuditLogSummary | null>(null);
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [totalRows, setTotalRows] = useState(data?.entries?.length ?? 0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timelineError, setTimelineError] = useState('');

  const rows = useMemo(() => entries.map(mapEntry), [entries]);
  const visibleFrom = rows.length ? ((currentPage - 1) * pageSize) + 1 : 0;
  const visibleTo = rows.length ? visibleFrom + rows.length - 1 : 0;
  const paginationPages = useMemo(() => getPaginationPages(currentPage, totalPages), [currentPage, totalPages]);

  useEffect(() => {
    let active = true;

    getAuditLogSummary()
      .then((result) => {
        if (active) setSummary(result);
      })
      .catch(() => {
        if (active) setSummary(null);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    getAuditLogs({
      page: currentPage,
      pageSize,
      keyword: submittedSearch || undefined,
      objectType: objectTypeByTab[activeTab],
      action: actionFilter || undefined,
      actorId: actorIdFilter.trim() || undefined,
      ipAddress: ipFilter.trim() || undefined,
      status: statusFilter || undefined,
      ...getDateRange(dateFilter)
    })
      .then((result) => {
        if (!active) return;
        setEntries(result.entries);
        setTotalRows(result.meta.total);
        setTotalPages(result.meta.totalPages);
      })
      .catch(() => {
        if (!active) return;
        setEntries([]);
        setTotalRows(0);
        setTotalPages(1);
        setError('Không thể tải Audit Log từ server.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [actionFilter, activeTab, actorIdFilter, currentPage, dateFilter, ipFilter, statusFilter, submittedSearch]);

  async function handleViewBatchHistory(batchId: string) {
    const normalizedId = batchId.replace(/^BATCH-/, '');
    setTimelineError('');

    try {
      const history = await getBatchAuditTimeline(normalizedId);
      setSelectedTimeline(history);
    } catch (error: any) {
      console.error(error);
      setSelectedTimeline(null);
      setTimelineError(`Lỗi: ${error.message || error} - Không tìm thấy lô hàng hoặc chưa có lịch sử thay đổi.`);
    }
  }

  /** Tải timeline thay đổi của một chuyến xe từ API. */
  async function handleViewTransportHistory(transportId: string) {
    const normalizedId = transportId.replace(/^TRANS-/, '');
    setTimelineError('');

    try {
      const history = await getTransportAuditTimeline(normalizedId);
      setSelectedTimeline(history);
    } catch (error: any) {
      console.error(error);
      setSelectedTimeline(null);
      setTimelineError(`Lỗi: ${error.message || error} - Không tìm thấy chuyến xe hoặc chưa có lịch sử thay đổi.`);
    }
  }

  /** Xử lý UC28: xem payload chi tiết Audit Log ở chế độ chỉ đọc. */
  async function handleViewPayload(entry: ReturnType<typeof mapEntry>) {
    try {
      const detail = await getAuditLogDetail(entry.id);
      setSelectedPayload({ id: entry.batchId, payload: detail });
    } catch {
      setSelectedPayload({ id: entry.batchId, payload: entry.rawPayload });
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Nhật ký truy vết</h1>
          <p className="text-slate-500 mt-2">
            Tổng {totalRows} bản ghi đang lọc{summary ? ` · Hôm nay ${summary.today}` : ''}
            <span className="hidden">
            Ghi nhận toàn bộ hoạt động minh bạch trên chuỗi cung ứng
            {summary ? ` · Tổng ${summary.total} bản ghi · Hôm nay ${summary.today}` : ''}
            </span>
          </p>
        </div>
        <button onClick={() => setShowExportModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-sage-600 hover:bg-sage-700 text-white font-bold rounded-xl transition-all shadow-sm">
          <Download size={18} />
          Xuất dữ liệu
        </button>
      </header>

      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[250px]">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm mã lô hàng (Batch ID), người thực hiện, IP..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 outline-none transition-all font-medium text-slate-600"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setCurrentPage(1);
                  setSubmittedSearch(searchId.trim());
                }
              }}
            />
          </div>
        </div>

        <div className="hidden lg:block w-px h-8 bg-slate-200 mx-1"></div>

        <div className="relative min-w-[150px]">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            value={activeTab}
            onChange={(e) => { setActiveTab(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-100 font-medium text-slate-600"
          >
            <option value="Tất cả nhật ký">Tất cả phân loại</option>
            <option value="Lô hàng & Vận chuyển">Lô hàng & Vận chuyển</option>
            <option value="Tài khoản & Phân quyền">Tài khoản & Phân quyền</option>
          </select>
        </div>

        <div className="relative min-w-[150px]">
          <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-100 font-medium text-slate-600"
          >
            <option>Hôm nay</option>
            <option>7 ngày qua</option>
            <option>30 ngày qua</option>
            <option>Tất cả</option>
          </select>
        </div>

        <div className="relative min-w-[170px]">
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-100 font-medium text-slate-600"
          >
            <option value="">Tất cả hành động</option>
            {actionFilterOptions.map((action) => (
              <option key={action} value={action}>{actionLabels[action] ?? action}</option>
            ))}
          </select>
        </div>



        <div className="relative min-w-[150px]">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-100 font-medium text-slate-600"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="SUCCESS">Thành công</option>
            <option value="FAILED">Thất bại</option>
            <option value="LOCKED">Bị khóa</option>
            <option value="CANCELLED">Đã hủy</option>
            <option value="INCIDENT">Sự cố</option>
          </select>
        </div>
      </div>

      {timelineError && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{timelineError}</div>}
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="divide-y divide-slate-100 overflow-x-auto">
          <div className="min-w-[1000px] grid grid-cols-12 gap-4 p-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50/50 border-b border-slate-100">
            <div className="col-span-2">Thời gian</div>
            <div className="col-span-2">Hành động</div>
            <div className="col-span-2">Mã đối tượng</div>
            <div className="col-span-2">Người thực hiện</div>
            <div className="col-span-3">Mô tả chi tiết</div>
            <div className="col-span-1 text-center">Thao tác</div>
          </div>

          {loading && (
            <div className="min-w-[1000px] p-8 text-center text-sm font-semibold text-slate-500">Đang tải Audit Log...</div>
          )}

          {!loading && rows.length === 0 && (
            <div className="min-w-[1000px] p-8 text-center text-sm font-semibold text-slate-500">Không tìm thấy kết quả. Vui lòng thử lại với tiêu chí khác.</div>
          )}

          {!loading && rows.map((entry) => (
            <div key={entry.id} className="min-w-[1000px] grid grid-cols-12 gap-4 p-4 items-center text-sm hover:bg-slate-50 transition-colors">
              <div className="col-span-2 text-slate-600 font-mono text-xs font-medium">{entry.timestamp}</div>
              <div className="col-span-2">
                <span className={`text-[11px] font-extrabold uppercase tracking-normal ${
                  entry.severity === 'high' ? 'text-amber-700' : 'text-slate-800'
                }`}>
                  {entry.action}
                </span>
              </div>
              <div className="col-span-2">
                <button
                  onClick={() => entry.objectType === 'BATCH' || entry.objectType === 'Lô hàng' ? handleViewBatchHistory(entry.objectId) : entry.objectType === 'TRANSPORT' || entry.objectType === 'SHIPMENT' || entry.objectType === 'Vận chuyển' ? handleViewTransportHistory(entry.objectId) : setSubmittedSearch(entry.objectId)}
                  className="font-mono text-xs font-bold text-sage-700 bg-sage-50 px-2.5 py-1 rounded-lg hover:bg-sage-100 transition-colors border border-sage-200"
                >
                  {entry.objectType === 'BATCH' ? `Lô hàng-${entry.objectId}` : entry.objectType === 'TRANSPORT' ? `Vận chuyển-${entry.objectId}` : entry.batchId}
                </button>
              </div>
              <div className="col-span-2 text-slate-800 font-bold">{entry.actor}</div>
              <div className="col-span-3 text-slate-600 truncate italic">"{entry.payload}"</div>
              <div className="col-span-1 flex justify-center gap-2">
                <button
                  onClick={() => handleViewPayload(entry)}
                  className="p-2 text-slate-500 hover:text-sage-700 hover:bg-slate-100 rounded-lg transition-all"
                  title="Xem Payload gốc"
                >
                  <FileJson size={18} />
                </button>
                {entry.objectType === 'BATCH' || entry.objectType === 'Lô hàng' ? (
                  <button
                    onClick={() => handleViewBatchHistory(entry.objectId)}
                    className="p-2 text-slate-500 hover:text-sage-700 hover:bg-slate-100 rounded-lg transition-all"
                    title="Xem lịch sử truy vết lô hàng"
                  >
                    <History size={18} />
                  </button>
                ) : entry.objectType === 'TRANSPORT' || entry.objectType === 'SHIPMENT' || entry.objectType === 'Vận chuyển' ? (
                  <button
                    onClick={() => handleViewTransportHistory(entry.objectId)}
                    className="p-2 text-slate-500 hover:text-sage-700 hover:bg-slate-100 rounded-lg transition-all"
                    title="Xem timeline vận chuyển"
                  >
                    <History size={18} />
                  </button>
                ) : (
                  <button
                    className="p-2 text-slate-300 cursor-not-allowed rounded-lg"
                    title="Đối tượng này không có timeline truy vết"
                  >
                    <History size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-white rounded-b-2xl">
          <div className="text-sm text-slate-600">
            <span className="font-bold text-slate-800">{visibleFrom}-{visibleTo}</span> trong <span className="font-bold text-slate-800">{totalRows}</span>
          </div>
          <div className="hidden">
            Hiển thị <span className="font-bold text-slate-800">{rows.length ? ((currentPage - 1) * 10) + 1 : 0}-{((currentPage - 1) * 10) + rows.length}</span> trong <span className="font-bold text-slate-800">{totalRows}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1 px-2">
              {paginationPages.map((page, idx) => (
                <button
                  key={idx}
                  onClick={() => typeof page === 'number' && setCurrentPage(Math.min(totalPages, page))}
                  className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${page === currentPage ? 'bg-sage-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                    } ${typeof page !== 'number' ? 'cursor-default hover:bg-transparent text-slate-400' : ''}`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <ExportPreviewModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Nhật ký hệ thống (Audit Log)"
        type="csv"
        dataPreview={{
          columns: ['Thời gian', 'Hành động', 'Đối tượng', 'Người thực hiện', 'Payload'],
          rows: rows.map((e) => [e.timestamp, e.action, e.batchId, e.actor, e.payload])
        }}
        totalRows={totalRows}
      />

      {selectedTimeline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-sage-50 flex items-center justify-center border border-sage-100 shadow-sm">
                  <History className="text-sage-600" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">{selectedTimeline.targetType === 'TRANSPORT' ? 'Timeline vận chuyển' : 'Lịch sử truy vết lô hàng'}</h3>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{selectedTimeline.targetId || selectedTimeline.batchId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTimeline(null)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar bg-white">
              <div className="relative space-y-6">
                <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-slate-200"></div>

                {selectedTimeline.items.map((item) => (
                  <div key={item.id} className="relative pl-7 group">
                    <div className="absolute left-0 top-1.5 w-3.5 h-3.5 bg-white border-2 border-sage-500 rounded-full z-10 ring-2 ring-white"></div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sage-700 uppercase tracking-wide">{actionLabels[item.action] || item.label || item.action}</span>
                          <span className="text-slate-400">|</span>
                          <span className="font-semibold text-slate-600">{formatDateTime(item.timestamp)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                            <User size={12} className="text-slate-400"/> {item.actor}
                          </div>
                          {item.ip && item.ip !== 'N/A' && (
                            <div className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {item.ip === '::1' || item.ip === '127.0.0.1' ? 'Localhost' : `IP: ${item.ip}`}
                            </div>
                          )}
                          <button
                            onClick={() => setSelectedPayload({ id: selectedTimeline.targetId || selectedTimeline.batchId, payload: item.payload || item.to })}
                            className="p-1 text-slate-400 hover:text-sage-700 hover:bg-sage-100 rounded transition-all"
                            title="Xem chi tiết"
                          >
                            <FileJson size={14} />
                          </button>
                        </div>
                      </div>

                      {item.action === 'TRANSPORT_ASSIGNED' || item.action === 'TRANSPORT_CONTINUED' ? (
                        <div className="flex items-center gap-3 bg-slate-50/80 rounded-xl px-3 py-2 border border-slate-200 group-hover:bg-white group-hover:border-sage-200 transition-all text-xs">
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Nơi đi</div>
                            <div className="text-slate-700 font-semibold truncate">
                              {selectedTimeline?.metadata?.fromName || (item.payload as any)?.newValue?.farmPartner?.partnerName || (item.payload as any)?.newValue?.shipperPartner?.partnerName || ((item.payload as any)?.newValue?.farmPartnerId ? `Farm ${(item.payload as any).newValue.farmPartnerId}` : ((item.payload as any)?.newValue?.shipperPartnerId ? `Shipper ${(item.payload as any).newValue.shipperPartnerId}` : 'Nơi lấy hàng'))}
                            </div>
                          </div>
                          <ArrowRight size={14} className="text-slate-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold text-sage-600 uppercase tracking-widest mb-0.5">Nơi đến</div>
                            <div className="text-slate-800 font-bold truncate">
                              {selectedTimeline?.metadata?.toName || (item.payload as any)?.newValue?.storePartner?.partnerName || (item.payload as any)?.newValue?.receiverPartner?.partnerName || ((item.payload as any)?.newValue?.storePartnerId ? `Cửa hàng ${(item.payload as any).newValue.storePartnerId}` : ((item.payload as any)?.newValue?.receiverPartnerId ? `Nơi nhận ${(item.payload as any).newValue.receiverPartnerId}` : 'Nơi giao hàng'))}
                            </div>
                          </div>
                        </div>
                      ) : item.from === 'N/A' || !item.from || item.from === item.to || translateValue(item.from) === 'Trống' ? (
                        <div className="flex items-center gap-3 bg-slate-50/80 rounded-xl px-3 py-2 border border-slate-200 group-hover:bg-white group-hover:border-sage-200 transition-all text-xs">
                          <div className="flex-1 min-w-0 flex items-center justify-center gap-2">
                            <span className="text-[10px] font-bold text-sage-600 uppercase tracking-widest">Trạng thái mới:</span>
                            <span className="text-slate-800 font-bold truncate">{translateValue(item.to)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 bg-slate-50/80 rounded-xl px-3 py-2 border border-slate-200 group-hover:bg-white group-hover:border-sage-200 transition-all text-xs">
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Nơi đi</div>
                            <div className="text-slate-500 italic line-through truncate font-medium">{translateValue(item.from)}</div>
                          </div>
                          <ArrowRight size={14} className="text-slate-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold text-sage-600 uppercase tracking-widest mb-0.5">Nơi đến</div>
                            <div className="text-slate-800 font-bold truncate">{translateValue(item.to)}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <ShieldCheck size={12} className="text-sage-600" /> Bản ghi bất biến (Immutable Record)
              </div>
              <button onClick={() => setSelectedTimeline(null)} className="px-5 py-1.5 bg-white text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-300 hover:bg-slate-100 transition-all">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedPayload && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FileJson size={16} className="text-slate-500" />
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Chi tiết Payload</h3>
              </div>
              <button onClick={() => setSelectedPayload(null)} className="p-1.5 text-slate-500 hover:text-slate-700 rounded-lg transition-all hover:bg-slate-200">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 bg-[#fafafa] overflow-auto flex-1 border-b border-slate-200">
              <pre className="text-xs text-slate-700 font-mono font-medium leading-relaxed">
                {typeof selectedPayload.payload === 'string'
                  ? selectedPayload.payload.split(' | ').join(',\n ')
                  : JSON.stringify(selectedPayload.payload, (key, value) => {
                      const ignoredKeys = [
                        'batch', 'checkpoints', 'incidents', 'certificates', 'qrCode', 'actor',
                        'farmPartner', 'shipperPartner', 'storePartner', 'receiverPartner', 'transporterPartner',
                        'createdAt', 'updatedAt', 'linkedAt', 'passwordHash', 'creator', 'deliveryConfirmer', 'issuer'
                      ];
                      if (ignoredKeys.includes(key)) return undefined;
                      return value;
                    }, 2)}
              </pre>
            </div>

            <div className="p-4 flex justify-end">
              <button onClick={() => setSelectedPayload(null)} className="px-4 py-1.5 bg-white text-slate-700 font-bold text-xs uppercase tracking-wider rounded-lg border border-slate-300 hover:bg-slate-100 transition-all">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
