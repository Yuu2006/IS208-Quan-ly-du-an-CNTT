import { X, Info, ShieldCheck, MapPin, History, Package, FileText } from 'lucide-react';

interface ShipmentDetailProps {
  id: string;
  onClose: () => void;
}

export function ShipmentDetailScreen({ id, onClose }: ShipmentDetailProps) {

  // Mock data based on ID (usually would fetch)
  const shipment = {
    id: id,
    product: id.includes('9077') ? 'Rau cải hữu cơ' : (id.includes('1202') ? 'Cà chua sấy khô' : 'Sản phẩm nông nghiệp'),
    status: 'Đang vận chuyển',
    farm: 'Nông trại GreenFarm',
    harvestDate: '02/05/2026',
    packDate: '03/05/2026',
    quantity: '500 kg',
    origin: 'Lâm Đồng, Việt Nam',
    type: 'Rau củ',
    certs: [
      { name: 'VietGAP', code: 'VG-2026-102', issuer: 'Chi cục Trồng trọt & BVTV', date: '15/01/2026' },
      { name: 'GlobalGAP', code: 'GG-9022-AF', issuer: 'Control Union', date: '20/12/2025' }
    ],
    journey: [
      { date: '04/05/2026 09:15', title: 'Đang vận chuyển (Giai đoạn 1)', location: 'Trạm dừng nghỉ Dầu Giây', status: 'completed' },
      { date: '03/05/2026 15:00', title: 'Đơn vị vận chuyển tiếp nhận', location: 'Kho trung chuyển Đà Lạt', status: 'completed' },
      { date: '03/05/2026 10:30', title: 'Hệ thống kiểm định chứng chỉ', location: 'Hệ thống kiểm định', status: 'completed' },
      { date: '02/05/2026 08:00', title: 'Khởi tạo lô hàng', location: 'Nông trại GreenFarm', status: 'completed' }
    ],
    auditLogs: [
      { date: '04/05/2026 09:15', user: 'Tài xế Nguyễn Văn A', action: 'Cập nhật tọa độ GPS tại Trạm Dầu Giây' },
      { date: '03/05/2026 15:10', user: 'Điều phối viên', action: 'Gán tài xế phụ trách 51C-123.45' },
      { date: '03/05/2026 10:30', user: 'System Auto', action: 'Gắn nhãn VietGAP hợp lệ' }
    ]
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      ></div>

      {/* Drawer Panel */}
      <div className="relative w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
        {/* Compact Header */}
        <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sage-50 flex items-center justify-center text-sage-600">
              <Package size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                 <h1 className="text-xl font-bold text-slate-900 leading-none">{shipment.product} - {shipment.id}</h1>
                 <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg font-bold text-[10px] uppercase tracking-wider">
                    {shipment.status}
                 </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                 <span className="font-medium">Mã QR: <span className="font-mono font-bold text-slate-500 uppercase tracking-tight">QR-BF-{id.split('-').pop()}</span></span>
                 <span className="opacity-30">•</span>
                 <span className="font-medium">{shipment.origin}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 hover:bg-slate-50 rounded-full text-slate-300 hover:text-slate-600 transition-all"
          >
            <X size={20} />
          </button>
        </header>

        {/* Unified Content Area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Column (2/3) - Basic Info & Certs */}
          <div className="flex-[2] overflow-y-auto p-8 space-y-6">
            {/* Basic Info Section */}
            <div>
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
                <Info size={14} className="text-sage-500" /> Thông tin cơ bản
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-10">
                 <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Nguồn gốc</div>
                    <div className="text-sm font-semibold text-slate-900">{shipment.farm}</div>
                 </div>
                 <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Loại sản phẩm</div>
                    <div className="text-sm font-semibold text-slate-900">{shipment.type}</div>
                 </div>
                 <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Tổng sản lượng</div>
                    <div className="text-sm font-bold text-emerald-600">{shipment.quantity}</div>
                 </div>
                 <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Ngày thu hoạch</div>
                    <div className="text-sm font-semibold text-slate-700">{shipment.harvestDate}</div>
                 </div>
                 <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Ngày đóng gói</div>
                    <div className="text-sm font-semibold text-slate-700">{shipment.packDate}</div>
                 </div>
              </div>
            </div>

            {/* Certificates Section */}
            <div className="pt-2">
               <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
                 <ShieldCheck size={14} className="text-blue-500" /> Chứng chỉ chất lượng
               </h3>
               <div className="flex flex-wrap gap-4">
                 {shipment.certs.map((cert, idx) => (
                   <div key={idx} className="flex items-center gap-3 px-4 py-2.5 bg-blue-50/40 rounded-xl transition-all cursor-default">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-500 shadow-sm"><FileText size={16}/></div>
                      <div>
                         <div className="text-[11px] font-bold text-slate-800 leading-tight">{cert.name}</div>
                         <div className="text-[10px] font-medium text-slate-400 mt-0.5">{cert.code}</div>
                      </div>
                   </div>
                 ))}
                 <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-400 text-[10px] font-bold rounded-xl">
                    + 2 Chứng chỉ khác
                 </div>
               </div>
            </div>

            {/* Verification Banner */}
            <div className="p-5 bg-emerald-50 rounded-2xl flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                 <ShieldCheck size={20} />
               </div>
               <p className="text-sm font-medium text-emerald-900 leading-snug">
                 Toàn bộ dữ liệu nguồn gốc đã được xác thực bởi Vinacontrol thông qua hệ thống truy xuất nguồn gốc số BlueFood.
               </p>
            </div>
          </div>

          {/* Right Column (1/3) - Journey & Logs */}
          <div className="flex-1 bg-slate-50/40 border-l border-slate-100 overflow-y-auto p-8 space-y-6">
            {/* Mini Timeline Section */}
            <div>
               <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
                 <MapPin size={14} className="text-amber-500" /> Hành trình vận chuyển
               </h3>
               <div className="relative pl-6 space-y-6">
                  <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-slate-200"></div>
                  {shipment.journey.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full border-2 transition-all z-10 ${
                        idx === 0 ? 'bg-blue-500 border-white ring-4 ring-blue-50' : 'bg-white border-slate-300'
                      }`}></div>
                      <div>
                        <h4 className={`text-[11px] font-bold leading-tight ${idx === 0 ? 'text-blue-600' : 'text-slate-800'}`}>{step.title}</h4>
                        <div className="flex items-center justify-between gap-2 mt-1">
                           <span className="text-[10px] font-medium text-slate-500">{step.location}</span>
                           <span className="text-[9px] font-bold text-slate-300">{step.date.split(' ')[0]}</span>
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Audit Log Section */}
            <div>
               <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
                 <History size={14} className="text-slate-400" /> Lịch sử thay đổi
               </h3>
               <div className="space-y-4">
                  {shipment.auditLogs.slice(0, 3).map((log, idx) => (
                    <div key={idx} className="pb-4 border-b border-slate-100 last:border-0">
                       <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-slate-800 tracking-tight">{log.user}</span>
                          <span className="text-[9px] font-bold text-slate-300">{log.date.split(' ')[0]}</span>
                       </div>
                       <div className="text-[11px] text-slate-500 leading-relaxed font-medium">{log.action}</div>
                    </div>
                  ))}
               </div>
               <button className="w-full mt-4 py-2.5 text-[10px] font-bold text-slate-400 hover:text-slate-700 bg-white border border-slate-100 rounded-xl transition-all hover:shadow-sm">
                  Xem toàn bộ nhật ký
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
