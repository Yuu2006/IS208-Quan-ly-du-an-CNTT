import axios from 'axios';
import { Batch, BatchStatus, Certificate, CertificateStatus, SupplyChainTransport } from './data';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const AUTH_STORAGE_KEY = 'bluefood.auth.user';

api.interceptors.request.use((config) => {
  try {
    const rawUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
    const user = rawUser ? JSON.parse(rawUser) as { id?: string } : null;

    if (user?.id) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>)['x-account-id'] = user.id;
    }
  } catch {
    // Continue without auth header when local storage is unavailable or malformed.
  }

  return config;
});

type BackendQrCode = {
  qrId: number;
  qrImagePath?: string | null;
  status?: string | null;
};

type BackendPartner = {
  partnerId?: number;
  partnerName?: string | null;
  address?: string | null;
  contactPerson?: string | null;
};

type BackendAccount = {
  accountId: number;
  fullName: string;
  email?: string | null;
  phone?: string | null;
};

type BackendCertificate = {
  certificateId: number;
  certType: string;
  issuedBy: string;
  issuedDate: string;
  expiryDate: string;
  filePath?: string | null;
  status?: string | null;
};

type BackendBatchCert = {
  certificate: BackendCertificate;
};

type BackendBatch = {
  batchId: number;
  batchCode: string;
  productName: string;
  productType?: string | null;
  quantity: string | number;
  unit?: string | null;
  harvestDate?: string | null;
  packagedDate?: string | null;
  expiryDate?: string | null;
  status?: string | null;
  farmingMethods?: string | null;
  farmPartner?: BackendPartner | null;
  certificates?: BackendBatchCert[];
  qrCode?: BackendQrCode | null;
  transport?: BackendTransport | null;
};

type BackendCheckpoint = {
  checkpointId: number;
  transportId?: number | null;
  sequence: number;
  locationName?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  temperature?: string | number | null;
  statusAtCheckpoint?: string | null;
  note?: string | null;
  reportedAt?: string | null;
};

type BackendTransportIncident = {
  incidentId: number;
  incidentType?: string | null;
  quantityAffected?: string | number | null;
};

type BackendTransport = {
  transportId: number;
  transportStatus?: string | null;
  driverName?: string | null;
  licensePlate?: string | null;
  actualDeparture?: string | null;
  actualArrival?: string | null;
  createdAt?: string | null;
  batch?: BackendBatch | null;
  shipperPartner?: BackendPartner | null;
  receiverPartner?: BackendPartner | null;
  checkpoints?: BackendCheckpoint[];
  incidents?: BackendTransportIncident[];
};

type BackendIncident = {
  incidentId: number;
  incidentType: string;
  description?: string | null;
  quantityAffected?: string | number | null;
  photoPath?: string | null;
  createdAt?: string | null;
  batch?: BackendBatch | null;
  transport?: {
    transportStatus?: string | null;
    shipperPartner?: BackendPartner | null;
    receiverPartner?: BackendPartner | null;
  } | null;
};

type BackendPublicTrace = {
  batch: BackendBatch;
  origin?: BackendPartner | null;
  certificates?: BackendCertificate[];
  transport?: BackendTransport | null;
  qr?: {
    traceToken?: string | null;
    status?: string | null;
  };
};

export type StoreDeliveryStatus = 'Pending' | 'Arrived' | 'Issue';

export type StoreDelivery = {
  id: string;
  batchId: string;
  product: string;
  supplier: string;
  eta: string;
  status: StoreDeliveryStatus;
};

export type StoreIssue = {
  id: string;
  code: string;
  batchId: string;
  product: string;
  supplier: string;
  issueType: string;
  affectedQuantity: string;
  reportedAt: string;
  status: string;
  description: string;
  imageUrl: string;
};

export type TransportCheckpointPayload = {
  locationName?: string;
  latitude?: number | null;
  longitude?: number | null;
  temperature?: number | null;
  statusAtCheckpoint: string;
  note?: string;
  arrivedWarehouse?: boolean;
};

