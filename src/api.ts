import axios from 'axios';
import { Batch, BatchStatus, Certificate, CertificateStatus } from './data';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json'
  }
});

type BackendQrCode = {
  qrId: number;
  qrImagePath?: string | null;
  status?: string | null;
};

type BackendPartner = {
  partnerName?: string | null;
  address?: string | null;
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
};

type BackendCheckpoint = {
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
    shipperPartner?: BackendPartner | null;
    receiverPartner?: BackendPartner | null;
  } | null;
};

export type StoreDeliveryStatus = 'Arrived' | 'Arriving' | 'Issue';

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

const statusMap: Record<string, BatchStatus> = {
  CREATED: 'draft',
  AT_WAREHOUSE: 'ready',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
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
  return {
    id: String(cert.certificateId),
    name: cert.certType,
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
    status: statusMap[item.status ?? ''] ?? 'draft',
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
  if (item.transportStatus === 'ARRIVED_WAREHOUSE' || item.transportStatus === 'DELIVERED') return 'Arrived';
  if (item.incidents?.some((incident) => incident.incidentType !== 'OTHER' || Number(incident.quantityAffected) > 0)) return 'Issue';
  return 'Arriving';
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
    imageUrl: item.photoPath ?? 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 640 360%22%3E%3Crect width=%22640%22 height=%22360%22 fill=%22%23fee2e2%22/%3E%3Cpath d=%22M170 139h300M170 183h230M170 227h270%22 stroke=%22%2394a3b8%22 stroke-width=%2216%22 stroke-linecap=%22round%22/%3E%3Ccircle cx=%22508%22 cy=%22276%22 r=%2230%22 fill=%22%23ef4444%22/%3E%3C/svg%3E'
  };
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

export async function getStoreDeliveries() {
  const { data } = await api.get<BackendTransport[]>('/store/deliveries');
  return data.map(mapStoreDelivery);
}

export async function confirmStoreDelivery(batchCode: string, accountId?: string) {
  const { data } = await api.post<BackendTransport>(`/store/deliveries/${encodeURIComponent(batchCode)}/confirm`, {
    accountId
  });

  return mapStoreDelivery(data);
}

export async function getStoreIssues() {
  const { data } = await api.get<BackendIncident[]>('/store/issues');
  return data.map(mapStoreIssue);
}
