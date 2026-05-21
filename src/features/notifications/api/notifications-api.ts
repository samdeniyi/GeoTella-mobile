import { apiRequest } from '@/lib/api/client';

export type NotificationType =
  | 'FOLLOW'
  | 'INSIGHT_ADDED'
  | 'INSIGHT_VERIFIED'
  | 'VERIFY_REQUEST'
  | 'TRUST_INCREASE'
  | 'BADGE_UNLOCKED'
  | string;

export type NotificationItem = {
  id: string;
  type?: NotificationType;
  title?: string;
  message?: string;
  body?: string;
  isRead?: boolean;
  read?: boolean;
  createdAt?: string;
  time?: string;
  category?: 'ACTIVITY' | 'UPDATES' | string;
  // Related data — present sometimes.
  actor?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    avatar?: string;
  } | null;
  insight?: {
    id?: string;
    title?: string;
    location?: string;
  } | null;
  insightId?: string;
  location?: string;
  [key: string]: unknown;
};

export const getNotifications = () =>
  apiRequest<NotificationItem[] | { data?: NotificationItem[] }>('/api/notifications');

export const markNotificationRead = (id: string) =>
  apiRequest<unknown>(`/api/notifications/${id}/read`, { method: 'PATCH' });

export const markAllNotificationsRead = () =>
  apiRequest<unknown>('/api/notifications/mark-all-read', { method: 'PATCH' });

export const extractNotifications = (raw: unknown): NotificationItem[] => {
  if (Array.isArray(raw)) return raw as NotificationItem[];
  if (raw && typeof raw === 'object') {
    const r = raw as { data?: unknown; items?: unknown };
    if (Array.isArray(r.data)) return r.data as NotificationItem[];
    if (Array.isArray(r.items)) return r.items as NotificationItem[];
  }
  return [];
};
