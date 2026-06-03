import { type FormEvent, useState } from 'react';
import { AlertCircle, Eye, EyeOff, Lock, LogIn, User } from 'lucide-react';
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
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_80%_10%,#e4f7ff_0,#fff_38%,#f7fbff_100%)] px-5 py-10 text-slate-800">
      <section className="w-full max-w-md">
        <div className="mb-7 text-center">
          <div className="mb-4 flex justify-center">
            <BlueFoodLogo />
          </div>
          <h1 className="text-2xl font-extrabold tracking-[0] text-slate-900">BLUEFOOD</h1>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-sky-600">Phân quyền truy xuất chuỗi cung ứng</p>
        </div>

        <form onSubmit={handleAdminLogin} className="rounded-2xl border border-sky-100 bg-white/85 p-6 shadow-[0_18px_48px_rgba(15,23,42,.12)] backdrop-blur">
          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-slate-900">Đăng nhập quản trị</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Truy cập dashboard vận hành BlueFood.</p>
          </div>

          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Tên đăng nhập hoặc email</label>
          <div className="mb-4 flex min-h-12 items-center gap-3 rounded-xl border border-sky-100 bg-white px-4 text-slate-500 shadow-sm focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100">
            <User size={18} />
            <input
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              className="w-full border-0 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
              placeholder="admin@bluefood.vn"
              autoComplete="username"
            />
          </div>

          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Mật khẩu</label>
          <div className="mb-4 flex min-h-12 items-center gap-3 rounded-xl border border-sky-100 bg-white px-4 text-slate-500 shadow-sm focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100">
            <Lock size={18} />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border-0 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
              placeholder="Nhập mật khẩu"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
            />
            <button type="button" className="text-slate-400 transition-colors hover:text-slate-700" onClick={() => setShowPassword((value) => !value)} aria-label="Ẩn hiện mật khẩu">
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">
              <AlertCircle className="mt-0.5 shrink-0" size={16} />
              <span>{error}</span>
            </div>
          )}

          <button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(14,165,233,.26)] transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70" disabled={loading}>
            <LogIn size={18} />
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </section>
    </main>
  );
}
