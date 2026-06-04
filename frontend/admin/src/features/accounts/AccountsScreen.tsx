import { useState, useEffect, useMemo } from 'react';
import { api } from '../../config/api';
import { Plus, UserCog, ToggleLeft, ToggleRight, MoreVertical, X, ChevronLeft, ChevronRight, ShieldCheck, Building2 } from 'lucide-react';
import { SearchBar } from '../../components/common/SearchBar';

export function AccountsScreen(_props: { data: any }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [detailRow, setDetailRow] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [confirmToggle, setConfirmToggle] = useState<any>(null);
  const [formErrors, setFormErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addForm, setAddForm] = useState<any>({});
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [unregisteredPartners, setUnregisteredPartners] = useState<any[]>([]);
  const [fetchingPartners, setFetchingPartners] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [rows, setRows] = useState<any[]>([]);
  const [, setLoading] = useState(true);

  const roleNames: Record<string, string> = {
    ADMIN: 'Quản trị viên',
    FARMER: 'Nông trại',
    TRANSPORTER: 'Vận chuyển',
    STORE: 'Cửa hàng',
    WAREHOUSE: 'Nhân viên kho',
    INSPECTOR: 'Điều phối viên'
  };

  const partnerTypeNames: Record<string, string> = {
    FARM: 'Nông trại',
    TRANSPORT_COMPANY: 'Vận chuyển',
    STORE: 'Cửa hàng'
  };

  const emptyValue = 'Chưa cập nhật';

  const formatDateTime = (value?: string | null) => {
    if (!value) return emptyValue;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return emptyValue;

    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const displayValue = (value?: string | number | null) => {
    if (value === null || value === undefined || value === '') return emptyValue;
    return String(value);
  };

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/accounts');
      const fetchedAccounts = res.data.map((acc: any) => ({
        id: `ACC-${acc.accountId.toString().padStart(3, '0')}`,
        accountId: acc.accountId,
        name: acc.fullName || acc.username,
        username: acc.username,
        email: acc.email,
        phone: acc.phone,
        role: roleNames[acc.role] || acc.role,
        rawRole: acc.role,
        status: acc.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa',
        isActive: acc.status === 'ACTIVE',
        createdAt: acc.createdAt,
        updatedAt: acc.updatedAt,
        createdAtDisplay: formatDateTime(acc.createdAt),
        updatedAtDisplay: formatDateTime(acc.updatedAt),
        locked: acc.status !== 'ACTIVE',
        partnerId: acc.partnerId,
        partnerName: acc.partner?.partnerName,
        partnerType: acc.partner?.partnerType,
        partnerTypeLabel: partnerTypeNames[acc.partner?.partnerType] || acc.partner?.partnerType,
        taxCode: acc.partner?.taxCode,
        contactPerson: acc.partner?.contactPerson
      }));
      setRows(fetchedAccounts);
      
      try {
        setFetchingPartners(true);
        const pRes = await api.get('/partners');
        const partnersWithoutAccounts = pRes.data.filter((p: any) => !p.account);
        setUnregisteredPartners(partnersWithoutAccounts);
      } catch(e) {
        console.error("Failed to fetch partners for suggestion:", e);
      } finally {
        setFetchingPartners(false);
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return rows.filter((row: any) => {
      const matchesSearch = !normalizedSearch || [
        row.id,
        row.name,
        row.username,
        row.email,
        row.phone,
        row.role,
        row.rawRole,
        row.partnerId ? String(row.partnerId) : ''
      ].some((value) => String(value ?? '').toLowerCase().includes(normalizedSearch));

      const matchesRole = !roleFilter || row.rawRole === roleFilter;
      const matchesStatus = !statusFilter || (statusFilter === 'ACTIVE' ? row.isActive : !row.isActive);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [rows, searchQuery, roleFilter, statusFilter]);

  const handleToggle = async (id: string) => {
    const rowToToggle = rows.find(r => r.id === id);
    if (!rowToToggle) return;
    
    try {
      const newStatus = rowToToggle.isActive ? 'LOCKED' : 'ACTIVE';
      await api.put(`/accounts/${rowToToggle.accountId}/status`, { status: newStatus });
      setRows(rows.map((r: any) => r.id === id ? { ...r, isActive: !r.isActive, status: newStatus === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa' } : r));
    } catch (error: any) {
      alert(error.response?.data?.message || 'Không thể thay đổi trạng thái');
    }
    setConfirmToggle(null);
  };

  const handleExtractData = () => {
    setShowPartnerModal(true);
  };

  const selectPartner = (p: any) => {
    const roleMapping: any = {
      FARM: 'FARMER',
      STORE: 'STORE', // Hoặc WAREHOUSE tùy nhu cầu
      TRANSPORT_COMPANY: 'TRANSPORTER'
    };
    setAddForm({
      username: p.taxCode ? `partner_${p.taxCode}` : `partner_${p.partnerId}`,
      password: '',
      fullName: p.contactPerson || p.partnerName,
      email: '',
      phone: '',
      role: roleMapping[p.partnerType] || '',
      partnerId: p.partnerId
    });
    setFormErrors({});
    setShowPartnerModal(false);
  };

  const submitAdd = async () => {
    setIsSubmitting(true);
    setFormErrors({});

    try {
      if (!addForm.username || !addForm.password || !addForm.role || !addForm.email) {
        setFormErrors({
          ...(!addForm.username ? { username: 'Tên đăng nhập không được để trống.' } : {}),
          ...(!addForm.email ? { email: 'Email không đúng định dạng.' } : {}),
          ...(!addForm.password ? { password: 'Mật khẩu chưa đủ mạnh.' } : {}),
          ...(!addForm.role ? { role: 'Vui lòng chọn vai trò cho tài khoản.' } : {})
        });
        setIsSubmitting(false);
        return;
      }
      
      const payload: any = {
        username: addForm.username,
        password: addForm.password,
        fullName: addForm.fullName || addForm.name,
        email: addForm.email,
        phone: addForm.phone,
        role: addForm.role,
        status: 'ACTIVE'
      };
      
      // Gắn partnerId nếu không phải là ADMIN và được trích xuất từ popup đối tác
      if (addForm.role !== 'ADMIN' && addForm.partnerId) {
        payload.partnerId = addForm.partnerId;
      }

      await api.post('/accounts', payload);
      alert('Tạo tài khoản thành công!');
      setShowAddModal(false);
      setAddForm({});
      fetchAccounts();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi tạo tài khoản');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitEdit = async () => {
    setIsSubmitting(true);
    setFormErrors({});

    try {
      const payload = {
        fullName: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        role: editForm.rawRole || editForm.role
      };

      await api.put(`/accounts/${editForm.accountId}`, payload);
      alert('Cập nhật tài khoản thành công!');
      setShowEditModal(false);
      setDetailRow(null);
      fetchAccounts();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật tài khoản');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Quản lý người dùng</h1>
          <p className="text-slate-500 mt-2">Phân quyền và kiểm soát truy cập hệ thống</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-sage-600 hover:bg-sage-700 text-white font-bold rounded-xl transition-colors shadow-sm"
        >
          <Plus size={18} />
          Thêm tài khoản
        </button>
      </header>

      {/* Sleek Filters */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[250px]" onChange={(e) => setSearchQuery((e.target as HTMLInputElement).value)}>
          <SearchBar placeholder="Tìm tài khoản, email..." />
        </div>

        <div className="hidden lg:block w-px h-8 bg-slate-200 mx-1"></div>

        <div className="relative min-w-[150px]">
          <ShieldCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select onChange={(e) => setRoleFilter(['', 'ADMIN', 'WAREHOUSE', 'INSPECTOR'][e.target.selectedIndex] ?? '')} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-100 font-medium text-slate-600">
            <option>Tất cả vai trò</option>
            <option>Quản trị viên</option>
            <option>Quản lý kho</option>
            <option>Điều phối viên</option>
          </select>
        </div>

        <div className="relative min-w-[150px]">
          <ToggleRight size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select onChange={(e) => setStatusFilter(['', 'ACTIVE', 'LOCKED'][e.target.selectedIndex] ?? '')} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-100 font-medium text-slate-600">
            <option>Tất cả trạng thái</option>
            <option>Đang hoạt động</option>
            <option>Đã khóa</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
        <div className="grid grid-cols-[1fr_1fr_40px] gap-4 p-4 bg-slate-50/50 text-slate-500 font-bold uppercase text-xs tracking-wider border-b border-slate-100 items-center">
          <div>Tên & Email</div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center pr-8">Vai trò</div>
            <div className="text-center">Trạng thái</div>
            <div className="text-center">Khóa/Mở</div>
          </div>
          <div></div>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredRows.map((row: any) => (
            <div key={row.id} className="grid grid-cols-[1fr_1fr_40px] gap-4 p-4 items-center hover:bg-slate-50/50 transition-colors text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <UserCog size={20} />
                </div>
                <div>
                  <div className="font-bold text-slate-800">{row.name}</div>
                  <div className="text-xs text-slate-500">{row.email}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="text-slate-600 font-medium text-center pr-8">{row.role}</div>
                <div className="flex justify-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${row.isActive ? 'bg-cyan-100 text-cyan-700 border border-cyan-200' : 'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${row.isActive ? 'bg-cyan-500' : 'bg-red-500'}`}></span>
                    {row.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                  </span>
                </div>
                <div className="flex justify-center items-center">
                  <button
                    onClick={() => setConfirmToggle(row)}
                    className={`p-1 rounded-full transition-colors ${row.isActive ? 'text-sage-500 hover:text-sage-600' : 'text-slate-300 hover:text-slate-400'}`}
                    title={row.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                  >
                    {row.isActive ? <ToggleRight size={36} strokeWidth={1.5} /> : <ToggleLeft size={36} strokeWidth={1.5} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-end">
                <button onClick={() => setDetailRow(row)} className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-white rounded-b-2xl">
          <div className="text-sm text-slate-500">
            Hiển thị <span className="font-bold text-slate-800">1-5</span> trong <span className="font-bold text-slate-800">24</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 border border-slate-200 rounded-lg text-slate-400 disabled:opacity-50" disabled>
              <ChevronLeft size={18} />
            </button>
            <button className="w-8 h-8 rounded-lg text-sm font-bold bg-sage-600 text-white shadow-sm">1</button>
            <button className="w-8 h-8 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100">2</button>
            <button className="w-8 h-8 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100">3</button>
            <button className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
              <h3 className="text-xl font-bold text-slate-800">Thêm tài khoản mới</h3>
              <button onClick={() => { setShowAddModal(false); setFormErrors({}); setAddForm({}); }} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              {/* Suggestion alert - 1a */}
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="text-sm text-blue-800">
                  <span className="font-bold">Đề xuất tạo tài khoản:</span> Hệ thống phát hiện có <strong>{unregisteredPartners.length} hồ sơ đối tác mới</strong> (từ Form Đăng ký) chưa được cấp tài khoản.
                </div>
                <button 
                  onClick={handleExtractData} 
                  disabled={unregisteredPartners.length === 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm whitespace-nowrap flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Xem và trích xuất dữ liệu
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tên đăng nhập <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={addForm.username || ''}
                    onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-sage-500 outline-none transition-all ${formErrors.username ? 'border-red-300' : 'border-slate-200'}`}
                    placeholder="vd: partner_001"
                  />
                  {formErrors.username && <div className="text-xs text-red-500 mt-1">{formErrors.username}</div>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={addForm.email || ''}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-sage-500 outline-none transition-all ${formErrors.email ? 'border-red-300' : 'border-slate-200'}`}
                    placeholder="name@example.com"
                  />
                  {formErrors.email && <div className="text-xs text-red-500 mt-1">{formErrors.email}</div>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Họ và tên</label>
                  <input
                    type="text"
                    value={addForm.fullName || ''}
                    onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 outline-none transition-all"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Số điện thoại</label>
                  <input
                    type="tel"
                    value={addForm.phone || ''}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 outline-none transition-all"
                    placeholder="+84 90 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Mật khẩu tạm <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={addForm.password || ''}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-sage-500 outline-none transition-all ${formErrors.password ? 'border-red-300' : 'border-slate-200'}`}
                    placeholder="Nhập mật khẩu tạm"
                  />
                  {formErrors.password && <div className="text-xs text-red-500 mt-1">{formErrors.password}</div>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Vai trò <span className="text-red-500">*</span></label>
                  <select
                    value={addForm.role || ''}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-sage-500 outline-none transition-all appearance-none ${formErrors.role ? 'border-red-300' : 'border-slate-200'}`}
                  >
                    <option value="">Chọn vai trò</option>
                    <option value="ADMIN">Quản trị viên</option>
                    <option value="FARMER">Nông trại</option>
                    <option value="STORE">Cửa hàng</option>
                    <option value="TRANSPORTER">Vận chuyển</option>
                  </select>
                  {formErrors.role && <div className="text-xs text-red-500 mt-1">{formErrors.role}</div>}
                </div>

                <div className="col-span-1 md:col-span-2 mt-2">
                  <label className="flex items-start gap-4 cursor-pointer bg-slate-50 hover:bg-slate-100 p-4 rounded-xl border border-slate-200 transition-colors">
                    <div className="relative flex items-center justify-center w-5 h-5 mt-0.5">
                      <input type="checkbox" defaultChecked className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded flex-shrink-0 checked:bg-sage-600 checked:border-sage-600 transition-colors" />
                      <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">Gửi email thông báo tạo tài khoản thành công</div>
                      <div className="text-sm text-slate-500 mt-1">Hệ thống sẽ gửi email tự động tới người dùng kèm tên đăng nhập, mật khẩu tạm và hướng dẫn bắt buộc đổi mật khẩu ở lần đăng nhập đầu tiên.</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
              <button
                onClick={() => { setShowAddModal(false); setFormErrors({}); setAddForm({}); }}
                className="px-6 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-colors shadow-sm"
              >
                Hủy bỏ
              </button>
              <button
                onClick={submitAdd}
                disabled={isSubmitting}
                className="px-6 py-3 text-sm font-bold text-white bg-sage-600 hover:bg-sage-700 disabled:opacity-70 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Đang xử lý...
                  </>
                ) : (
                  'Lưu & Tạo tài khoản'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Select Partner Modal */}
      {showPartnerModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
              <h3 className="text-xl font-bold text-slate-800">Chọn đối tác để cấp tài khoản</h3>
              <button onClick={() => setShowPartnerModal(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
              {fetchingPartners ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <div className="w-8 h-8 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin mb-4"></div>
                  <div>Đang tải danh sách đối tác...</div>
                </div>
              ) : unregisteredPartners.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Building2 size={48} className="text-slate-300 mb-4" />
                  <div>Không có đối tác nào đang chờ cấp tài khoản.</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {unregisteredPartners.map(p => (
                    <div key={p.partnerId} onClick={() => selectPartner(p)} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-sage-500 hover:shadow-md cursor-pointer transition-all group">
                      <div>
                        <div className="font-bold text-slate-800 group-hover:text-sage-700 transition-colors">{p.partnerName}</div>
                        <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                          <span>Người liên hệ: <span className="font-medium text-slate-700">{p.contactPerson || 'N/A'}</span></span>
                          <span className="text-slate-300">•</span>
                          <span>MST: <span className="font-medium text-slate-700">{p.taxCode || 'N/A'}</span></span>
                        </div>
                        <div className="text-xs text-sage-600 font-bold mt-2.5 px-2.5 py-1 bg-sage-100 rounded-md inline-block uppercase tracking-wider">
                          {p.partnerType === 'FARM' ? 'Nông trại' : p.partnerType === 'STORE' ? 'Cửa hàng' : p.partnerType === 'TRANSPORT_COMPANY' ? 'Vận chuyển' : p.partnerType}
                        </div>
                      </div>
                      <div className="text-slate-300 group-hover:text-sage-600 transition-colors bg-slate-50 group-hover:bg-sage-100 p-2 rounded-full">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detail Profile Drawer/Modal */}
      {detailRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Thông tin chi tiết</h3>
              <button onClick={() => setDetailRow(null)} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 shadow-sm">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-sage-100 flex items-center justify-center text-sage-600 font-bold text-xl shadow-inner border border-sage-200">
                  {detailRow.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800">{detailRow.name}</h4>
                  <div className="text-sm font-medium text-slate-500 mt-1">{detailRow.role} • {detailRow.isActive ? 'Đang hoạt động' : 'Đã khóa'}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400">Liên hệ</h5>
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Tên đăng nhập</div>
                      <div className="text-sm font-semibold text-slate-800">{displayValue(detailRow.username)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Email</div>
                      <div className="text-sm font-semibold text-slate-800">{displayValue(detailRow.email)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Số điện thoại</div>
                      <div className="text-sm font-semibold text-slate-800">{displayValue(detailRow.phone)}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400">Tài khoản</h5>
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Mã tài khoản</div>
                      <div className="text-sm font-semibold text-slate-800">{detailRow.id}<br /><span className="text-xs text-slate-500 font-normal">{displayValue(detailRow.rawRole)}</span></div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Trạng thái</div>
                      <div className="text-sm font-semibold text-slate-800">{detailRow.isActive ? 'Đang hoạt động' : 'Đã khóa'}</div>
                      <div className="text-xs text-slate-400 mt-0.5">Cập nhật: {detailRow.updatedAtDisplay}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400">Đối tác liên kết</h5>
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Tên đối tác</div>
                      <div className="text-sm font-semibold text-slate-800">{displayValue(detailRow.partnerName)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Loại đối tác</div>
                      <div className="text-sm font-semibold text-slate-800">{displayValue(detailRow.partnerTypeLabel)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Mã số thuế</div>
                      <div className="text-sm font-semibold text-slate-800">{displayValue(detailRow.taxCode)}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400">Hoạt động</h5>
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Ngày tạo tài khoản</div>
                      <div className="text-sm font-semibold text-slate-800">{detailRow.createdAtDisplay}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Cập nhật gần nhất</div>
                      <div className="text-sm font-semibold text-slate-800">{detailRow.updatedAtDisplay}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button 
                onClick={() => {
                  setEditForm({ ...detailRow });
                  setShowEditModal(true);
                }}
                className="px-6 py-2.5 text-sm font-bold text-white bg-sage-600 hover:bg-sage-700 rounded-xl transition-colors shadow-sm"
              >
                Chỉnh sửa hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
              <h3 className="text-xl font-bold text-slate-800">Cập nhật tài khoản</h3>
              <button onClick={() => { setShowEditModal(false); setFormErrors({}); }} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Họ và tên <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={editForm.name || ''} 
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    placeholder="Nhập họ và tên..." 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-sage-500/50 focus:border-sage-500 outline-none transition-all" 
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    value={editForm.email || ''} 
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    placeholder="Nhập địa chỉ email hợp lệ..." 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-sage-500/50 focus:border-sage-500 outline-none transition-all" 
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Số điện thoại <span className="text-red-500">*</span></label>
                  <input 
                    type="tel" 
                    value={editForm.phone || ''} 
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    placeholder="Nhập số điện thoại..." 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-sage-500/50 focus:border-sage-500 outline-none transition-all" 
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Vai trò <span className="text-red-500">*</span></label>
                  <select 
                    value={editForm.role || ''} 
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-sage-500/50 focus:border-sage-500 outline-none transition-all cursor-pointer appearance-none"
                  >
                    <option value="">-- Chọn vai trò --</option>
                    <option value="Quản trị viên">Quản trị viên</option>
                    <option value="Quản lý kho">Quản lý kho</option>
                    <option value="Điều phối viên">Điều phối viên</option>
                    <option value="Nhân viên">Nhân viên</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
              <button
                onClick={() => { setShowEditModal(false); setFormErrors({}); }}
                className="px-6 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-colors shadow-sm"
              >
                Hủy bỏ
              </button>
              <button
                onClick={submitEdit}
                disabled={isSubmitting}
                className="px-6 py-3 text-sm font-bold text-white bg-sage-600 hover:bg-sage-700 disabled:opacity-70 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Đang lưu...
                  </>
                ) : (
                  'Lưu thay đổi'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Confirmation Modal */}
      {confirmToggle && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">
                Xác nhận {confirmToggle.isActive ? 'Khóa' : 'Mở khóa'} tài khoản
              </h3>
              <button onClick={() => setConfirmToggle(null)} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 shadow-sm">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-2">
                Bạn có chắc chắn muốn {confirmToggle.isActive ? 'khóa' : 'mở khóa'} tài khoản <strong className="text-slate-800">{confirmToggle.name}</strong> ({confirmToggle.email}) không?
              </p>
              {confirmToggle.isActive && (
                <p className="text-xs text-red-500 mt-2 font-medium bg-red-50 p-2 rounded-lg border border-red-100">
                  Lưu ý: Tài khoản bị khóa sẽ không thể truy cập vào hệ thống.
                </p>
              )}
            </div>
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setConfirmToggle(null)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors shadow-sm">
                Hủy bỏ
              </button>
              <button
                onClick={() => handleToggle(confirmToggle.id)}
                className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-colors shadow-sm ${confirmToggle.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-sage-600 hover:bg-sage-700'
                  }`}
              >
                Xác nhận {confirmToggle.isActive ? 'Khóa' : 'Mở khóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
