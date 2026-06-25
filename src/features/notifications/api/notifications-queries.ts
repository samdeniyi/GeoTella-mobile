import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  extractNotifications,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from './notifications-api';

export const notificationsKeys = {
  list: ['notifications', 'list'] as const,
};

export const useNotificationsQuery = () =>
  useQuery({ queryKey: notificationsKeys.list, queryFn: getNotifications });

export const useUnreadNotificationsCount = (): number => {
  const query = useNotificationsQuery();
  const items = extractNotifications(query.data);
  // A notification is unread only when the backend positively says so —
  // `isRead === false` (or the legacy `read === false`). Notifications that
  // omit both fields default to read so we don't show a phantom red dot.
  return items.filter((n) => n.isRead === false || n.read === false).length;
};

export const useMarkNotificationReadMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notificationsKeys.list });
    },
  });
};

export const useMarkAllNotificationsReadMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notificationsKeys.list });
    },
  });
};
