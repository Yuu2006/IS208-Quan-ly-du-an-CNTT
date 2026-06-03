import { useState } from 'react';
import { BarChart3, Download, Calendar, Tag, AlertTriangle, FileText, X, ChevronRight, Box, QrCode, Smartphone } from 'lucide-react';
import { SearchBar } from '../../components/common/SearchBar';
import { ExportPreviewModal } from '../../components/common/ExportPreviewModal';

export function ReportsScreen({ data, onNavigateToShipment }: { data: any, onNavigateToShipment: (id: string) => void }) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | null>(null);
  const [detailCard, setDetailCard] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  };

  const handleExportClick = (format: 'pdf' | 'excel') => {
    setExportFormat(format);
    setShowExportModal(true);
    showToast(`Đang chuẩn bị file ${format.toUpperCase()}`);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Hiệu suất chuỗi cung ứng</h1>
          <p className="text-slate-500 mt-2">Tổng hợp dữ liệu và phân tích hoạt động BlueFood</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleExportClick('pdf')} className="flex items-center gap-2 px-5 py-2.5 bg-sage-600 hover:bg-sage-700 text-white font-bold rounded-xl transition-all shadow-sm">
            <FileText size={18} />
            Xuất PDF
          </button>
          <button onClick={() => handleExportClick('excel')} className="flex items-center gap-2 px-5 py-2.5 bg-sage-600 hover:bg-sage-700 text-white font-bold rounded-xl transition-all shadow-sm">
            <Download size={18} />
            Xuất Excel
          </button>
        </div>
      </header>

      {/* Overview Cards (Moved to top) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'LÔ HÀNG THEO TRẠNG THÁI', value: '1.240' },
          { label: 'QR ĐÃ TẠO', value: '8.940' },
          { label: 'LƯỢT QUÉT QR', value: '102.300' },
          { label: 'CẢNH BÁO HẾT HẠN', value: '18' }
        ].map((card: any) => (
          <div key={card.label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-slate-300 transition-colors">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{card.label}</div>
            <div className="text-3xl font-bold text-slate-800 mb-4">{card.value}</div>
            <button onClick={() => setDetailCard(card)} className="text-xs font-bold text-slate-700 hover:text-slate-900 text-left flex items-center gap-1 w-fit">
              Xem chi tiết <ChevronRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Reporting Filters */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[250px]">
          <SearchBar placeholder="Tìm báo cáo, lô hàng..." />
        </div>

        <div className="hidden lg:block w-px h-8 bg-slate-200 mx-1"></div>

        <div className="relative min-w-[150px]">
          <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-100 font-medium text-slate-600">
            <option>Tháng này</option>
            <option>Tháng trước</option>
            <option>Quý này</option>
            <option>Tùy chỉnh...</option>
          </select>
        </div>

        <div className="relative min-w-[150px]">
          <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-100 font-medium text-slate-600">
            <option>Sẵn sàng vận chuyển</option>
            <option>Đang vận chuyển</option>
            <option>Đã nhận</option>
            <option>Tất cả trạng thái</option>
          </select>
        </div>

        <div className="relative min-w-[150px]">
          <BarChart3 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-100 font-medium text-slate-600">
            <option>Nông trại A</option>
            <option>Nông trại B</option>
            <option>Tất cả nhà cung cấp</option>
          </select>
        </div>
      </div>



      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* Inventory Report */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Kiểm tra tồn kho</h3>
              <p className="text-xs text-slate-500 mt-1">Danh sách lô hàng và số lượng hiện tại</p>
            </div>
            <button className="px-3 py-1.5 text-xs font-bold text-sage-600 bg-sage-50 rounded-lg hover:bg-sage-100 transition-colors">Toàn bộ</button>
          </div>
          <div className="grid grid-cols-5 gap-2 p-3 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-100">
            <div>Mã lô</div>
            <div className="col-span-2">Sản phẩm</div>
            <div className="text-center">Đã xuất</div>
            <div className="text-right">Tồn kho</div>
          </div>
          <div className="divide-y divide-slate-100">
            {data.inventory.map((row: any) => (
              <div key={row.id} className="grid grid-cols-5 gap-2 p-3 items-center text-sm hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="font-mono text-slate-500 text-xs font-semibold bg-slate-100 px-2 py-1 rounded inline-block w-fit group-hover:bg-white border border-transparent group-hover:border-slate-200">{row.id}</div>
                <div className="col-span-2 font-semibold text-slate-800">{row.product}</div>
                <div className="text-center text-slate-600">{row.shipped}/{row.initial}</div>
                <div className="text-right font-bold text-sage-600">{row.stock}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Expiry Warning */}
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden relative">
          <div className="p-5 border-b border-amber-100 flex items-center justify-between bg-amber-50/50">
            <div>
              <h3 className="font-bold text-amber-900 flex items-center gap-2"><AlertTriangle size={18} className="text-amber-500" /> Cảnh báo hết hạn</h3>
              <p className="text-xs text-amber-700 mt-1">Các lô hàng sắp hết hạn trong 30 ngày tới</p>
            </div>
            <span className="px-3 py-1.5 bg-amber-100 border border-amber-200 text-amber-700 text-xs font-bold rounded-lg shadow-sm">Khẩn cấp</span>
          </div>
          <div className="divide-y divide-slate-100">
            {data.expiry.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center p-4 hover:bg-amber-50/50 transition-colors cursor-pointer">
                <div>
                  <div className="font-bold text-slate-800">{item.product}</div>
                  <div className="text-xs text-slate-500 font-mono mt-1 font-semibold">{item.id}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-xs font-medium text-slate-600 flex items-center gap-1"><Calendar size={14} className="text-slate-400" /> {item.expiry}</div>
                  <div className="px-2.5 py-1 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-lg whitespace-nowrap shadow-sm">
                    Còn {item.daysLeft} ngày
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {detailCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">
                Chi tiết: {detailCard.label}
              </h3>
              <button onClick={() => setDetailCard(null)} className="text-slate-400 hover:text-slate-600 p-1.5 bg-white rounded-lg border border-transparent hover:border-slate-200 hover:shadow-sm transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl font-bold text-sage-600">{detailCard.value}</div>
                <div className="text-sm text-slate-500 font-medium leading-tight">Tổng số liệu được ghi nhận đến thời điểm hiện tại.<br />Dữ liệu được cập nhật thời gian thực.</div>
              </div>

              {detailCard.label === 'LÔ HÀNG THEO TRẠNG THÁI' && (
                <>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-100 pb-2">Danh sách lô hàng chi tiết</h4>
                  <div className="space-y-3">
                    {[
                      { product: 'Rau cải hữu cơ', id: 'BF-LOT-9077', origin: 'Nông trại A', date: '02/05/2026', status: 'Đang vận chuyển', color: 'text-blue-600 bg-blue-50 border-blue-100' },
                      { product: 'Cà chua sấy khô', id: 'BF-LOT-1202', origin: 'Nông trại B', date: '01/05/2026', status: 'Đã giao', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                      { product: 'Dâu tây Đà Lạt', id: 'BF-LOT-5541', origin: 'SunFarm Đà Lạt', date: '03/05/2026', status: 'Đang chuẩn bị', color: 'text-amber-600 bg-amber-50 border-amber-100' },
                      { product: 'Nho xanh Ninh Thuận', id: 'BF-LOT-3329', origin: 'Vườn Nho Ba Mọi', date: '02/05/2026', status: 'Đã giao', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                      { product: 'Bơ sáp Đắk Lắk', id: 'BF-LOT-1560', origin: 'Hợp tác xã Bơ', date: '03/05/2026', status: 'Đang vận chuyển', color: 'text-blue-600 bg-blue-50 border-blue-100' },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          onNavigateToShipment(item.id);
                        }}
                        className="p-4 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-50 hover:border-sage-300 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-sage-100 group-hover:text-sage-600 transition-colors">
                            <Box size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800">{item.product} - {item.id}</div>
                            <div className="text-xs text-slate-500 mt-1">{item.origin} <span className="mx-1.5 opacity-30">•</span> Ngày thu hoạch: {item.date}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${item.color}`}>{item.status}</span>
                          <ChevronRight size={18} className="text-slate-300 group-hover:text-sage-500 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {detailCard.label === 'QR ĐÃ TẠO' && (
                <>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-100 pb-2">Danh sách mã QR đã khởi tạo</h4>
                  <div className="space-y-3">
                    {[
                      { qrId: 'QR-BF-9077', batchId: 'BF-LOT-9077', product: 'Rau cải hữu cơ', time: '08:30 04/05/2026' },
                      { qrId: 'QR-BF-1202', batchId: 'BF-LOT-1202', product: 'Cà chua sấy khô', time: '09:15 04/05/2026' },
                      { qrId: 'QR-BF-5541', batchId: 'BF-LOT-5541', product: 'Dâu tây Đà Lạt', time: '10:00 04/05/2026' },
                      { qrId: 'QR-BF-3329', batchId: 'BF-LOT-3329', product: 'Nho xanh Ninh Thuận', time: '11:45 04/05/2026' },
                      { qrId: 'QR-BF-1560', batchId: 'BF-LOT-1560', product: 'Bơ sáp Đắk Lắk', time: '14:20 04/05/2026' },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 border border-slate-100 rounded-xl flex items-center justify-between bg-white"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-20 h-20 p-2 border-2 border-slate-200 rounded-xl bg-white flex items-center justify-center shadow-sm">
                            <QrCode size={64} strokeWidth={1.5} className="text-slate-800" />
                          </div>
                          <div>
                            <div className="text-base font-bold text-slate-800 mb-1">Mã QR: {item.qrId}</div>
                            <div className="text-sm text-slate-600 mb-1">Sản phẩm: {item.product}</div>
                            <div className="text-xs text-slate-500">Liên kết lô: <span className="font-mono font-bold text-slate-600">{item.batchId}</span> <span className="mx-1.5 opacity-30">•</span> Tạo lúc: {item.time}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {detailCard.label === 'LƯỢT QUÉT QR' && (
                <>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-100 pb-2">Lịch sử lượt quét gần đây</h4>
                  <div className="space-y-3">
                    {[
                      { batchId: 'BF-LOT-9077', location: 'Quận 1, TP.HCM', device: 'iOS (Safari)', time: '14:15 hôm nay' },
                      { batchId: 'BF-LOT-1202', location: 'Quận 7, TP.HCM', device: 'Android (Chrome)', time: '13:40 hôm nay' },
                      { batchId: 'BF-LOT-5541', location: 'Ba Đình, Hà Nội', device: 'iOS (Safari)', time: '12:20 hôm nay' },
                      { batchId: 'BF-LOT-3329', location: 'Hải Châu, Đà Nẵng', device: 'Desktop (Chrome)', time: '11:05 hôm nay' },
                      { batchId: 'BF-LOT-1560', location: 'Thủ Đức, TP.HCM', device: 'iOS (Facebook App)', time: '10:30 hôm nay' },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 border border-slate-100 rounded-xl flex items-center justify-between bg-white"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <Smartphone size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800">{item.batchId}</div>
                            <div className="text-xs text-slate-500 mt-1">Địa điểm: {item.location} <span className="mx-1.5 opacity-30">•</span> Thiết bị: {item.device} <span className="mx-1.5 opacity-30">•</span> {item.time}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export Preview Modal */}
      <ExportPreviewModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Báo cáo Tồn kho & Hạn sử dụng"
        type={exportFormat || 'csv'}
        dataPreview={{
          columns: ['Mã lô', 'Sản phẩm', 'Đã xuất', 'Tồn kho', 'Hạn sử dụng'],
          rows: data.inventory.map((row: any) => [
            row.id,
            row.product,
            row.shipped,
            row.stock,
            data.expiry.find((e: any) => e.product === row.product)?.expiry || '12/12/2026'
          ])
        }}
        totalRows={120}
      />

      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 backdrop-blur-md bg-opacity-90">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
