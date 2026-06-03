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
import { continueTransport, createTransportCheckpoint, getTransporterTransports, TransporterTransport, updateTransportCheckpoint } from '../../api';
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
  const latestUpdatedCheckpoint = checkpoints.filter((item) => item.updated).at(-1) ?? null;
  const lockedCheckpoint = selectedTransport?.status === 'Đã đến kho' ? latestUpdatedCheckpoint : null;
  const waitingStoreConfirmation = Boolean(
    selectedTransport
    && lockedCheckpoint
    && (
      lockedCheckpoint.statusAtCheckpoint === 'Đã đến nơi'
      || lockedCheckpoint.locationName === selectedTransport.destinationName
    )
  );
  const activeCheckpoint = lockedCheckpoint ?? currentCheckpoint;
  const previousCheckpoint = lockedCheckpoint
    ? checkpoints.filter((item) => item.updated && item.id !== lockedCheckpoint.id).at(-1)
    : currentIndex > 0 ? checkpoints[currentIndex - 1] : latestUpdatedCheckpoint;
  const nextSequence = checkpoints.reduce((max, checkpoint) => Math.max(max, checkpoint.sequence), 0) + 1;
  const editableSequence = activeCheckpoint?.sequence ?? nextSequence;
  const canEditCheckpoint = Boolean(selectedTransport && selectedTransport.status !== 'Đã giao' && selectedTransport.status !== 'Đã đến kho');
  const canContinueTransport = Boolean(selectedTransport && selectedTransport.status === 'Đã đến kho' && !waitingStoreConfirmation);
  const locationPlaceholder = activeCheckpoint?.locationName && !activeCheckpoint.updated
    ? activeCheckpoint.locationName
    : editableSequence === 1 ? 'Điểm nhận hàng' : 'Nhập vị trí hoặc tọa độ GPS';
  const [locationName, setLocationName] = useState('');
  const [temperature, setTemperature] = useState('');
  const [condition, setCondition] = useState(conditionOptions[0]);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!selectedTransportId && transports.length) {
      setSelectedTransportId(firstActiveTransport(transports)?.id ?? transports[0].id);
    }
  }, [selectedTransportId, transports]);

  useEffect(() => {
    if (!activeCheckpoint) {
      setLocationName('');
      setTemperature('');
      setCondition(conditionOptions[0]);
      setNote('');
      return;
    }

    setLocationName(activeCheckpoint.updated ? activeCheckpoint.locationName : '');
    setTemperature(activeCheckpoint.temperature === null ? '' : String(activeCheckpoint.temperature));
    setCondition(activeCheckpoint.updated ? activeCheckpoint.statusAtCheckpoint : conditionOptions[0]);
    setNote(activeCheckpoint.note);
    setMessage('');
  }, [activeCheckpoint?.id, activeCheckpoint?.updated, lockedCheckpoint?.id, selectedTransport?.id]);

  async function handleSave() {
    if (!selectedTransport || !canEditCheckpoint || !condition.trim()) return;

    const parsedTemperature = temperature.trim() ? Number(temperature.replace(',', '.')) : null;
    setSaving(true);
    setMessage('');

    try {
      const baseLocationName = locationName.trim() || activeCheckpoint?.locationName || checkpointCode(nextSequence);
      const payload = {
        locationName: baseLocationName,
        temperature: Number.isFinite(parsedTemperature) ? parsedTemperature : null,
        statusAtCheckpoint: condition.trim(),
        note: note.trim(),
        arrivedWarehouse: true
      };
      const updatedCheckpoint = activeCheckpoint
        ? await updateTransportCheckpoint(selectedTransport.id, activeCheckpoint.id, payload)
        : await createTransportCheckpoint(selectedTransport.id, nextSequence, {
            ...payload,
            locationName: baseLocationName
          });

      setTransports((items) => items.map((transport) => {
        if (transport.id !== selectedTransport.id) return transport;
        const checkpointExists = transport.checkpoints.some((checkpoint) => checkpoint.id === updatedCheckpoint.id);
        return {
          ...transport,
          status: 'Đã đến kho',
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

  async function handleDeliverTransport() {
    if (!selectedTransport || selectedTransport.status === 'Đã giao') return;

    const parsedTemperature = temperature.trim() ? Number(temperature.replace(',', '.')) : null;
    setSaving(true);
    setMessage('');

    try {
      const updatedCheckpoint = await createTransportCheckpoint(selectedTransport.id, nextSequence, {
        locationName: selectedTransport.destinationName,
        temperature: Number.isFinite(parsedTemperature) ? parsedTemperature : null,
        statusAtCheckpoint: 'Đã đến nơi',
        note: note.trim() || condition.trim(),
        arrivedWarehouse: true
      });
      setTransports((items) => items.map((transport) => {
        if (transport.id !== selectedTransport.id) return transport;
        return {
          ...transport,
          status: 'Đã đến kho',
          checkpoints: [...transport.checkpoints, updatedCheckpoint].sort((left, right) => left.sequence - right.sequence)
        };
      }));
      setMessage('Đơn đã đến cửa hàng và đang chờ cửa hàng xác nhận.');
    } catch {
      setMessage('Không thể cập nhật đã đến nơi. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  }

  async function handleContinueTransport() {
    if (!selectedTransport || !canContinueTransport) return;

    setSaving(true);
    setMessage('');

    try {
      const continued = await continueTransport(selectedTransport.id);
      setTransports((items) => items.map((transport) => (
        transport.id === continued.id ? continued : transport
      )));
      setMessage('Chuyến vận chuyển đã tiếp tục.');
    } catch {
      setMessage('Không thể tiếp tục vận chuyển. Vui lòng thử lại.');
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
                  const isCurrent = checkpoint.id === activeCheckpoint?.id;
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

        {canContinueTransport && (
          <button className="primary-btn flex w-full items-center justify-center gap-2 disabled:opacity-60" type="button" onClick={handleContinueTransport} disabled={saving}>
            <Truck size={18} />
            {saving ? 'Đang xử lý...' : 'Tiếp tục di chuyển'}
          </button>
        )}

        <section className="rounded-2xl bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-muted">Checkpoint hiện tại</p>
              <h3 className="text-lg font-extrabold text-ink">{activeCheckpoint || canEditCheckpoint ? checkpointCode(editableSequence) : 'Đã hoàn tất'}</h3>
            </div>
            <Badge tone={waitingStoreConfirmation ? 'amber' : canContinueTransport ? 'green' : canEditCheckpoint ? 'amber' : 'green'}>{waitingStoreConfirmation ? 'Chờ cửa hàng xác nhận' : canContinueTransport ? 'Đã đến kho' : canEditCheckpoint ? 'Chờ cập nhật' : 'Hoàn tất'}</Badge>
          </div>

          {canEditCheckpoint && (
            <button
              className="outline-btn mb-3 flex w-full items-center justify-center gap-2 border-emerald-200 text-leaf disabled:opacity-60"
              type="button"
              onClick={handleDeliverTransport}
              disabled={saving}
            >
              <MapPin size={18} />
              {saving ? 'Đang cập nhật...' : 'Đã đến cửa hàng'}
            </button>
          )}

          <label className="form-label">Vị trí hiện tại</label>
          <div className="field mb-3">
            <MapPin size={18} />
            <input value={locationName} onChange={(event) => setLocationName(event.target.value)} placeholder={locationPlaceholder} disabled={!canEditCheckpoint || saving} />
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

          <label className="form-label">Ghi chú checkpoint</label>
          <textarea className="input min-h-24 resize-none py-3" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ghi nhận tình trạng thực tế tại trạm kiểm soát..." disabled={!canEditCheckpoint || saving} />

          {message && <p className="mt-3 text-sm font-semibold text-muted">{message}</p>}
          {canEditCheckpoint && !canContinueTransport && (
            <button className="primary-btn mt-4 w-full disabled:opacity-60" type="button" onClick={handleSave} disabled={!canEditCheckpoint || saving}>
              {saving ? 'Đang lưu...' : 'Lưu cập nhật checkpoint'}
            </button>
          )}
        </section>
      </div>
      <BottomNav />
    </div>
  );
}
