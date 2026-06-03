import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  CircleDot,
  LocateFixed,
  MapPin,
  PackageCheck,
  Thermometer,
  Truck,
  UserCircle
} from 'lucide-react';
import { createTransportCheckpoint, getTransporterTransports, TransporterTransport, updateTransportCheckpoint } from '../../api';
import { useAuth } from '../../auth';
import { BottomNav, AppHeader, Badge, Metric } from '../../shared/ui';

const conditionOptions = ['Ổn định', 'Cần theo dõi', 'Không đạt điều kiện vận chuyển'];

function statusTone(status: string): 'green' | 'amber' | 'red' {
  if (status.includes('Đã giao')) return 'green';
  if (status.includes('Không đạt')) return 'red';
  return 'amber';
}

function temperatureLabel(value: number | null) {
  return value === null ? 'Chưa cập nhật' : `${value}°C`;
}

function checkpointCode(sequence: number) {
  return `CP-${String(sequence).padStart(2, '0')}`;
}

function firstActiveTransport(transports: TransporterTransport[]) {
  return transports.find((item) => item.status !== 'Đã giao') ?? transports[0] ?? null;
}

function useTransporterData(driverName?: string) {
  const [transports, setTransports] = useState<TransporterTransport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getTransporterTransports(driverName)
      .then((items) => {
        if (!active) return;
        setTransports(items);
        setError('');
      })
      .catch(() => {
        if (!active) return;
        setError('Không tải được dữ liệu vận chuyển.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [driverName]);

  return { transports, setTransports, loading, error };
}

export function DriverDashboard() {
  const { user } = useAuth();
  const { transports, loading, error } = useTransporterData(user?.fullName);
  const currentTransport = firstActiveTransport(transports);
  const checkpoints = currentTransport?.checkpoints ?? [];
  const currentIndex = checkpoints.findIndex((item) => !item.updated);
  const currentCheckpoint = currentIndex >= 0 ? checkpoints[currentIndex] : null;
  const previousCheckpoint = currentIndex > 0 ? checkpoints[currentIndex - 1] : checkpoints.filter((item) => item.updated).at(-1);
  const recentHistory = checkpoints.filter((item) => item.updated).slice(-3).reverse();

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <AppHeader title="Vận chuyển" subtitle={user?.fullName ?? 'Transporter'} icon={<Truck />} action={<Link to="/settings" className="icon-btn"><UserCircle size={20} /></Link>} />
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <section className="rounded-2xl bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="min-w-0 truncate font-extrabold text-ink">{currentTransport?.batchCode ?? 'Chưa có chuyến'}</h2>
            <Badge tone={statusTone(currentTransport?.status ?? '')}>{currentTransport?.status ?? 'Chưa cập nhật'}</Badge>
          </div>
          <p className="text-sm text-muted">{currentTransport?.route ?? 'Không có dữ liệu vận chuyển đang hoạt động.'}</p>
          <div className="mt-5 grid grid-cols-4 gap-1 text-center text-[11px] text-muted">
            {['Đã nhận', 'Đang đi', 'Gần điểm đến', 'Đã giao'].map((step, index) => {
              const done = index < checkpoints.filter((item) => item.updated).length;
              return (
                <div key={step}>
                  <div className={`mx-auto mb-1 grid h-7 w-7 place-items-center rounded-full ${done ? 'bg-leaf text-white' : 'bg-slate-100'}`}>
                    {done ? <Check size={14} /> : <CircleDot size={14} />}
                  </div>
                  {step}
                </div>
              );
            })}
          </div>
        </section>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}
        {loading && <p className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-muted shadow-card">Đang tải dữ liệu...</p>}

        <div className="grid grid-cols-3 gap-2">
          <Metric label="Checkpoint hiện tại" value={currentCheckpoint ? checkpointCode(currentCheckpoint.sequence) : 'Hoàn tất'} icon={<MapPin />} centered />
          <Metric label="Nhiệt độ trước đó" value={temperatureLabel(previousCheckpoint?.temperature ?? null)} icon={<Thermometer />} centered />
          <Metric label="Tình trạng trước đó" value={previousCheckpoint?.statusAtCheckpoint ?? 'Chưa cập nhật'} icon={<PackageCheck />} centered />
        </div>

        <Link to="/transporter/checkpoint" className="outline-btn flex w-full items-center justify-center gap-2"><MapPin size={18} /> Cập nhật checkpoint</Link>

        <section className="rounded-2xl bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-ink">Nhật ký checkpoint</h3>
            <Link to="/transporter/checkpoint" className="text-xs font-bold text-primary">Cập nhật</Link>
          </div>
          {recentHistory.length ? recentHistory.map((item) => (
            <p key={item.id} className="border-b border-line py-3 text-sm text-slate-600 last:border-0">
              {item.reportedAt} - {checkpointCode(item.sequence)} {item.locationName}, {temperatureLabel(item.temperature)}, {item.statusAtCheckpoint}
            </p>
          )) : (
            <p className="py-3 text-sm text-muted">Chưa có checkpoint nào được cập nhật.</p>
          )}
        </section>
      </div>
      <BottomNav />
    </div>
  );
}

export function TransportCheckpointUpdate() {
  const { user } = useAuth();
  const { transports, setTransports, loading, error } = useTransporterData(user?.fullName);
  const [selectedTransportId, setSelectedTransportId] = useState('');
  const selectedTransport = useMemo(
    () => transports.find((item) => item.id === selectedTransportId) ?? firstActiveTransport(transports),
    [selectedTransportId, transports]
  );
  const checkpoints = selectedTransport?.checkpoints ?? [];
  const currentIndex = checkpoints.findIndex((item) => !item.updated);
  const currentCheckpoint = currentIndex >= 0 ? checkpoints[currentIndex] : null;
  const previousCheckpoint = currentIndex > 0 ? checkpoints[currentIndex - 1] : checkpoints.filter((item) => item.updated).at(-1);
  const nextSequence = checkpoints.reduce((max, checkpoint) => Math.max(max, checkpoint.sequence), 0) + 1;
  const editableSequence = currentCheckpoint?.sequence ?? nextSequence;
  const canEditCheckpoint = Boolean(selectedTransport && selectedTransport.status !== 'Đã giao' && selectedTransport.status !== 'Đã đến kho');
  const [locationName, setLocationName] = useState('');
  const [temperature, setTemperature] = useState('');
  const [condition, setCondition] = useState(conditionOptions[0]);
  const [arrivedWarehouse, setArrivedWarehouse] = useState(false);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!selectedTransportId && transports.length) {
      setSelectedTransportId(firstActiveTransport(transports)?.id ?? transports[0].id);
    }
  }, [selectedTransportId, transports]);

  useEffect(() => {
    if (!currentCheckpoint) {
      setLocationName(selectedTransport && canEditCheckpoint ? checkpointCode(nextSequence) : '');
      setTemperature('');
      setCondition(conditionOptions[0]);
      setArrivedWarehouse(false);
      setNote('');
      return;
    }

    setLocationName(currentCheckpoint.locationName);
    setTemperature(currentCheckpoint.temperature === null ? '' : String(currentCheckpoint.temperature));
    setCondition(currentCheckpoint.updated ? currentCheckpoint.statusAtCheckpoint : conditionOptions[0]);
    setArrivedWarehouse(false);
    setNote(currentCheckpoint.note);
    setMessage('');
  }, [canEditCheckpoint, currentCheckpoint?.id, nextSequence, selectedTransport?.id]);

  async function handleSave() {
    if (!selectedTransport || !canEditCheckpoint || !condition.trim()) return;

    const parsedTemperature = temperature.trim() ? Number(temperature.replace(',', '.')) : null;
    setSaving(true);
    setMessage('');

    try {
      const baseLocationName = locationName.trim() || currentCheckpoint?.locationName || checkpointCode(nextSequence);
      const payload = {
        locationName: baseLocationName,
        temperature: Number.isFinite(parsedTemperature) ? parsedTemperature : null,
        statusAtCheckpoint: condition.trim(),
        note: note.trim(),
        arrivedWarehouse
      };
      const updatedCheckpoint = currentCheckpoint
        ? await updateTransportCheckpoint(selectedTransport.id, currentCheckpoint.id, payload)
        : await createTransportCheckpoint(selectedTransport.id, nextSequence, {
            ...payload,
            locationName: baseLocationName
          });

      setTransports((items) => items.map((transport) => {
        if (transport.id !== selectedTransport.id) return transport;
        const checkpointExists = transport.checkpoints.some((checkpoint) => checkpoint.id === updatedCheckpoint.id);
        return {
          ...transport,
          status: arrivedWarehouse ? 'Đã đến kho' : transport.status,
          checkpoints: checkpointExists
            ? transport.checkpoints.map((checkpoint) => (
                checkpoint.id === updatedCheckpoint.id ? updatedCheckpoint : checkpoint
              ))
            : [...transport.checkpoints, updatedCheckpoint].sort((left, right) => left.sequence - right.sequence)
        };
      }));
      setMessage(`${checkpointCode(updatedCheckpoint.sequence)} đã được cập nhật.`);
    } catch {
      setMessage('Không lưu được checkpoint. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <AppHeader title="Cập nhật checkpoint" subtitle="Vị trí, nhiệt độ và tình trạng lô hàng" icon={<MapPin size={22} />} />
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <section className="rounded-2xl bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-extrabold text-ink">{selectedTransport?.batchCode ?? 'Chưa có chuyến'}</p>
              <p className="truncate text-xs text-muted">{selectedTransport?.route ?? 'Không có dữ liệu vận chuyển.'}</p>
            </div>
            <Badge tone={statusTone(selectedTransport?.status ?? '')}>{selectedTransport?.status ?? 'Chưa cập nhật'}</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Metric label="Checkpoint trước" value={previousCheckpoint ? checkpointCode(previousCheckpoint.sequence) : 'Chưa có'} icon={<MapPin />} />
            <Metric label="Nhiệt độ trước" value={temperatureLabel(previousCheckpoint?.temperature ?? null)} icon={<Thermometer />} />
            <Metric label="Tình trạng trước" value={previousCheckpoint?.statusAtCheckpoint ?? 'Chưa cập nhật'} icon={<PackageCheck />} />
          </div>
        </section>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}
        {loading && <p className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-muted shadow-card">Đang tải dữ liệu...</p>}

        <section className="rounded-2xl bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-bold text-ink">Bảng transport checkpoint</h3>
            <span className="text-xs font-bold text-muted">{checkpoints.length} dòng</span>
          </div>

          <label className="form-label">Chuyến vận chuyển</label>
          <select className="input mb-4" value={selectedTransport?.id ?? ''} onChange={(event) => setSelectedTransportId(event.target.value)}>
            {transports.map((transport) => (
              <option key={transport.id} value={transport.id}>{transport.batchCode} - {transport.status}</option>
            ))}
          </select>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-separate border-spacing-0 text-left text-xs">
              <thead className="text-[11px] uppercase text-muted">
                <tr>
                  <th className="border-b border-line px-2 py-2">CP</th>
                  <th className="border-b border-line px-2 py-2">Vị trí</th>
                  <th className="border-b border-line px-2 py-2">Nhiệt độ</th>
                  <th className="border-b border-line px-2 py-2">Tình trạng</th>
                  <th className="border-b border-line px-2 py-2">Cập nhật</th>
                </tr>
              </thead>
              <tbody>
                {checkpoints.map((checkpoint) => {
                  const isCurrent = checkpoint.id === currentCheckpoint?.id;
                  return (
                    <tr key={checkpoint.id} className={isCurrent ? 'bg-green-50' : ''}>
                      <td className="border-b border-line px-2 py-3 font-extrabold text-ink">{checkpointCode(checkpoint.sequence)}</td>
                      <td className="border-b border-line px-2 py-3 text-slate-600">{checkpoint.locationName}</td>
                      <td className="border-b border-line px-2 py-3 text-slate-600">{temperatureLabel(checkpoint.temperature)}</td>
                      <td className={`border-b border-line px-2 py-3 font-bold ${checkpoint.updated ? 'text-leaf' : 'text-muted'}`}>{checkpoint.statusAtCheckpoint}</td>
                      <td className="border-b border-line px-2 py-3 text-slate-600">{checkpoint.updated ? checkpoint.reportedAt : 'Chưa cập nhật'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!checkpoints.length && <p className="py-3 text-sm text-muted">Chưa có dòng checkpoint trong bảng.</p>}
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-muted">Checkpoint hiện tại</p>
              <h3 className="text-lg font-extrabold text-ink">{canEditCheckpoint ? checkpointCode(editableSequence) : 'Đã hoàn tất'}</h3>
            </div>
            <Badge tone={canEditCheckpoint ? 'amber' : 'green'}>{canEditCheckpoint ? 'Chờ cập nhật' : 'Hoàn tất'}</Badge>
          </div>

          <label className="form-label">Vị trí hiện tại</label>
          <div className="field mb-3">
            <MapPin size={18} />
            <input value={locationName} onChange={(event) => setLocationName(event.target.value)} placeholder="Nhập vị trí hoặc tọa độ GPS" disabled={!canEditCheckpoint || saving} />
            <button type="button" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-green-50 text-primary disabled:opacity-50" aria-label="Tự cập nhật GPS" disabled={!canEditCheckpoint || saving}>
              <LocateFixed size={17} />
            </button>
          </div>

          <label className="form-label">Nhiệt độ khoang hàng</label>
          <input className="input mb-3" type="number" step="0.1" value={temperature} onChange={(event) => setTemperature(event.target.value)} placeholder="Ví dụ: 4.5" disabled={!canEditCheckpoint || saving} />

          <label className="form-label">Tình trạng checkpoint hiện tại</label>
          <select className="input mb-3" value={condition} onChange={(event) => setCondition(event.target.value)} disabled={!canEditCheckpoint || saving}>
            {conditionOptions.map((option) => <option key={option}>{option}</option>)}
          </select>

          <label className="mb-3 flex min-h-12 items-center gap-3 rounded-xl border border-line bg-slate-50 px-3 text-sm font-bold text-ink">
            <input
              type="checkbox"
              className="h-4 w-4 accent-green-500"
              checked={arrivedWarehouse}
              onChange={(event) => setArrivedWarehouse(event.target.checked)}
              disabled={!canEditCheckpoint || saving}
            />
            Đã đến cửa hàng/kho nhận
          </label>

          <label className="form-label">Ghi chú checkpoint</label>
          <textarea className="input min-h-24 resize-none py-3" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ghi nhận tình trạng thực tế tại trạm kiểm soát..." disabled={!canEditCheckpoint || saving} />

          {message && <p className="mt-3 text-sm font-semibold text-muted">{message}</p>}
          <button className="primary-btn mt-4 w-full disabled:opacity-60" type="button" onClick={handleSave} disabled={!canEditCheckpoint || saving}>
            {saving ? 'Đang lưu...' : 'Lưu cập nhật checkpoint'}
          </button>
        </section>
      </div>
      <BottomNav />
    </div>
  );
}
