import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  Camera,
  CalendarCheck,
  Car,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  ClipboardCheck,
  Clock3,
  Eye,
  EyeOff,
  FileCheck2,
  Flag,
  Home,
  Image,
  Layers,
  Leaf,
  LocateFixed,
  Lock,
  LogOut,
  MapPin,
  Pencil,
  PackageCheck,
  PackagePlus,
  Plus,
  QrCode,
  Save,
  ScanLine,
  Search,
  Settings,
  ShieldCheck,
  Store,
  Thermometer,
  Trash2,
  Truck,
  Upload,
  User,
  UserCircle,
  X
} from 'lucide-react';
import { UserRole, useAuth } from '../auth';
import { api, getBatchByCode } from '../api';
import { Batch, Certificate } from '../data';
import { AppHeader, Badge, Metric, ProfileRow, TimelineItem, certificateLabels, certificateTones, roleHome } from '../shared/ui';

export type BarcodeDetectorResult = {
  rawValue: string;
};

export type BarcodeDetectorInstance = {
  detect: (source: CanvasImageSource) => Promise<BarcodeDetectorResult[]>;
};

export type BarcodeDetectorConstructor = new (options: { formats: string[] }) => BarcodeDetectorInstance;

export function getBarcodeDetector() {
  return (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
}

export function getTraceIdFromQr(rawValue: string) {
  const text = rawValue.trim();
  const batchCode = text.match(/BF-\d{4}-\d{4}/i)?.[0];
  if (batchCode) return batchCode.toUpperCase();

  try {
    const url = new URL(text);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const id = url.searchParams.get('id') || pathParts[pathParts.length - 1];
    return normalizeTraceId(id || text);
  } catch {
    return normalizeTraceId(text);
  }
}

function normalizeTraceId(value: string) {
  return decodeURIComponent(value)
    .trim()
    .replace(/^\/?trace\//i, '')
    .replace(/^\/?uploads\/qrcodes\//i, '')
    .replace(/\.png$/i, '');
}

type QrImageSource = ImageBitmap | HTMLImageElement;

function getImageSourceSize(source: QrImageSource) {
  if ('naturalWidth' in source) {
    return { width: source.naturalWidth, height: source.naturalHeight };
  }

  return { width: source.width, height: source.height };
}

function drawSourceToCanvas(
  source: CanvasImageSource,
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  rotation = 0
) {
  const rotated = rotation === 90 || rotation === 270;
  canvas.width = rotated ? height : width;
  canvas.height = rotated ? width : height;

  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();

  if (rotation === 90) {
    context.translate(canvas.width, 0);
    context.rotate(Math.PI / 2);
  } else if (rotation === 180) {
    context.translate(canvas.width, canvas.height);
    context.rotate(Math.PI);
  } else if (rotation === 270) {
    context.translate(0, canvas.height);
    context.rotate((Math.PI * 3) / 2);
  }

  context.drawImage(source, 0, 0, width, height);
  context.restore();

  return context.getImageData(0, 0, canvas.width, canvas.height);
}

function scanQrFromSource(source: CanvasImageSource, canvas: HTMLCanvasElement | null, width: number, height: number) {
  if (!canvas || width <= 0 || height <= 0) return null;

  const maxScanSize = 1600;
  const scale = Math.min(1, maxScanSize / Math.max(width, height));
  const scaledWidth = Math.max(1, Math.round(width * scale));
  const scaledHeight = Math.max(1, Math.round(height * scale));

  for (const rotation of [0, 90, 180, 270]) {
    const imageData = drawSourceToCanvas(source, canvas, scaledWidth, scaledHeight, rotation);
    if (!imageData) continue;

    const result = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth'
    });

    if (result?.data) return result.data;
  }

  return null;
}

function scanQrFromVideo(video: HTMLVideoElement, canvas: HTMLCanvasElement | null) {
  return scanQrFromSource(video, canvas, video.videoWidth, video.videoHeight);
}

function scanQrFromImage(image: QrImageSource, canvas: HTMLCanvasElement | null) {
  const { width, height } = getImageSourceSize(image);
  return scanQrFromSource(image, canvas, width, height);
}

function loadImageFromFile(file: File): Promise<{ image: QrImageSource; cleanup: () => void }> {
  if ('createImageBitmap' in window) {
    return createImageBitmap(file)
      .then((image) => ({ image, cleanup: () => image.close() }))
      .catch(() => loadHtmlImageFromFile(file));
  }

  return loadHtmlImageFromFile(file);
}

function loadHtmlImageFromFile(file: File): Promise<{ image: HTMLImageElement; cleanup: () => void }> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => resolve({
      image,
      cleanup: () => URL.revokeObjectURL(objectUrl)
    });
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Unable to load image'));
    };
    image.src = objectUrl;
  });
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    api.defaults.headers.common['X-Client'] = 'frontend-web';
    let matchedRole: UserRole | null = null;
    for (const candidateRole of ['inspector', 'farm', 'store', 'transporter'] as UserRole[]) {
      const ok = await login(email, password, candidateRole);
      if (ok) {
        matchedRole = candidateRole;
        break;
      }
    }
    setLoading(false);
    if (matchedRole) navigate(roleHome[matchedRole], { replace: true });
    else setError('Vui lòng kiểm tra email hoặc mật khẩu.');
  }

  return (
    <div className="flex min-h-full flex-col bg-[radial-gradient(circle_at_80%_10%,#e4f7ff_0,#fff_38%,#f7fbff_100%)] px-6 py-10">
      <Link to="/" className="icon-btn absolute left-5 top-5" aria-label="Quay lại trang quét mã">
        <ChevronLeft size={22} />
      </Link>
      <div className="flex flex-1 flex-col justify-center">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-[22px] bg-gradient-to-br from-primary to-primaryDark text-white shadow-[0_16px_38px_rgba(14,165,233,.28)]">
            <Leaf size={34} fill="white" strokeWidth={1.6} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-[0] text-ink">DIGITAL TRAVEL ERP</h1>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Phân quyền truy xuất chuỗi cung ứng</p>
        </div>

        <form onSubmit={submit} className="rounded-2xl border border-sky-100 bg-white/82 p-5 shadow-card backdrop-blur">
          <div className="mb-5 text-center">
            <h2 className="text-base font-bold text-ink">Đăng nhập hệ thống</h2>
            <p className="mt-1 text-xs text-muted">Nhập thông tin đăng nhập để mở chức năng được cấp quyền.</p>
          </div>
          <label className="form-label">Email hoặc mã khách hàng</label>
          <div className="field">
            <User size={18} />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ví dụ: khachhang01" autoComplete="username" />
          </div>
          <label className="form-label">Mật khẩu</label>
          <div className="field">
            <Lock size={18} />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu..." type={show ? 'text' : 'password'} autoComplete="current-password" />
            <button type="button" className="text-muted" onClick={() => setShow((value) => !value)} aria-label="Ẩn hiện mật khẩu">
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <div className="mb-4 flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-muted">
              <input checked={remember} onChange={(e) => setRemember(e.target.checked)} type="checkbox" className="h-4 w-4 rounded border-line text-primary" />
              Ghi nhớ tài khoản
            </label>
            <button className="font-semibold text-slate-600" type="button">Quên mật khẩu?</button>
          </div>
          {error && <div className="mb-3 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600"><AlertCircle size={15} />{error}</div>}
          <button className="primary-btn w-full" disabled={loading}>{loading ? 'Đang xử lý...' : 'Đăng Nhập Ngay'}</button>
        </form>
      </div>
      <footer className="space-y-2 pb-2 text-center text-[11px] text-muted">
        <div className="flex justify-center gap-4"><span>Hỗ trợ</span><span>•</span><span>Bảo mật</span><span>•</span><span>Điều khoản</span></div>
        <p>© 2026 Digital Travel ERP · v2.4.0</p>
      </footer>
    </div>
  );
}

