import { type FormEvent, useState } from 'react';
import { AlertCircle, Eye, EyeOff, Lock, LogIn, User, ShieldCheck, Leaf } from 'lucide-react';
import { BlueFoodLogo } from '../components/common/BlueFoodLogo';
import { useAuth, type AdminLoginError } from '../auth';

const errorMessages: Record<AdminLoginError, string> = {
  empty: 'Vui lòng nhập tên đăng nhập/email và mật khẩu.',
  invalid: 'Sai tài khoản hoặc mật khẩu.',
  locked: 'Tài khoản bị khóa hoặc đã bị vô hiệu hóa.',
  forbidden: 'Tài khoản không có quyền Admin.',
  server: 'Không thể kết nối server. Vui lòng thử lại sau.'
};

/** Component trang đăng nhập riêng cho khu vực quản trị BlueFood. */
export function AdminLoginPage() {
  const { loginAdmin } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /** Hàm xử lý đăng nhập Admin và phân loại lỗi nghiệp vụ. */
  async function handleAdminLogin(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginAdmin(identifier, password);

    setLoading(false);
    if (!result.ok) setError(errorMessages[result.reason]);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f2f9f3] relative overflow-hidden">
      {/* Premium Clean Background Elements with stronger green tint */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#dcecdf_0%,#f2f9f3_100%)]"></div>
      
      {/* Decorative glowing orbs with higher green saturation */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[1000px] h-[800px] bg-[#3e7448]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[800px] h-[800px] bg-[#2e6b36]/15 rounded-full blur-3xl pointer-events-none"></div>

      <section className="w-full max-w-lg relative z-10 px-4">
        <div className="mb-8 text-center scale-110">
          <div className="mb-2 flex justify-center drop-shadow-sm">
            <BlueFoodLogo />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#1e4424]">BLUEFOOD</h1>
        </div>

        <form onSubmit={handleAdminLogin} className="rounded-[2rem] border border-[#c4dec9]/60 bg-white/75 p-10 sm:p-12 shadow-[0_20px_60px_-15px_rgba(46,107,54,0.18)] backdrop-blur-xl">
          <div className="mb-8 flex items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e3efe6] text-[#2f6637] shadow-sm">
              <ShieldCheck size={28} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1e4424]">Đăng nhập hệ thống</h2>
              <p className="mt-1.5 text-base font-medium text-[#467d4e]">Bảo mật bởi <span className="font-bold text-[#2f6637]">BlueFood</span></p>
            </div>
          </div>

          <div className="relative mb-8 flex items-center justify-center">
            <div className="w-full border-t-2 border-[#cce3d1]"></div>
            <div className="absolute bg-white/80 px-4 text-[#7fb088] backdrop-blur-sm rounded-full">
              <Leaf size={18} />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-[#467d4e]">Tên đăng nhập / Email</label>
              <div className="flex min-h-[56px] items-center gap-3 rounded-2xl border border-[#cce3d1] bg-white/80 px-5 text-[#467d4e] shadow-sm transition-all focus-within:border-[#3c8747] focus-within:ring-4 focus-within:ring-[#3c8747]/15 hover:border-[#3c8747]/50">
                <User size={20} strokeWidth={2.5} />
                <input
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  className="w-full border-0 bg-transparent text-base font-semibold text-[#1e4424] outline-none placeholder:text-[#8bba94]"
                  placeholder="admin@bluefood.vn"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-[#467d4e]">Mật khẩu</label>
              <div className="flex min-h-[56px] items-center gap-3 rounded-2xl border border-[#cce3d1] bg-white/80 px-5 text-[#467d4e] shadow-sm transition-all focus-within:border-[#3c8747] focus-within:ring-4 focus-within:ring-[#3c8747]/15 hover:border-[#3c8747]/50">
                <Lock size={20} strokeWidth={2.5} />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full border-0 bg-transparent text-base font-semibold text-[#1e4424] outline-none placeholder:text-[#8bba94]"
                  placeholder="Nhập mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                />
                <button type="button" className="text-[#8bba94] transition-colors hover:text-[#2f6637]" onClick={() => setShowPassword((value) => !value)} aria-label="Ẩn hiện mật khẩu">
                  {showPassword ? <EyeOff size={20} strokeWidth={2.5} /> : <Eye size={20} strokeWidth={2.5} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-2.5 rounded-2xl bg-red-50/80 p-4 text-base font-semibold text-red-600 border border-red-100">
              <AlertCircle className="mt-0.5 shrink-0" size={18} />
              <span>{error}</span>
            </div>
          )}

          <button className="mt-8 inline-flex min-h-[60px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#33723c] px-6 text-base font-bold tracking-wide text-white shadow-[0_8px_24px_rgba(51,114,60,0.3)] transition-all hover:bg-[#27592e] hover:shadow-[0_12px_28px_rgba(51,114,60,0.4)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70" disabled={loading}>
            <LogIn size={20} strokeWidth={2.5} />
            {loading ? 'Đang xác thực...' : 'Đăng nhập vào hệ thống'}
          </button>
        </form>
      </section>
    </main>
  );
}
