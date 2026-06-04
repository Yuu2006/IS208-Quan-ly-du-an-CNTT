import { useMemo, useState } from 'react';
import { Plus, AlertCircle, CheckCircle2, X, Tag, BarChart3, Building2, MapPin, Mail, Phone, Edit2, ShieldAlert, MoreVertical, Clock, ChevronDown, ArrowRight, ToggleLeft, ToggleRight } from 'lucide-react';
import { SearchBar } from '../../components/common/SearchBar';
import { useEffect } from 'react';
import { api } from '../../config/api';

// Utility for hiding scrollbars
const scrollbarHideStyle = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

export function PartnersScreen({ data: _data }: { data: any }) {
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [showEditPartnerModal, setShowEditPartnerModal] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
  const [reason, setReason] = useState('');
  const [toggleReason, setToggleReason] = useState('');
  const [newPartnerType, setNewPartnerType] = useState('');
  const [licensePlates, setLicensePlates] = useState<string[]>([]);
  const [newPlate, setNewPlate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('22:00');
  const [partnerRows, setPartnerRows] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [addForm, setAddForm] = useState<any>({});

  const fetchPartners = async () => {
    try {
      const res = await api.get('/partners');
      const formatted = res.data.map((r: any) => ({
        id: `PRT-${r.partnerId}`,
        rawId: r.partnerId,
        name: r.partnerName,
        type: r.partnerType === 'FARM' ? 'Nông trại' : r.partnerType === 'TRANSPORT_COMPANY' ? 'Vận chuyển' : 'Cửa hàng',
        taxCode: r.taxCode || 'N/A',
        status: r.cooperationStatus === 'APPROVED' ? 'Đã duyệt' : r.cooperationStatus === 'PENDING' ? 'Chờ duyệt' : r.account?.status === 'LOCKED' ? 'Đã khóa' : 'Đã duyệt',
        tone: r.cooperationStatus === 'APPROVED' ? 'active' : r.cooperationStatus === 'PENDING' ? 'warning' : 'locked',
        representative: r.contactPerson,
        email: r.account?.email,
        phone: r.account?.phone,
        address: r.address,
        rawType: r.partnerType,
        rawStatus: r.cooperationStatus,
        stats: r.stats
      }));
      setPartnerRows(formatted);
      if (selectedPartner) {
        const updated = formatted.find((p: any) => p.id === selectedPartner.id);
        if (updated) setSelectedPartner(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const filteredPartnerRows = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return partnerRows.filter((row: any) => {
      const matchesSearch = !normalizedSearch || [
        row.id,
        row.name,
        row.type,
        row.taxCode,
        row.status,
        row.representative,
        row.email,
        row.phone,
        row.address,
        row.rawType,
        row.rawStatus
      ].some((value) => String(value ?? '').toLowerCase().includes(normalizedSearch));

      const matchesStatus = !statusFilter || row.rawStatus === statusFilter;
      const matchesType = !typeFilter || row.rawType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [partnerRows, searchQuery, statusFilter, typeFilter]);

  const handleTogglePartner = async () => {
    try {
      const isLocked = selectedPartner.status === 'Đã khóa';
      const newStatus = isLocked ? 'APPROVED' : 'TERMINATED';
      
      await api.put(`/partners/${selectedPartner.rawId}/status`, { 
        cooperationStatus: newStatus,
        reason: toggleReason 
      });
      
      alert(`Đã ${isLocked ? 'mở khóa' : 'khóa'} đối tác thành công!`);
      setShowToggleModal(false);
      setToggleReason('');
      fetchPartners();
    } catch (err) {
      alert('Lỗi cập nhật');
    }
  };

  const addLicensePlate = () => {
    if (newPlate.trim() && !licensePlates.includes(newPlate.trim().toUpperCase())) {
      setLicensePlates([...licensePlates, newPlate.trim().toUpperCase()]);
      setNewPlate('');
    }
  };

  const removeLicensePlate = (plateToRemove: string) => {
    setLicensePlates(licensePlates.filter(plate => plate !== plateToRemove));
  };

  const handleActionClick = (action: 'approve' | 'reject') => {
    setApprovalAction(action);
    setShowApprovalModal(true);
  };
  
  const submitApproval = async () => {
    try {
      const newStatus = approvalAction === 'approve' ? 'APPROVED' : 'TERMINATED';
      await api.put(`/partners/${selectedPartner.rawId}/status`, {
        cooperationStatus: newStatus,
        reason
      });
      alert(`Đã ${approvalAction === 'approve' ? 'phê duyệt' : 'từ chối'} thành công!`);
      setShowApprovalModal(false);
      setReason('');
      fetchPartners();
    } catch (err) {
      alert('Lỗi duyệt');
    }
  };

  const submitAddPartner = async () => {
    try {
      let mappedType = newPartnerType;
      if (newPartnerType === 'farm' || newPartnerType === 'supplier') mappedType = 'FARM';
      else if (newPartnerType === 'shipping') mappedType = 'TRANSPORT_COMPANY';
      else if (newPartnerType === 'store') mappedType = 'STORE';

      await api.post('/partners', {
        partnerName: addForm.name,
        taxCode: addForm.taxCode,
        partnerType: mappedType,
        contactPerson: addForm.representative,
        address: addForm.address,
        cooperationStatus: 'APPROVED'
      });
      alert('Thêm đối tác thành công!');
      setShowAddPartnerModal(false);
      setAddForm({});
      fetchPartners();
    } catch (err) {
      alert('Lỗi thêm đối tác');
    }
  };

  void submitApproval;
  void submitAddPartner;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
      <style>{scrollbarHideStyle}</style>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Mạng lưới cung ứng</h1>
          <p className="text-slate-500 mt-2">Quản lý nông trại, hợp tác xã và đơn vị vận chuyển</p>
        </div>
        <button onClick={() => setShowAddPartnerModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-sage-600 hover:bg-sage-700 text-white font-bold rounded-xl transition-colors shadow-sm">
          <Plus size={18} />
          Thêm đối tác
        </button>
      </header>

      {/* Modern Filter Section */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[250px]" onChange={(e) => setSearchQuery((e.target as HTMLInputElement).value)}>
          <SearchBar placeholder="Tìm đối tác, mã số thuế..." />
        </div>

        <div className="hidden lg:block w-px h-8 bg-slate-200 mx-1"></div>

        <div className="relative min-w-[150px]">
          <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select onChange={(e) => setStatusFilter(['', 'APPROVED', 'PENDING', 'TERMINATED'][e.target.selectedIndex] ?? '')} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-100 font-medium text-slate-600">
            <option>Tất cả trạng thái</option>
            <option>Đã duyệt</option>
            <option>Chờ duyệt</option>
            <option>Bị từ chối</option>
          </select>
        </div>

        <div className="relative min-w-[150px]">
          <BarChart3 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select onChange={(e) => setTypeFilter(['', 'FARM', 'FARM', 'TRANSPORT_COMPANY', 'STORE'][e.target.selectedIndex] ?? '')} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-100 font-medium text-slate-600">
            <option>Tất cả loại hình</option>
            <option>Nông trại</option>
            <option>Nhà cung cấp</option>
            <option>Vận chuyển</option>
          </select>
        </div>
      </div>

      <div className="flex items-start gap-6 relative">
        {/* Table View */}
        <div className={`transition-all duration-300 ${selectedPartner ? 'w-2/3' : 'w-full'} bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden`}>
          <div className="grid grid-cols-[minmax(280px,1.7fr)_minmax(180px,1fr)_minmax(140px,0.7fr)_minmax(110px,0.5fr)_48px] gap-4 p-4 bg-slate-50/50 text-slate-500 font-bold uppercase text-xs tracking-wider border-b border-slate-100 items-center">
            <div>Đối tác</div>
            <div>Loại hình & MST</div>
            <div className="text-center">Trạng thái</div>
            <div className="text-center">Khóa/Mở</div>
            <div></div>
          </div>
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {filteredPartnerRows.map((row: any) => (
              <div
                key={row.id}
                className={`grid grid-cols-[minmax(280px,1.7fr)_minmax(180px,1fr)_minmax(140px,0.7fr)_minmax(110px,0.5fr)_48px] gap-4 p-4 items-center hover:bg-slate-50 transition-colors cursor-pointer text-sm ${selectedPartner?.id === row.id ? 'bg-sage-50/30' : ''}`}
                onClick={() => setSelectedPartner(row)}
              >
                <div className="flex items-center gap-3">
                  <div className={`px-2.5 py-1 text-xs font-bold whitespace-nowrap rounded ${row.type.includes('Nông') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                    {row.type.substring(0, 2)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 flex items-center gap-2">
                      <span className={row.status === 'Đã khóa' ? 'line-through text-slate-400' : ''}>{row.name}</span>
                      {row.pendingApproval && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          <ShieldAlert size={10} /> Cần duyệt
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">{row.id}</div>
                  </div>
                </div>
                <div>
                  <div className="text-slate-600 font-medium">{row.type}</div>
                  <div className="text-slate-500 font-mono text-xs mt-0.5">{row.taxCode}</div>
                </div>
                <div className="flex justify-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${row.tone === 'active' ? 'bg-cyan-100 text-cyan-700 border border-cyan-200' : 
                    row.tone === 'locked' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                    {row.status}
                  </span>
                </div>
                <div className="flex justify-center items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPartner(row);
                      setShowToggleModal(true);
                    }}
                    className={`p-1 rounded-full transition-colors ${row.status !== 'Đã khóa' ? 'text-sage-500 hover:text-sage-600' : 'text-slate-300 hover:text-slate-400'}`}
                    title={row.status !== 'Đã khóa' ? "Khóa đối tác" : "Mở khóa đối tác"}
                  >
                    {row.status !== 'Đã khóa' ? <ToggleRight size={36} strokeWidth={1.5} /> : <ToggleLeft size={36} strokeWidth={1.5} />}
                  </button>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPartner(row);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                    title="Xem chi tiết"
                  >
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Partner Profile Form View */}
        {selectedPartner && (
          <div className="w-1/3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24 flex flex-col animate-in slide-in-from-right-8 duration-300">
            <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-bold uppercase tracking-wider">Hồ sơ đối tác</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${selectedPartner.tone === 'active' ? 'bg-cyan-100 text-cyan-700' : 'bg-amber-100 text-amber-700'}`}>
                    {selectedPartner.status}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-800">{selectedPartner.name}</h2>
                <p className="text-slate-500 text-sm mt-1">{selectedPartner.type} • {selectedPartner.taxCode || 'MST: 0102030405'}</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <button onClick={() => setSelectedPartner(null)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 shadow-sm">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Thông tin liên hệ</h3>
                <button 
                  onClick={() => setShowEditPartnerModal(true)}
                  className="text-xs font-bold text-sage-600 hover:text-sage-700 flex items-center gap-1"
                >
                  <Edit2 size={12} /> Sửa
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0"><Building2 size={16} /></div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">Đại diện pháp luật</div>
                    <div className="text-sm font-semibold text-slate-800">{selectedPartner.representative || 'Chưa cập nhật'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0"><Phone size={16} /></div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">Số điện thoại</div>
                    <div className="text-sm font-semibold text-slate-800">{selectedPartner.phone || 'Chưa cập nhật'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0"><Mail size={16} /></div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">Email liên hệ</div>
                    <div className="text-sm font-semibold text-slate-800">{selectedPartner.email || 'Chưa cập nhật'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0 mt-0.5"><MapPin size={16} /></div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">Địa chỉ đăng ký</div>
                    <div className="text-sm font-semibold text-slate-800 leading-tight">{selectedPartner.address || 'Chưa cập nhật'}</div>
                  </div>
                </div>
              </div>

              {/* THÔNG TIN HOẠT ĐỘNG Section (Main Panel) */}
              <div className="border-t border-slate-100 pt-6 mb-6 animate-in fade-in slide-in-from-top-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Thông tin hoạt động</h3>
                <div className="space-y-4">
                  {selectedPartner.type.includes('Vận chuyển') && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0"><Clock size={16} /></div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">Danh sách xe</div>
                          <div className="text-sm font-semibold text-slate-800 italic text-slate-400">Chưa hỗ trợ lưu trữ</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0"><BarChart3 size={16} /></div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">Tải trọng tổng</div>
                          <div className="text-sm font-semibold text-slate-800 italic text-slate-400">Chưa hỗ trợ lưu trữ</div>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedPartner.type.includes('Nông trại') && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0"><MapPin size={16} /></div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">Diện tích canh tác</div>
                          <div className="text-sm font-semibold text-slate-800 italic text-slate-400">Chưa hỗ trợ lưu trữ</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0"><CheckCircle2 size={16} /></div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">Chứng chỉ chất lượng</div>
                          <div className="text-sm font-semibold text-slate-800 italic text-slate-400">Chưa hỗ trợ lưu trữ</div>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedPartner.type.includes('Cửa hàng') && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0"><Clock size={16} /></div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">Giờ hoạt động</div>
                          <div className="text-sm font-semibold text-slate-800 italic text-slate-400">Chưa hỗ trợ lưu trữ</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0"><Building2 size={16} /></div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">Người quản lý</div>
                          <div className="text-sm font-semibold text-slate-800 italic text-slate-400">Chưa hỗ trợ lưu trữ</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {(selectedPartner.status === 'Chờ duyệt' || selectedPartner.hasPendingUpdate) && (
                <div className="border-t border-slate-100 pt-6">
                  <div className="p-4 bg-[#FEEE91]/20 border border-[#d97706]/30 rounded-xl">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#d97706] mb-3 flex items-center gap-2">
                      <AlertCircle size={14} /> 
                      {selectedPartner.status === 'Chờ duyệt' ? 'XÉT DUYỆT HỒ SƠ MỚI' : 'YÊU CẦU THAY ĐỔI HỒ SƠ'}
                    </div>
                    
                    <div className="bg-white/60 backdrop-blur-sm border border-[#d97706]/10 rounded-lg p-3 space-y-3">
                      {/* Dynamic fields based on partner type */}
                      {selectedPartner.type.includes('Nông trại') && (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500 font-medium">Diện tích canh tác</span>
                            <div className="flex items-center gap-2">
                              {selectedPartner.hasPendingUpdate && (
                                <>
                                  <span className="text-slate-400 line-through text-xs italic">5 ha</span>
                                  <ArrowRight size={12} className="text-slate-300" />
                                </>
                              )}
                              <span className="text-slate-900 font-bold">10 ha</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100/50">
                            <span className="text-slate-500 font-medium">Chứng chỉ chất lượng</span>
                            <div className="flex items-center gap-2">
                              {selectedPartner.hasPendingUpdate && (
                                <>
                                  <span className="text-slate-400 line-through text-xs italic">Chưa có</span>
                                  <ArrowRight size={12} className="text-slate-300" />
                                </>
                              )}
                              <span className="text-slate-900 font-bold">VietGAP_2026.pdf</span>
                            </div>
                          </div>
                        </>
                      )}

                      {selectedPartner.type.includes('Vận chuyển') && (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500 font-medium">Loại phương tiện</span>
                            <div className="flex items-center gap-2">
                              {selectedPartner.hasPendingUpdate && (
                                <>
                                  <span className="text-slate-400 line-through text-xs italic">Xe tải 2.5T</span>
                                  <ArrowRight size={12} className="text-slate-300" />
                                </>
                              )}
                              <span className="text-slate-900 font-bold">Xe tải đông lạnh 5T</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100/50">
                            <span className="text-slate-500 font-medium">Danh sách biển số</span>
                            <div className="flex items-center gap-2">
                              {selectedPartner.hasPendingUpdate && (
                                <>
                                  <span className="text-slate-400 line-through text-xs italic">51H-123.45</span>
                                  <ArrowRight size={12} className="text-slate-300" />
                                </>
                              )}
                              <span className="text-slate-900 font-bold">51H-999.99</span>
                            </div>
                          </div>
                        </>
                      )}

                      {selectedPartner.type.includes('Cửa hàng') && (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500 font-medium">Thời gian hoạt động</span>
                            <div className="flex items-center gap-2">
                              {selectedPartner.hasPendingUpdate && (
                                <>
                                  <span className="text-slate-400 line-through text-xs italic">08:00 - 20:00</span>
                                  <ArrowRight size={12} className="text-slate-300" />
                                </>
                              )}
                              <span className="text-slate-900 font-bold">06:00 - 22:00</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => handleActionClick('reject')} 
                        className="flex-1 px-3 py-2 bg-white border border-[#d97706]/30 text-[#d97706] hover:bg-[#FEEE91]/40 font-bold rounded-lg text-sm transition-colors shadow-sm"
                      >
                        Từ chối
                      </button>
                      <button 
                        onClick={() => handleActionClick('approve')} 
                        className="flex-1 px-3 py-2 bg-sage-600 hover:bg-sage-700 text-white font-bold rounded-lg text-sm transition-colors shadow-sm"
                      >
                        Phê duyệt
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Approval / Rejection Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl shadow-sm border ${approvalAction === 'approve' ? 'bg-white border-emerald-100 text-emerald-500' : 'bg-white border-red-100 text-red-500'}`}>
                  {approvalAction === 'approve' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  {approvalAction === 'approve' ? 'Phê duyệt hồ sơ' : 'Từ chối yêu cầu'}
                </h3>
              </div>
              <button onClick={() => setShowApprovalModal(false)} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                Bạn đang thực hiện thao tác <strong className={approvalAction === 'approve' ? 'text-emerald-600' : 'text-red-600'}>{approvalAction === 'approve' ? 'phê duyệt' : 'từ chối'}</strong> thay đổi thông tin của đối tác <strong className="text-slate-800">{selectedPartner.name}</strong>.
                {approvalAction === 'reject' && ' Hệ thống yêu cầu nhập lý do để ghi nhận Audit Log và thông báo cho đối tác.'}
              </p>

              <div className="mb-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Lý do / Ghi chú {approvalAction === 'reject' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className={`w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none resize-none h-28 transition-all ${approvalAction === 'reject' && !reason.trim() ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-500/30'}`}
                  placeholder={approvalAction === 'reject' ? 'Bắt buộc nhập lý do từ chối để hoàn tất thao tác...' : 'Ghi chú thêm cho hệ thống (không bắt buộc)...'}
                  autoFocus
                />
              </div>
            </div>
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowApprovalModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl shadow-sm transition-colors">
                Hủy
              </button>
              <button
                className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-sm transition-colors ${approvalAction === 'approve' ? 'bg-sage-600 hover:bg-sage-700' : 'bg-red-600 hover:bg-red-700'
                  } ${(approvalAction === 'reject' && !reason.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={approvalAction === 'reject' && !reason.trim()}
                onClick={() => {
                  alert(`Đã ${approvalAction === 'approve' ? 'phê duyệt' : 'từ chối'} thành công!`);
                  setShowApprovalModal(false);
                  setReason('');
                }}
              >
                Xác nhận {approvalAction === 'approve' ? 'phê duyệt' : 'từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Partner Status Modal */}
      {showToggleModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl shadow-sm border ${selectedPartner.status === 'Đã khóa' ? 'bg-white border-emerald-100 text-emerald-500' : 'bg-white border-red-100 text-red-500'}`}>
                  {selectedPartner.status === 'Đã khóa' ? <CheckCircle2 size={20} /> : <ShieldAlert size={20} />}
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  {selectedPartner.status === 'Đã khóa' ? 'Xác nhận mở khóa' : 'Xác nhận khóa đối tác'}
                </h3>
              </div>
              <button onClick={() => setShowToggleModal(false)} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                Bạn đang thực hiện thao tác <strong className={selectedPartner.status === 'Đã khóa' ? 'text-emerald-600' : 'text-red-600'}>{selectedPartner.status === 'Đã khóa' ? 'mở khóa' : 'khóa'}</strong> đối tác <strong className="text-slate-800">{selectedPartner.name}</strong>.
                {selectedPartner.status !== 'Đã khóa' && ' Đối tác bị khóa sẽ không thể đăng nhập và mọi hoạt động liên kết mới sẽ bị chặn.'}
              </p>

              <div className="mb-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Lý do / Ghi chú <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={toggleReason}
                  onChange={(e) => setToggleReason(e.target.value)}
                  className={`w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none resize-none h-28 transition-all ${!toggleReason.trim() ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-500/30'}`}
                  placeholder="Bắt buộc nhập lý do để ghi nhận vào Audit Log..."
                  autoFocus
                />
              </div>
            </div>
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowToggleModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl shadow-sm transition-colors">
                Hủy
              </button>
              <button
                className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-sm transition-colors ${selectedPartner.status === 'Đã khóa' ? 'bg-sage-600 hover:bg-sage-700' : 'bg-red-600 hover:bg-red-700'} ${(!toggleReason.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!toggleReason.trim()}
                onClick={handleTogglePartner}
              >
                Xác nhận {selectedPartner.status === 'Đã khóa' ? 'mở khóa' : 'khóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Partner Modal */}
      {showAddPartnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0 bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">Thêm đối tác mới</h3>
              <button onClick={() => setShowAddPartnerModal(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 shadow-sm">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tên đối tác / Tổ chức <span className="text-red-500">*</span></label>
                  <input type="text" value={addForm.name || ""} onChange={(e) => setAddForm({...addForm, name: e.target.value})} placeholder="Nhập tên đối tác hoặc tổ chức..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-sage-500/50 focus:border-sage-500 rounded-xl text-sm focus:bg-white focus:ring-2 outline-none transition-all" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Mã số thuế / CMND <span className="text-red-500">*</span></label>
                  <input type="text" value={addForm.taxCode || ""} onChange={(e) => setAddForm({...addForm, taxCode: e.target.value})} placeholder="Nhập mã số thuế..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-sage-500/50 focus:border-sage-500 rounded-xl text-sm focus:bg-white focus:ring-2 outline-none transition-all" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Loại hình đối tác <span className="text-red-500">*</span></label>
                  <select 
                    value={newPartnerType}
                    onChange={(e) => setNewPartnerType(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-sage-500/50 focus:border-sage-500 rounded-xl text-sm focus:bg-white focus:ring-2 outline-none transition-all cursor-pointer appearance-none"
                  >
                    <option value="">-- Chọn loại hình --</option>
                    <option value="farm">Nông trại / Nhà cung cấp</option>
                    <option value="shipping">Đơn vị vận chuyển</option>
                    <option value="store">Cửa hàng / Phân phối</option>
                  </select>
                </div>
                
                {/* Farm / Supplier specific fields */}
                {(newPartnerType === 'farm' || newPartnerType === 'supplier') && (
                  <>
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Diện tích canh tác (ha) <span className="text-red-500">*</span></label>
                      <input type="number" placeholder="Ví dụ: 15..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-sage-500/50 focus:border-sage-500 rounded-xl text-sm focus:bg-white focus:ring-2 outline-none transition-all" />
                    </div>
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Loại nông sản chủ lực <span className="text-red-500">*</span></label>
                      <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-sage-500/50 focus:border-sage-500 rounded-xl text-sm focus:bg-white focus:ring-2 outline-none transition-all cursor-pointer appearance-none">
                        <option value="">-- Chọn loại nông sản --</option>
                        <option>Rau củ quả</option>
                        <option>Trái cây</option>
                        <option>Thịt gia súc/gia cầm</option>
                        <option>Thủy hải sản</option>
                        <option>Trứng / Sữa</option>
                      </select>
                    </div>
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Chứng chỉ hiện có</label>
                      <input type="text" placeholder="VietGAP, GlobalGAP, Organic..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-sage-500/50 focus:border-sage-500 rounded-xl text-sm focus:bg-white focus:ring-2 outline-none transition-all" />
                    </div>
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Thời hạn hiệu lực chứng chỉ</label>
                      <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-sage-500/50 focus:border-sage-500 rounded-xl text-sm focus:bg-white focus:ring-2 outline-none transition-all" />
                    </div>
                  </>
                )}

                {/* Shipping specific fields */}
                {newPartnerType === 'shipping' && (
                  <>
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Loại phương tiện vận chuyển <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="Xe tải đông lạnh, Container..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-sage-500/50 focus:border-sage-500 rounded-xl text-sm focus:bg-white focus:ring-2 outline-none transition-all" />
                    </div>
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Số lượng tài xế <span className="text-red-500">*</span></label>
                      <input type="number" placeholder="Nhập số lượng..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-sage-500/50 focus:border-sage-500 rounded-xl text-sm focus:bg-white focus:ring-2 outline-none transition-all" />
                    </div>
                    <div className="col-span-1 md:col-span-2 animate-in fade-in slide-in-from-top-2 space-y-3">
                      <label className="block text-sm font-bold text-slate-700">Danh sách phương tiện <span className="text-red-500">*</span></label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={newPlate}
                          onChange={(e) => setNewPlate(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLicensePlate())}
                          placeholder="Nhập biển số xe (VD: 51H-123.45)..." 
                          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-sage-500/50 focus:border-sage-500 rounded-xl text-sm focus:bg-white focus:ring-2 outline-none transition-all" 
                        />
                        <button 
                          onClick={addLicensePlate}
                          className="px-6 py-3 bg-sage-600 hover:bg-sage-700 text-white font-bold rounded-xl transition-colors shadow-sm text-sm"
                        >
                          Thêm
                        </button>
                      </div>

                      {licensePlates.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {licensePlates.map((plate) => (
                            <span 
                              key={plate} 
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 animate-in zoom-in-95 duration-150"
                            >
                              <span className="font-mono">{plate}</span>
                              <button 
                                onClick={() => removeLicensePlate(plate)}
                                className="p-0.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="col-span-1 md:col-span-2 animate-in fade-in slide-in-from-top-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Khu vực hoạt động <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="Ví dụ: Đông Nam Bộ, Nội thành TP.HCM..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-sage-500/50 focus:border-sage-500 rounded-xl text-sm focus:bg-white focus:ring-2 outline-none transition-all" />
                    </div>
                  </>
                )}

                {/* Store specific fields */}
                {newPartnerType === 'store' && (
                  <>
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Loại hình cửa hàng <span className="text-red-500">*</span></label>
                      <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-sage-500/50 focus:border-sage-500 rounded-xl text-sm focus:bg-white focus:ring-2 outline-none transition-all cursor-pointer appearance-none">
                        <option value="">-- Chọn loại hình --</option>
                        <option>Siêu thị</option>
                        <option>Cửa hàng tiện lợi</option>
                        <option>Cửa hàng thực phẩm sạch chuyên doanh</option>
                      </select>
                    </div>
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Thời gian hoạt động <span className="text-red-500">*</span></label>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <CustomTimePicker value={startTime} onChange={setStartTime} />
                        </div>
                        <span className="text-slate-400 font-medium pt-1">đến</span>
                        <div className="flex-1">
                          <CustomTimePicker value={endTime} onChange={setEndTime} />
                        </div>
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-6 animate-in fade-in slide-in-from-top-2 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Họ và tên người phụ trách <span className="text-red-500">*</span></label>
                          <input type="text" placeholder="Ví dụ: Nguyễn Văn A..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-sage-500/50 rounded-xl text-sm focus:bg-white focus:ring-2 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Số điện thoại phụ trách <span className="text-red-500">*</span></label>
                          <input type="tel" placeholder="Ví dụ: 0901234567..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-sage-500/50 rounded-xl text-sm focus:bg-white focus:ring-2 outline-none transition-all" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Đại diện pháp luật</label>
                  <input type="text" placeholder="Họ và tên người đại diện..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-sage-500/50 focus:border-sage-500 rounded-xl text-sm focus:bg-white focus:ring-2 outline-none transition-all" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Số điện thoại liên hệ <span className="text-red-500">*</span></label>
                  <input type="tel" placeholder="Nhập số điện thoại..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-sage-500/50 focus:border-sage-500 rounded-xl text-sm focus:bg-white focus:ring-2 outline-none transition-all" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email liên hệ <span className="text-red-500">*</span></label>
                  <input type="email" placeholder="Nhập email đối tác..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-sage-500/50 focus:border-sage-500 rounded-xl text-sm focus:bg-white focus:ring-2 outline-none transition-all" />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Địa chỉ đăng ký kinh doanh <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Nhập địa chỉ đầy đủ..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-sage-500/50 focus:border-sage-500 rounded-xl text-sm focus:bg-white focus:ring-2 outline-none transition-all" />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
              <button 
                onClick={() => setShowAddPartnerModal(false)}
                className="px-6 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-colors shadow-sm"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={() => {
                  alert('Thêm đối tác thành công! Hồ sơ đối tác đã được tạo.');
                  setShowAddPartnerModal(false);
                }}
                className="px-6 py-3 text-sm font-bold text-white bg-sage-600 hover:bg-sage-700 rounded-xl transition-colors shadow-sm"
              >
                Lưu thông tin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Partner Modal */}
      {showEditPartnerModal && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white shadow-sm border border-slate-200 text-sage-600">
                  <Edit2 size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">Sửa thông tin đối tác</h3>
                  <p className="text-sm text-slate-500 font-medium">Cập nhật thông tin liên hệ và giấy phép</p>
                </div>
              </div>
              <button onClick={() => setShowEditPartnerModal(false)} className="text-slate-400 hover:text-slate-600 p-2 bg-white rounded-xl border border-transparent hover:border-slate-200 shadow-sm transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tên đối tác</label>
                    <input type="text" defaultValue={selectedPartner.name} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 focus:bg-white outline-none transition-all font-medium text-slate-800" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Loại hình</label>
                    <select defaultValue={selectedPartner.type} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 focus:bg-white outline-none transition-all font-medium text-slate-800">
                      <option value="Nông trại">Nông trại</option>
                      <option value="Vận chuyển">Vận chuyển</option>
                      <option value="Cửa hàng">Cửa hàng</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Mã số thuế</label>
                    <input type="text" defaultValue={selectedPartner.taxCode || '0102030405'} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 focus:bg-white outline-none transition-all font-medium text-slate-800" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Người đại diện</label>
                    <input type="text" defaultValue={selectedPartner.representative || 'Nguyễn Văn A'} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 focus:bg-white outline-none transition-all font-medium text-slate-800" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Số điện thoại</label>
                    <input type="text" defaultValue={selectedPartner.phone || '0901.234.567'} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 focus:bg-white outline-none transition-all font-medium text-slate-800" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email liên hệ</label>
                    <input type="email" defaultValue={`contact@${(selectedPartner?.id || 'PRT-000').toLowerCase()}.vn`} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 focus:bg-white outline-none transition-all font-medium text-slate-800" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Địa chỉ đăng ký</label>
                  <input type="text" defaultValue="123 Đường Nông Nghiệp, Huyện Củ Chi, TP. Hồ Chí Minh" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 focus:bg-white outline-none transition-all font-medium text-slate-800" />
                </div>

                {selectedPartner.type.includes('Vận chuyển') && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Khu vực phục vụ</label>
                    <input type="text" defaultValue="Miền Nam, Miền Trung" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 focus:bg-white outline-none transition-all font-medium text-slate-800" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setShowEditPartnerModal(false)}
                className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={() => {
                  setShowEditPartnerModal(false);
                }}
                className="px-6 py-2.5 bg-sage-600 hover:bg-sage-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
              >
                <CheckCircle2 size={18} /> Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomTimePicker({ value, onChange, label }: { value: string, onChange: (val: string) => void, label?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45']; 

  const [currentHour, currentMinute] = value.split(':');

  return (
    <div className="relative w-full">
      {label && <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">{label}</div>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-semibold text-slate-700 transition-all outline-none focus:ring-2 focus:ring-sage-500/30"
      >
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-slate-400" />
          <span>{value}</span>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] border border-slate-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-3">
            <div className="flex h-56 gap-2">
              {/* Hours Column */}
              <div className="flex-1 overflow-y-auto hide-scrollbar scroll-smooth">
                <div className="space-y-1">
                  {hours.map((h) => (
                    <button
                      key={h}
                      onClick={() => {
                        onChange(`${h}:${currentMinute}`);
                      }}
                      className={`w-full py-2 text-sm text-center transition-all flex items-center justify-center rounded-lg ${
                        currentHour === h 
                        ? 'bg-sage-600 text-white font-bold shadow-sm' 
                        : 'text-slate-600 hover:bg-[#FEEE91]/40'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Minutes Column */}
              <div className="flex-1 overflow-y-auto hide-scrollbar scroll-smooth">
                <div className="space-y-1">
                  {minutes.map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        onChange(`${currentHour}:${m}`);
                        setIsOpen(false);
                      }}
                      className={`w-full py-2 text-sm text-center transition-all flex items-center justify-center rounded-lg ${
                        currentMinute === m 
                        ? 'bg-sage-600 text-white font-bold shadow-sm' 
                        : 'text-slate-600 hover:bg-[#FEEE91]/40'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
