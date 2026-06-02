import { useState } from 'react';
import { Search, Plus, UserCog, ToggleLeft, ToggleRight, MoreVertical, X, ChevronLeft, ChevronRight, ShieldCheck, Building2 } from 'lucide-react';
import { SearchBar } from '../../components/common/SearchBar';

export function AccountsScreen({ data }: { data: any }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [detailRow, setDetailRow] = useState<any>(null);
  const [confirmToggle, setConfirmToggle] = useState<any>(null);
  const [formErrors, setFormErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle state mock
  const [rows, setRows] = useState(data.rows.map((r: any) => ({ ...r, isActive: !r.locked })));

  const handleToggle = (id: string) => {
    setRows(rows.map((r: any) => r.id === id ? { ...r, isActive: !r.isActive } : r));
    setConfirmToggle(null);
  };

  const mockSubmit = () => {
    setIsSubmitting(true);
    setFormErrors({});

    // Simulate API call & Validation (UC04 - 3a, 3b, 5)
    setTimeout(() => {
      setIsSubmitting(false);
      // Giả lập lỗi để trình diễn luồng lỗi
      setFormErrors({
        username: 'Tên đăng nhập đã tồn tại trong hệ thống.',
        email: 'Email không đúng định dạng. Vui lòng kiểm tra lại tên miền.',
        password: 'Mật khẩu chưa đủ mạnh (cần chữ hoa, số và ký tự đặc biệt).',
        role: 'Vui lòng chọn vai trò cho tài khoản.'
      });

      // Nếu không có lỗi thì sẽ show alert thành công
      // alert('Tạo tài khoản thành công!');
      // setShowAddModal(false);
    }, 800);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
        <div className="flex-1 min-w-[250px]">
          <SearchBar placeholder="Tìm tài khoản, email..." />
        </div>

        <div className="hidden lg:block w-px h-8 bg-slate-200 mx-1"></div>

        <div className="relative min-w-[150px]">
          <ShieldCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-100 font-medium text-slate-600">
            <option>Tất cả vai trò</option>
            <option>Quản trị viên</option>
            <option>Quản lý kho</option>
            <option>Điều phối viên</option>
          </select>
        </div>

        <div className="relative min-w-[150px]">
          <ToggleRight size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-100 font-medium text-slate-600">
            <option>Tất cả trạng thái</option>
            <option>Đang hoạt động</option>
            <option>Đã khóa</option>
          </select>
        </div>

        <div className="relative min-w-[150px]">
          <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-100 font-medium text-slate-600">
            <option>Tất cả đơn vị</option>
            <option>Trụ sở chính</option>
            <option>Kho Q1</option>
            <option>Kho Bình Dương</option>
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
          {rows.map((row: any) => (
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
              <button onClick={() => { setShowAddModal(false); setFormErrors({}); }} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              {/* Suggestion alert - 1a */}
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex justify-between items-center">
                <div className="text-sm text-blue-800">
                  <span className="font-bold">Đề xuất tạo tài khoản:</span> Hệ thống phát hiện có <strong>3 hồ sơ đối tác mới</strong> (từ Form Đăng ký) chưa được cấp tài khoản.
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm whitespace-nowrap">
                  Xem và trích xuất dữ liệu
                </button>
              </div>

              {Object.keys(formErrors).length > 0 && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium">
                  <span className="font-bold">Lưu ý:</span> Vui lòng kiểm tra lại các thông tin chưa hợp lệ.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tên đăng nhập <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Nhập tên đăng nhập duy nhất..." className={`w-full px-4 py-3 bg-slate-50 border ${formErrors.username ? 'border-red-300 focus:ring-red-500/50 focus:border-red-500' : 'border-slate-200 focus:ring-sage-500/50 focus:border-sage-500'} rounded-xl text-sm focus:bg-white focus:ring-2 outline-none transition-all`} />
                  {formErrors.username && <p className="text-red-500 text-xs font-medium mt-1.5">{formErrors.username}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Mật khẩu tạm <span className="text-red-500">*</span></label>
                  <input type="password" placeholder="Tối thiểu 8 ký tự, có chữ hoa, số..." className={`w-full px-4 py-3 bg-slate-50 border ${formErrors.password ? 'border-red-300 focus:ring-red-500/50 focus:border-red-500' : 'border-slate-200 focus:ring-sage-500/50 focus:border-sage-500'} rounded-xl text-sm focus:bg-white focus:ring-2 outline-none transition-all`} />
                  {formErrors.password && <p className="text-red-500 text-xs font-medium mt-1.5">{formErrors.password}</p>}
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Họ và tên <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Nhập họ và tên..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-sage-500/50 focus:border-sage-500 outline-none transition-all" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email <span className="text-red-500">*</span></label>
                  <input type="email" placeholder="Nhập địa chỉ email hợp lệ..." className={`w-full px-4 py-3 bg-slate-50 border ${formErrors.email ? 'border-red-300 focus:ring-red-500/50 focus:border-red-500' : 'border-slate-200 focus:ring-sage-500/50 focus:border-sage-500'} rounded-xl text-sm focus:bg-white focus:ring-2 outline-none transition-all`} />
                  {formErrors.email && <p className="text-red-500 text-xs font-medium mt-1.5">{formErrors.email}</p>}
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Số điện thoại <span className="text-red-500">*</span></label>
                  <input type="tel" placeholder="Nhập số điện thoại..." className={`w-full px-4 py-3 bg-slate-50 border ${formErrors.phone ? 'border-red-300 focus:ring-red-500/50 focus:border-red-500' : 'border-slate-200 focus:ring-sage-500/50 focus:border-sage-500'} rounded-xl text-sm focus:bg-white focus:ring-2 outline-none transition-all`} />
                  {formErrors.phone && <p className="text-red-500 text-xs font-medium mt-1.5">{formErrors.phone}</p>}
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Vai trò <span className="text-red-500">*</span></label>
                  <select className={`w-full px-4 py-3 bg-slate-50 border ${formErrors.role ? 'border-red-300 focus:ring-red-500/50 focus:border-red-500' : 'border-slate-200 focus:ring-sage-500/50 focus:border-sage-500'} rounded-xl text-sm focus:bg-white focus:ring-2 outline-none transition-all cursor-pointer appearance-none`}>
                    <option value="">-- Chọn vai trò --</option>
                    <option value="admin">Quản trị viên</option>
                    <option value="farm">Nông trại</option>
                    <option value="shipping">Vận chuyển</option>
                    <option value="store">Cửa hàng</option>
                    <option value="warehouse">Nhân viên kho</option>
                  </select>
                  {formErrors.role && <p className="text-red-500 text-xs font-medium mt-1.5">{formErrors.role}</p>}
                </div>

                <div className="col-span-1 md:col-span-2 pt-2 border-t border-slate-100">
                  <label className="block text-sm font-bold text-slate-700 mb-3">Trạng thái tài khoản ban đầu <span className="text-red-500">*</span></label>
                  <div className="flex gap-8">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center w-5 h-5">
                        <input type="radio" name="status" defaultChecked className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-full checked:border-sage-600 transition-colors" />
                        <div className="absolute w-2.5 h-2.5 bg-sage-600 rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                      </div>
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-sage-700 transition-colors">Hoạt động</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center w-5 h-5">
                        <input type="radio" name="status" className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-full checked:border-sage-600 transition-colors" />
                        <div className="absolute w-2.5 h-2.5 bg-sage-600 rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                      </div>
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-sage-700 transition-colors">Chờ kích hoạt</span>
                    </label>
                  </div>
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
                onClick={() => { setShowAddModal(false); setFormErrors({}); }}
                className="px-6 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-colors shadow-sm"
              >
                Hủy bỏ
              </button>
              <button
                onClick={mockSubmit}
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

      {/* Detail Profile Drawer/Modal */}
      {detailRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
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

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400">Liên hệ & Đơn vị</h5>
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Email</div>
                      <div className="text-sm font-semibold text-slate-800">{detailRow.email}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Số điện thoại</div>
                      <div className="text-sm font-semibold text-slate-800">+84 90 123 4567</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Bộ phận công tác</div>
                      <div className="text-sm font-semibold text-slate-800">Kho trung tâm miền Nam</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400">Hoạt động & Bảo mật</h5>
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Đăng nhập gần nhất</div>
                      <div className="text-sm font-semibold text-slate-800">14:32 - Hôm nay<br /><span className="text-xs text-slate-500 font-normal">IP: 112.197.xx.xx</span></div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Người tạo tài khoản</div>
                      <div className="text-sm font-semibold text-slate-800">Admin_Super (Trần Q.)</div>
                      <div className="text-xs text-slate-400 mt-0.5">Lúc 08:00 - 12/04/2026</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button className="px-6 py-2.5 text-sm font-bold text-white bg-sage-600 hover:bg-sage-700 rounded-xl transition-colors shadow-sm">
                Chỉnh sửa hồ sơ (UC05)
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
                  Lưu ý: Tài khoản bị khóa sẽ không thể truy cập vào hệ thống (UC07).
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