export type TransportCheckpointRecord = {
  id: string;
  transportId: string;
  sequence: number;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  temperature: number | null;
  statusAtCheckpoint: string;
  note: string;
  reportedAt: string;
  updated: boolean;
};

export type TransporterTransport = {
  id: string;
  batchCode: string;
  product: string;
  route: string;
  destinationName: string;
  status: string;
  driverName: string;
  licensePlate: string;
  checkpoints: TransportCheckpointRecord[];
};

export type DeliveryStaff = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
};

export type DestinationStore = {
  id: string;
  name: string;
  address: string;
  contactPerson: string;
};

export type AssignTransportPayload = {
  driverAccountId: string;
  receiverPartnerId: string;
};

const statusMap: Record<string, BatchStatus> = {
  CREATED: 'ready',
  AT_WAREHOUSE: 'at_warehouse',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  INCIDENT_REPORTED: 'incident_reported',
  CANCELLED: 'cancelled'
};

function formatDate(value?: string | null) {
  if (!value) return 'Chưa cập nhật';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN').format(date);
}

function formatDateTime(value?: string | null) {
  if (!value) return 'Chưa cập nhật';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function mapCertificateStatus(status?: string | null, expiryDate?: string): CertificateStatus {
  if (status === 'EXPIRED' || status === 'REVOKED') return 'expired';
  const expiry = expiryDate ? new Date(expiryDate) : null;
  if (expiry && !Number.isNaN(expiry.getTime())) {
    const daysLeft = (expiry.getTime() - Date.now()) / 86_400_000;
    if (daysLeft < 0) return 'expired';
    if (daysLeft <= 90) return 'expiring';
  }
  return 'valid';
}

function mapCertificate(item: BackendBatchCert): Certificate {
  const cert = item.certificate;
  const isOtherType = cert.certType === 'OTHER';
  return {
    id: String(cert.certificateId),
    name: isOtherType ? cert.issuedBy : cert.certType,
    issuer: cert.issuedBy,
    issuedDate: formatDate(cert.issuedDate),
    expiryDate: formatDate(cert.expiryDate),
    status: mapCertificateStatus(cert.status, cert.expiryDate),
    note: cert.filePath ?? ''
  };
}

export function mapBatch(item: BackendBatch): Batch {
  const quantity = Number(item.quantity);
  const unit = item.unit ?? 'kg';

  return {
    id: String(item.batchId),
    batchCode: item.batchCode,
    productName: item.productName,
    productType: item.productType ?? 'Chưa phân loại',
    quantity: Number.isFinite(quantity) ? quantity : 0,
    harvestDate: formatDate(item.harvestDate),
    expiryDate: formatDate(item.expiryDate),
    status: statusMap[item.status ?? ''] ?? 'ready',
    location: item.farmPartner?.address ?? item.farmPartner?.partnerName ?? 'Chưa cập nhật',
    certifications: item.certificates?.map(mapCertificate) ?? [],
    hasQR: item.qrCode?.status === 'ACTIVE',
    qrCodePath: item.qrCode?.qrImagePath ?? undefined,
    notes: [item.farmingMethods, Number.isFinite(quantity) ? `${quantity} ${unit}` : undefined].filter(Boolean).join(' · ')
  };
}

function formatProduct(batch?: BackendBatch | null) {
  if (!batch) return 'Chưa cập nhật';
  const quantity = Number(batch.quantity);
  const unit = batch.unit ?? 'kg';
  return Number.isFinite(quantity)
    ? `${batch.productName} - ${quantity} ${unit}`
    : batch.productName;
}

function mapDeliveryStatus(item: BackendTransport): StoreDeliveryStatus {
  if (item.transportStatus === 'DELIVERED') return 'Arrived';
  if (item.incidents?.some((incident) => incident.incidentType !== 'OTHER' || Number(incident.quantityAffected) > 0)) return 'Issue';
  return 'Pending';
}

function mapStoreDelivery(item: BackendTransport): StoreDelivery {
  const lastCheckpoint = item.checkpoints?.at(-1);
  return {
    id: String(item.transportId),
    batchId: item.batch?.batchCode ?? `TR-${item.transportId}`,
    product: formatProduct(item.batch),
    supplier: item.batch?.farmPartner?.partnerName ?? item.shipperPartner?.partnerName ?? 'Chưa cập nhật',
    eta: item.actualArrival ? `Đã đến ${formatDateTime(item.actualArrival)}` : `Cập nhật ${formatDateTime(lastCheckpoint?.reportedAt ?? item.createdAt)}`,
    status: mapDeliveryStatus(item)
  };
}

const incidentLabels: Record<string, string> = {
  DAMAGED: 'Bao bì hư hỏng',
  MISSING: 'Sai số lượng',
  QUALITY_ISSUE: 'Không đạt chất lượng',
  OTHER: 'Khác'
};

function mapStoreIssue(item: BackendIncident): StoreIssue {
  const affectedQuantity = Number(item.quantityAffected);
  return {
    id: String(item.incidentId),
    code: `DL-${String(item.incidentId).padStart(4, '0')}`,
    batchId: item.batch?.batchCode ?? 'Chưa cập nhật',
    product: formatProduct(item.batch),
    supplier: item.batch?.farmPartner?.partnerName ?? item.transport?.shipperPartner?.partnerName ?? 'Chưa cập nhật',
    issueType: incidentLabels[item.incidentType] ?? item.incidentType,
    affectedQuantity: Number.isFinite(affectedQuantity) ? `${affectedQuantity} ${item.batch?.unit ?? 'kg'}` : 'Chưa cập nhật',
    reportedAt: formatDateTime(item.createdAt),
    status: 'Cần xử lý',
    description: item.description ?? 'Chưa có mô tả chi tiết.',
    imageUrl: item.photoPath ?? ''
  };
}

const transportStatusLabels: Record<string, string> = {
  PENDING_PICKUP: 'Chờ nhận hàng',
  IN_TRANSIT: 'Đang vận chuyển',
  ARRIVED_WAREHOUSE: 'Đã đến kho',
  DELIVERED: 'Đã giao',
  INCIDENT_REPORTED: 'Có sự cố'
};

function numberOrNull(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapCheckpoint(item: BackendCheckpoint): TransportCheckpointRecord {
  const status = item.statusAtCheckpoint?.trim() ?? '';

  return {
    id: String(item.checkpointId),
    transportId: String(item.transportId ?? ''),
    sequence: item.sequence,
    locationName: item.locationName ?? `CP-${String(item.sequence).padStart(2, '0')}`,
    latitude: numberOrNull(item.latitude),
    longitude: numberOrNull(item.longitude),
    temperature: numberOrNull(item.temperature),
    statusAtCheckpoint: status || 'Chưa cập nhật',
    note: item.note ?? '',
    reportedAt: formatDateTime(item.reportedAt),
    updated: Boolean(status)
  };
}

function mapTransporterTransport(item: BackendTransport): TransporterTransport {
  const shipper = item.shipperPartner?.partnerName ?? 'Chưa cập nhật';
  const receiver = item.receiverPartner?.partnerName ?? 'Chưa cập nhật';

  return {
    id: String(item.transportId),
    batchCode: item.batch?.batchCode ?? `TR-${item.transportId}`,
    product: formatProduct(item.batch),
    route: `${shipper} → ${receiver}`,
    destinationName: receiver,
    status: transportStatusLabels[item.transportStatus ?? ''] ?? item.transportStatus ?? 'Chưa cập nhật',
    driverName: item.driverName ?? 'Chưa cập nhật',
    licensePlate: item.licensePlate ?? 'Chưa cập nhật',
    checkpoints: item.checkpoints?.map(mapCheckpoint) ?? []
  };
}

function mapSupplyChainTransport(item: BackendTransport): SupplyChainTransport {
  const receiver = item.receiverPartner?.partnerName ?? 'Cửa hàng';

  return {
    id: String(item.transportId),
    status: transportStatusLabels[item.transportStatus ?? ''] ?? item.transportStatus ?? 'Chưa cập nhật',
    actualDeparture: formatDateTime(item.actualDeparture),
    actualArrival: formatDateTime(item.actualArrival),
    destinationName: receiver,
    checkpoints: item.checkpoints?.map(mapCheckpoint) ?? []
  };
}

function mapDeliveryStaff(item: BackendAccount): DeliveryStaff {
  return {
    id: String(item.accountId),
    fullName: item.fullName,
    email: item.email ?? '',
    phone: item.phone ?? ''
  };
}

function mapDestinationStore(item: BackendPartner): DestinationStore {
  return {
    id: String(item.partnerId ?? ''),
    name: item.partnerName ?? 'Cửa hàng chưa đặt tên',
    address: item.address ?? 'Chưa cập nhật địa chỉ',
    contactPerson: item.contactPerson ?? ''
  };
}

function normalizePersonName(value: string) {
  return value.trim().toLocaleLowerCase('vi-VN');
}

function certificatePayload(cert: Omit<Certificate, 'id'> | Certificate) {
  return {
    name: cert.name,
    issuer: cert.issuer,
    issuedDate: cert.issuedDate,
    expiryDate: cert.expiryDate,
    status: cert.status,
    filePath: cert.note
  };
}

export async function getBatches() {
  const { data } = await api.get<BackendBatch[]>('/batches');
  return data.map(mapBatch);
}

export async function getBatchByCode(batchCode: string) {
  const { data } = await api.get<BackendBatch>(`/batches/${encodeURIComponent(batchCode)}`);
  return mapBatch(data);
}

export async function getPublicTraceBatch(traceToken: string) {
  const { data } = await api.get<BackendPublicTrace>(`/trace/${encodeURIComponent(traceToken)}`);

  const batch = mapBatch({
    ...data.batch,
    farmPartner: data.origin,
    certificates: data.certificates?.map((certificate) => ({ certificate })) ?? [],
    qrCode: {
      qrId: 0,
      qrImagePath: data.qr?.traceToken ? `/trace/${data.qr.traceToken}` : null,
      status: data.qr?.status ?? 'ACTIVE'
    }
  });

  return {
    ...batch,
    transport: data.transport ? mapSupplyChainTransport(data.transport) : undefined
  };
}

export async function createBatchRecord(batch: Batch) {
  const { data } = await api.post<BackendBatch>('/batches', {
    batchCode: batch.batchCode,
    productName: batch.productName,
    productType: batch.productType,
    quantity: batch.quantity,
    harvestDate: batch.harvestDate,
    expiryDate: batch.expiryDate,
    status: batch.status,
    location: batch.location,
    notes: batch.notes
  });

  return mapBatch(data);
}

export async function updateBatchRecord(currentBatchCode: string, batch: Batch) {
  const { data } = await api.put<BackendBatch>(`/batches/${encodeURIComponent(currentBatchCode)}`, {
    batchCode: batch.batchCode,
    productName: batch.productName,
    productType: batch.productType,
    quantity: batch.quantity,
    harvestDate: batch.harvestDate,
    expiryDate: batch.expiryDate,
    status: batch.status,
    location: batch.location,
    notes: batch.notes
  });

  return mapBatch(data);
}

export async function cancelBatchRecord(batchCode: string) {
  const { data } = await api.delete<BackendBatch>(`/batches/${encodeURIComponent(batchCode)}`);
  return mapBatch(data);
}

export async function createCertificateForBatch(batchCode: string, cert: Omit<Certificate, 'id'>) {
  await api.post(`/batches/${encodeURIComponent(batchCode)}/certificates`, certificatePayload(cert));
  return getBatchByCode(batchCode);
}

export async function updateCertificateForBatch(batchCode: string, cert: Certificate) {
  await api.put(`/certificates/${encodeURIComponent(cert.id)}`, certificatePayload(cert));
  return getBatchByCode(batchCode);
}

export async function deleteCertificateFromBatch(batchCode: string, certificateId: string) {
  await api.delete(`/batches/${encodeURIComponent(batchCode)}/certificates/${encodeURIComponent(certificateId)}`);
  return getBatchByCode(batchCode);
}

export async function getDeliveryStaff() {
  const { data } = await api.get<BackendAccount[]>('/transporters');
  return data.map(mapDeliveryStaff);
}

export async function getDestinationStores() {
  const { data } = await api.get<BackendPartner[]>('/stores');
  return data.map(mapDestinationStore).filter((store) => store.id);
}

export async function assignBatchTransport(batchCode: string, payload: AssignTransportPayload) {
  const { data } = await api.post<BackendTransport>(`/batches/${encodeURIComponent(batchCode)}/assign-transport`, payload);

  if (!data.batch) throw new Error('Assigned transport did not include batch data');
  return mapBatch(data.batch);
}

export async function continueTransport(transportId: string) {
  const { data } = await api.post<BackendTransport>(`/transports/${encodeURIComponent(transportId)}/continue`);
  return mapTransporterTransport(data);
}

export async function getStoreDeliveries(status?: 'pending' | 'delivered') {
  const { data } = await api.get<BackendTransport[]>('/store/deliveries', {
    params: status ? { status } : undefined
  });
  const filtered = status === 'pending'
    ? data.filter((item) => item.transportStatus === 'ARRIVED_WAREHOUSE' && !item.incidents?.length)
    : status === 'delivered'
      ? data.filter((item) => item.transportStatus === 'DELIVERED')
      : data;

  return filtered.map(mapStoreDelivery);
}

export async function getTransporterTransports(driverName?: string) {
  const { data } = await api.get<BackendTransport[]>('/transports');
  const mappedTransports = data.map(mapTransporterTransport);
  const normalizedDriverName = driverName ? normalizePersonName(driverName) : '';

  if (!normalizedDriverName) return mappedTransports;
  return mappedTransports.filter((transport) => normalizePersonName(transport.driverName) === normalizedDriverName);
}

export async function getTransportCheckpoints(transportId: string) {
  const { data } = await api.get<BackendCheckpoint[]>(`/transports/${encodeURIComponent(transportId)}/checkpoints`);
  return data.map(mapCheckpoint);
}

export async function updateTransportCheckpoint(transportId: string, checkpointId: string, payload: TransportCheckpointPayload) {
  const { data } = await api.put<BackendCheckpoint>(
    `/transports/${encodeURIComponent(transportId)}/checkpoints/${encodeURIComponent(checkpointId)}`,
    payload
  );

  return mapCheckpoint(data);
}

export async function createTransportCheckpoint(transportId: string, sequence: number, payload: TransportCheckpointPayload) {
  const { data } = await api.post<BackendCheckpoint>(
    `/transports/${encodeURIComponent(transportId)}/checkpoints`,
    { sequence, ...payload }
  );

  return mapCheckpoint(data);
}

export async function confirmStoreDelivery(batchCode: string, accountId?: string) {
  const { data } = await api.post<BackendTransport>(`/store/deliveries/${encodeURIComponent(batchCode)}/confirm`, {
    accountId
  });

  return mapStoreDelivery(data);
}

export async function getStoreIssues() {
  const { data } = await api.get<BackendIncident[]>('/store/issues');
  return data
    .filter((item) => item.transport?.transportStatus !== 'DELIVERED')
    .map(mapStoreIssue);
}

export type StoreIssuePayload = {
  accountId?: string;
  incidentType: 'DAMAGED' | 'MISSING' | 'QUALITY_ISSUE' | 'OTHER';
  description: string;
  quantityAffected?: number;
  photoPath?: string;
};

export async function reportStoreIssue(batchCode: string, payload: StoreIssuePayload) {
  const { data } = await api.post<BackendIncident>(`/store/deliveries/${encodeURIComponent(batchCode)}/issues`, payload);
  return mapStoreIssue(data);
}