export function Landing() {
  const { user } = useAuth();
  if (user) return <Navigate to={roleHome[user.role]} replace />;

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <AppHeader title="BlueFood" subtitle="Mobile web truy xuất nguồn gốc" icon={<Leaf size={22} />} action={<Link to="/auth/login" className="icon-btn"><UserCircle size={22} /></Link>} />
      <div className="flex flex-1 items-start overflow-y-auto px-5 py-5">
        <section className="rounded-2xl bg-gradient-to-br from-green-50 via-sky-50 to-white p-5 text-center">
          <h2 className="text-3xl font-extrabold leading-tight text-leaf">Quét để hiểu thực phẩm của bạn</h2>
          <p className="mt-2 text-sm text-slate-600">Theo dõi từng nguyên liệu từ nông trại đến bàn ăn một cách minh bạch.</p>
          <div className="relative mx-auto my-6 grid h-40 w-40 place-items-center rounded-full border-2 border-green-100 bg-white shadow-card">
            <QrCode size={74} className="text-leaf" />
            <span className="absolute bottom-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-600 shadow-card">Verified</span>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-white/80 p-3 shadow-card">
            <Link to="/auth/login" className="primary-btn mb-3 flex w-full items-center justify-center gap-2">
              <UserCircle size={19} /> Đăng nhập
            </Link>
            <Link to="/scanner" className="outline-btn mb-3 flex w-full items-center justify-center gap-2"><ScanLine size={19} /> Quét mã QR</Link>
            <Link to="/trace/BF-2024-0891" className="outline-btn flex w-full items-center justify-center gap-2"><Image size={18} /> Tải ảnh QR</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export function Scanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const backTarget = user ? roleHome[user.role] : '/';
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasScannedRef = useRef(false);
  const [scannerMessage, setScannerMessage] = useState('Đang khởi động camera...');
  const [uploadMessage, setUploadMessage] = useState('');
  const [cameraUnavailable, setCameraUnavailable] = useState(false);
  const [cameraRetryKey, setCameraRetryKey] = useState(0);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrame = 0;
    let isMounted = true;

    async function startCamera() {
      setCameraUnavailable(false);
      hasScannedRef.current = false;

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraUnavailable(true);
        setScannerMessage(window.isSecureContext
          ? 'Trình duyệt này không hỗ trợ mở camera trực tiếp. Hãy chụp hoặc tải ảnh QR bên dưới.'
          : 'Camera trực tiếp cần HTTPS hoặc localhost. Hãy mở app bằng HTTPS hoặc chụp QR bằng nút bên dưới.'
        );
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        });

        if (!isMounted || !videoRef.current) return;
        setCameraUnavailable(false);
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScannerMessage('Đưa mã QR vào giữa khung để quét.');

        const BarcodeDetector = getBarcodeDetector();
        const detector = BarcodeDetector ? new BarcodeDetector({ formats: ['qr_code'] }) : null;
        const scanFrame = async () => {
          if (!isMounted || hasScannedRef.current) return;
          const video = videoRef.current;

          if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            let rawValue = '';
            if (detector) {
              try {
                const results = await detector.detect(video);
                rawValue = results[0]?.rawValue ?? '';
              } catch {
                rawValue = scanQrFromVideo(video, canvasRef.current) ?? '';
              }
            }

            if (!rawValue) {
              rawValue = scanQrFromVideo(video, canvasRef.current) ?? '';
            }

            if (rawValue) {
              hasScannedRef.current = true;
              setScannerMessage('Đã quét mã QR, đang mở kết quả...');
              navigate(`/trace/${encodeURIComponent(getTraceIdFromQr(rawValue))}`);
              return;
            }
          }

          animationFrame = window.requestAnimationFrame(scanFrame);
        };

        animationFrame = window.requestAnimationFrame(scanFrame);
      } catch {
        setCameraUnavailable(true);
        setScannerMessage('Không thể mở camera. Hãy cấp quyền camera trong trình duyệt hoặc chụp/tải ảnh QR bên dưới.');
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      window.cancelAnimationFrame(animationFrame);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [navigate, cameraRetryKey]);

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const BarcodeDetector = getBarcodeDetector();

    try {
      setUploadMessage(`Đang quét QR từ ảnh ${file.name}...`);
      const { image, cleanup } = await loadImageFromFile(file);
      let rawValue = '';

      if (BarcodeDetector) {
        try {
          const detector = new BarcodeDetector({ formats: ['qr_code'] });
          const results = await detector.detect(image);
          rawValue = results[0]?.rawValue ?? '';
        } catch {
          rawValue = scanQrFromImage(image, canvasRef.current) ?? '';
        }
      }

      if (!rawValue) {
        rawValue = scanQrFromImage(image, canvasRef.current) ?? '';
      }

      cleanup();

      if (!rawValue) {
        setUploadMessage('Không tìm thấy mã QR trong ảnh này.');
        return;
      }

      hasScannedRef.current = true;
      setUploadMessage('Đã tìm thấy mã QR, đang mở kết quả...');
      navigate(`/trace/${encodeURIComponent(getTraceIdFromQr(rawValue))}`);
    } catch {
      setUploadMessage('Không thể đọc ảnh này. Hãy thử ảnh QR rõ hơn.');
    } finally {
      event.target.value = '';
    }
  }

  return (
    <div className="relative flex min-h-full flex-col bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(14,165,233,.18),transparent_28%),linear-gradient(135deg,#111827,#020617)]" />
      <div className="relative z-10 flex items-center justify-between px-5 py-5">
        <Link to={backTarget} className="icon-btn bg-white/10 text-white"><ChevronLeft /></Link>
        <h1 className="font-bold">Quét mã QR</h1>
        <span className="h-10 w-10" />
      </div>
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8">
        <div className="scan-box overflow-hidden">
          <video ref={videoRef} className="h-full w-full object-cover" muted playsInline autoPlay />
          <canvas ref={canvasRef} className="hidden" />
          <ScanLine className="pointer-events-none absolute text-white/70" size={72} />
        </div>
        <p className="mt-8 text-center text-sm text-slate-300">{scannerMessage}</p>
        {cameraUnavailable && (
          <button type="button" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 text-sm font-extrabold text-white" onClick={() => setCameraRetryKey((value) => value + 1)}>
            <Camera size={18} />
            Bật camera
          </button>
        )}
      </div>
      <div className="relative z-10 rounded-t-3xl bg-white p-6 text-center text-ink">
        <QrCode className="mx-auto mb-2 text-primary" />
        <p className="mb-4 text-sm text-slate-600">Quét trực tiếp bằng camera hoặc chọn ảnh QR từ thiết bị.</p>
        <label className="primary-btn flex w-full cursor-pointer items-center justify-center gap-2">
          <Image size={18} /> Chụp hoặc chọn ảnh QR
          <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={handleImageUpload} />
        </label>
        {uploadMessage && <p className="mt-3 text-xs font-semibold text-muted">{uploadMessage}</p>}
      </div>
    </div>
  );
}

