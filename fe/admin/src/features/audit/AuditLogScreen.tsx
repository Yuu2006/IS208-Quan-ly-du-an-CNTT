import { useState } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight, FileJson, Calendar, X, ArrowRight, User, History, Cpu, ShieldCheck } from 'lucide-react';
import { ExportPreviewModal } from '../../components/common/ExportPreviewModal';

export function AuditLogScreen({ data }: { data: any }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedBatchHistory, setSelectedBatchHistory] = useState<any>(null);
  const [selectedPayload, setSelectedPayload] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Tất cả nhật ký');
  const [searchId, setSearchId] = useState('');
  
  const totalPages = 5;

  const handleViewHistory = (batchId: string) => {
    if (batchId.includes('BF-TRK-1202')) {
      setSelectedBatchHistory(data.shipmentDetail);
    } else {
      setSelectedBatchHistory({
        batchId: batchId,
        summary: "2 bản ghi · 1 trạng thái",
        items: [
          {
            timestamp: "2026-04-29 10:15",
            actor: "Quản trị viên",
            action: "Khởi tạo",
            from: "N/A",
            to: "Bản ghi mới",
            ip: "10.32.4.01",
            payload: { action: "create", id: batchId }
          }
        ]
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Nhật ký truy vết</h1>
          <p className="text-slate-500 mt-2">Ghi nhận toàn bộ hoạt động minh bạch trên chuỗi cung ứng</p>
        </div>
        <button onClick={() => setShowExportModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-sage-600 hover:bg-sage-700 text-white font-bold rounded-xl transition-all shadow-sm">
          <Download size={18} />
          Xuất dữ liệu
        </button>
      </header>

      {/* Tra cứu & Điều hướng thông minh */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[250px]">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Tìm mã lô hàng (Batch ID), tài xế..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 outline-none transition-all font-medium text-slate-600"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchId) handleViewHistory(searchId);
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
          <select className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-100 font-medium text-slate-600">
            <option>Hôm nay</option>
            <option>7 ngày qua</option>
            <option>30 ngày qua</option>
          </select>
        </div>
      </div>

      {/* Main List */}
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

          {data.entries
            .filter((entry: any) => {
              if (activeTab === 'Lô hàng & Vận chuyển') return entry.batchId.startsWith('BF-') || entry.action.includes('trạng thái');
              if (activeTab === 'Tài khoản & Phân quyền') return entry.batchId.startsWith('ACC-');
              return true;
            })
            .map((entry: any, i: number) => (
              <div key={i} className="min-w-[1000px] grid grid-cols-12 gap-4 p-4 items-center text-sm hover:bg-slate-50 transition-colors">
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
                    onClick={() => handleViewHistory(entry.batchId)}
                    className="font-mono text-xs font-bold text-sage-700 bg-sage-50 px-2.5 py-1 rounded-lg hover:bg-sage-100 transition-colors border border-sage-200"
                   >
                     {entry.batchId}
                   </button>
                </div>
                <div className="col-span-2 text-slate-800 font-bold">{entry.actor}</div>
                <div className="col-span-3 text-slate-600 truncate italic">"{entry.payload}"</div>
                <div className="col-span-1 flex justify-center gap-2">
                  <button
                    onClick={() => setSelectedPayload({ id: entry.batchId, payload: entry.payload })}
                    className="p-2 text-slate-500 hover:text-sage-700 hover:bg-slate-100 rounded-lg transition-all"
                    title="Xem Payload JSON"
                  >
                    <FileJson size={18} />
                  </button>
                  <button
                    onClick={() => handleViewHistory(entry.batchId)}
                    className="p-2 text-slate-500 hover:text-sage-700 hover:bg-slate-100 rounded-lg transition-all"
                    title="Lịch sử đối tượng (UC27)"
                  >
                    <History size={18} />
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-white rounded-b-2xl">
          <div className="text-sm text-slate-600">
            Hiển thị <span className="font-bold text-slate-800">1-10</span> trong <span className="font-bold text-slate-800">45</span>
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
              {[1, 2, 3, '...', totalPages].map((page, idx) => (
                <button
                  key={idx}
                  className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${page === currentPage ? 'bg-sage-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                    } ${typeof page !== 'number' ? 'cursor-default hover:bg-transparent text-slate-400' : ''}`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
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
          rows: data.entries.map((e: any) => [e.timestamp, e.action, e.batchId, e.actor, e.payload])
        }}
        totalRows={45}
      />

      {/* UC27: Shipment History Timeline Modal (Tối giản & Trực quan hơn) */}
      {selectedBatchHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh] border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sage-50 text-sage-600 rounded-xl flex items-center justify-center border border-sage-200">
                  <History size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 tracking-tight">Truy vết lô hàng</h3>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{selectedBatchHistory.batchId}</p>
                </div>
              </div>
              <button onClick={() => setSelectedBatchHistory(null)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-200 rounded-lg transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar bg-white">
               <div className="relative space-y-6">
                  {/* Subtle Vertical Line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-slate-200"></div>

                  {selectedBatchHistory.items.map((item: any, idx: number) => (
                    <div key={idx} className="relative pl-7 group">
                       {/* Compact Dot */}
                       <div className="absolute left-0 top-1.5 w-3.5 h-3.5 bg-white border-2 border-sage-500 rounded-full z-10 ring-2 ring-white"></div>
                       
                       <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                             <div className="flex items-center gap-2">
                                <span className="font-bold text-sage-700 uppercase tracking-wide">{item.action}</span>
                                <span className="text-slate-400">|</span>
                                <span className="font-semibold text-slate-600">{item.timestamp}</span>
                             </div>
                             <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                                   <User size={12} className="text-slate-400"/> {item.actor}
                                </div>
                                <div className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                   {item.ip || '10.32.4.21'}
                                </div>
                                <button 
                                  onClick={() => setSelectedPayload({ id: selectedBatchHistory.batchId, payload: item.payload || item.to })}
                                  className="p-1 text-slate-400 hover:text-sage-700 hover:bg-sage-100 rounded transition-all"
                                  title="Xem chi tiết"
                                >
                                  <FileJson size={14} />
                                </button>
                             </div>
                          </div>

                          <div className="flex items-center gap-3 bg-slate-50/80 rounded-xl px-3 py-2 border border-slate-200 group-hover:bg-white group-hover:border-sage-200 transition-all text-xs">
                             <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Từ</div>
                                <div className="text-slate-500 italic line-through truncate font-medium">{item.from}</div>
                             </div>
                             <ArrowRight size={14} className="text-slate-400 shrink-0" />
                             <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-bold text-sage-600 uppercase tracking-widest mb-0.5">Đến</div>
                                <div className="text-slate-800 font-bold truncate">{item.to}</div>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                 <ShieldCheck size={12} className="text-sage-600" /> Bản ghi bất biến (Immutable Record)
              </div>
              <button onClick={() => setSelectedBatchHistory(null)} className="px-5 py-1.5 bg-white text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-300 hover:bg-slate-100 transition-all">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payload JSON Modal (Tinh gọn) */}
      {selectedPayload && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FileJson size={16} className="text-slate-500" />
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Chi tiết Payload</h3>
              </div>
              <button onClick={() => setSelectedPayload(null)} className="p-1.5 text-slate-500 hover:text-slate-700 rounded-lg transition-all hover:bg-slate-200">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 bg-[#fafafa] overflow-x-auto border-b border-slate-200">
              <pre className="text-xs text-slate-700 font-mono font-medium leading-relaxed">
                {typeof selectedPayload.payload === 'string'
                  ? selectedPayload.payload.split(' | ').join(',\n ')
                  : JSON.stringify(selectedPayload.payload, null, 2)}
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
