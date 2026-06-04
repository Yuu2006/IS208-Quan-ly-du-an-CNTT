import { api } from '../../config/api';

export type AuditLogEntry = {
  auditId: string;
  timestamp: string;
  actorId: string;
  actor: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    role: string;
  } | null;
  action: string;
  objectType: string;
  objectId: string;
  oldValue: unknown;
  newValue: unknown;
  ipAddress: string;
  userAgent: string;
};

export type AuditLogSummary = {
  total: number;
  today: number;
  byObjectType: Array<{ objectType: string; count: number }>;
  byAction: Array<{ action: string; count: number }>;
  topActors: Array<{ actorId: string; actorName: string; role: string; count: number }>;
  activity: Array<{ date: string; count: number }>;
  recentLogs: AuditLogEntry[];
};

export type AuditLogTimeline = {
  batchId?: string; // Tương thích ngược
  targetId?: string;
  targetType?: 'BATCH' | 'TRANSPORT';
  summary: string;
  metadata?: {
    fromName?: string;
    toName?: string;
  };
  items: Array<{
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    label: string;
    from: string;
    to: string;
    objectType: string;
    objectId: string;
    ip: string;
    payload: unknown;
    source: string;
  }>;
};

export type AuditLogParams = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  objectType?: string;
  action?: string;
  actorId?: string;
  ipAddress?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
};

/** Gọi API UC26 để lấy tổng quan module Audit Log. */
export async function getAuditLogSummary() {
  const { data } = await api.get<AuditLogSummary>('/audit-logs/summary');
  return data;
}

/** Gọi API UC28 để tra cứu Audit Log theo filter và phân trang. */
export async function getAuditLogs(params: AuditLogParams) {
  const { data } = await api.get<{
    entries: AuditLogEntry[];
    meta: { page: number; pageSize: number; total: number; totalPages: number };
  }>('/audit-logs', { params });
  return data;
}

/** Gọi API UC28 để xem chi tiết một bản ghi Audit Log ở chế độ chỉ đọc. */
export async function getAuditLogDetail(auditId: string) {
  const { data } = await api.get<AuditLogEntry>(`/audit-logs/${encodeURIComponent(auditId)}`);
  return data;
}

/** Gọi API UC27 để lấy timeline thay đổi của một lô hàng. */
export async function getBatchAuditTimeline(batchCodeOrId: string) {
  const { data } = await api.get<AuditLogTimeline>(`/batches/${encodeURIComponent(batchCodeOrId)}/audit-logs`);
  return data;
}

/** Gọi API để lấy timeline thay đổi của một chuyến xe. */
export async function getTransportAuditTimeline(transportId: string) {
  const { data } = await api.get<AuditLogTimeline>(`/transports/${encodeURIComponent(transportId)}/audit-logs`);
  return data;
}