export function Trace() {
  const { id } = useParams();
  const traceId = id ? normalizeTraceId(id) : '';
  const [showCertificates, setShowCertificates] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [fetchedBatch, setFetchedBatch] = useState<Batch | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState(false);

  useEffect(() => {
    if (!traceId) return;

    let active = true;
    setBatchLoading(true);
    setBatchError(false);
    setFetchedBatch(null);
    setSelectedCertificate(null);

    getBatchByCode(traceId)
      .then((item) => {
        if (active) setFetchedBatch(item);
      })
      .catch(() => {
        if (active) setBatchError(true);
      })
      .finally(() => {
        if (active) setBatchLoading(false);
      });

    return () => {
      active = false;
    };
  }, [traceId]);

  if (batchLoading) {
    return (
      <div className="min-h-full bg-paper">
        <AppHeader title="Chuỗi cung ứng" subtitle="Đang tải dữ liệu" back />
        <div className="grid min-h-[70%] place-items-center px-8 text-center text-sm font-semibold text-muted">Đang tải thông tin lô hàng từ hệ thống...</div>
      </div>
    );
  }

  if (batchError || !fetchedBatch) {
    return (
      <div className="min-h-full bg-paper">
        <AppHeader title="Chuỗi cung ứng" subtitle={traceId ? `Lô #${traceId}` : 'Không có mã lô'} back />
        <div className="grid min-h-[70%] place-items-center px-8 text-center">
          <div>
            <AlertCircle className="mx-auto mb-4 text-amber-500" size={48} />
            <p className="font-extrabold text-ink">Không tìm thấy dữ liệu lô hàng</p>
            <p className="mt-2 text-sm text-muted">Mã QR này chưa có dữ liệu từ API hoặc backend chưa sẵn sàng.</p>
          </div>
        </div>
      </div>
    );
  }

  const batch = fetchedBatch;
  const validCertificateCount = batch.certifications.filter((cert) => cert.status === 'valid').length;
  const steps = [
    { title: 'Thu hoạch tại nông trại', completedAt: batch.harvestDate, done: true },
    { title: 'Sơ chế & đóng gói', completedAt: 'Theo dữ liệu nông trại', done: true },
    { title: 'Vận chuyển chuỗi lạnh', completedAt: 'Theo dữ liệu vận chuyển', done: batch.status === 'in_transit' || batch.status === 'delivered' },
    { title: 'Đến cửa hàng', completedAt: batch.status === 'delivered' ? 'Đã hoàn thành' : 'Chưa hoàn thành', done: batch.status === 'delivered' }
  ];

  return (
    <div className="min-h-full bg-paper">
      <AppHeader title="Chuỗi cung ứng" subtitle={`Lô #${batch.batchCode}`} back action={<button className="icon-btn"><QrCode size={20} /></button>} />
      <div className="space-y-5 overflow-y-auto px-5 py-5">
        <section className="rounded-2xl bg-gradient-to-br from-green-50 to-sky-50 p-5">
          <p className="text-xs font-semibold text-muted">{batch.productType}</p>
          <h2 className="mt-1 text-3xl font-extrabold text-leaf">{batch.productName}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {batch.certifications.slice(0, 2).map((cert) => <Badge key={cert.id} tone={certificateTones[cert.status]}>{cert.name}</Badge>)}
          </div>
        </section>
        <div className="grid grid-cols-3 gap-2">
          <Metric label="Xuất xứ" value={batch.location.split(',')[0]} icon={<MapPin />} />
          <Metric label="Chứng chỉ" value={`${validCertificateCount} hiệu lực`} icon={<ShieldCheck />} />
          <Metric label="Thu hoạch" value={batch.harvestDate} icon={<Leaf />} />
        </div>
        <section className="rounded-2xl bg-white p-5 shadow-card">
          <h3 className="mb-4 font-bold text-ink">Hành trình chuỗi cung ứng</h3>
          {steps.map((step, index) => <TimelineItem key={step.title} title={step.title} completedAt={step.completedAt} done={step.done} last={index === steps.length - 1} />)}
        </section>
        <button type="button" className="outline-btn flex w-full items-center justify-center gap-2" onClick={() => setShowCertificates(true)}>
          <FileCheck2 size={18} />
          Xem chứng chỉ
        </button>
      </div>
      {showCertificates && (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-950/40 p-4">
          <section className="max-h-[82vh] w-full overflow-y-auto rounded-2xl bg-white p-5 shadow-card">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-ink">{selectedCertificate ? 'Chi tiết chứng chỉ' : 'Chứng chỉ'}</h3>
                <p className="mt-1 text-xs font-semibold text-muted">{selectedCertificate?.name ?? batch.batchCode}</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedCertificate && (
                  <button type="button" className="icon-btn h-9 w-9" onClick={() => setSelectedCertificate(null)} aria-label="Quay lại danh sách chứng chỉ"><ChevronLeft size={18} /></button>
                )}
                <button type="button" className="icon-btn h-9 w-9" onClick={() => { setSelectedCertificate(null); setShowCertificates(false); }} aria-label="Đóng chứng chỉ"><X size={18} /></button>
              </div>
            </div>

            {selectedCertificate ? (
              <div className="rounded-xl border border-sky-100 bg-white p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-extrabold text-ink">{selectedCertificate.name}</p>
                    <p className="mt-1 text-xs font-semibold text-muted">{selectedCertificate.issuer}</p>
                  </div>
                  <Badge tone={certificateTones[selectedCertificate.status]}>{certificateLabels[selectedCertificate.status]}</Badge>
                </div>
                <ProfileRow label="Ngày cấp" value={selectedCertificate.issuedDate} />
                <ProfileRow label="Hết hạn" value={selectedCertificate.expiryDate} />
                <ProfileRow label="Trạng thái" value={certificateLabels[selectedCertificate.status]} />
                <ProfileRow label="Ghi chú" value={selectedCertificate.note || 'Không có ghi chú'} last />
              </div>
            ) : (
              <div className="space-y-3">
                {batch.certifications.map((cert) => (
                  <div key={cert.id} className="rounded-xl border border-sky-100 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-extrabold text-ink">{cert.name}</p>
                        <p className="mt-1 text-xs font-semibold text-muted">{cert.issuer}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge tone={certificateTones[cert.status]}>{certificateLabels[cert.status]}</Badge>
                        <button type="button" className="grid h-9 w-9 place-items-center rounded-full border border-sky-100 bg-sky-50 text-primary" onClick={() => setSelectedCertificate(cert)} aria-label={`Xem chi tiết ${cert.name}`}>
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-slate-500">Cấp: {cert.issuedDate} · Hết hạn: {cert.expiryDate}</p>
                    {cert.note && <p className="mt-3 text-sm text-slate-700">{cert.note}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
