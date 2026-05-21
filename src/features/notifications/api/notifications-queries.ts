import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from './notifications-api';

export const notificationsKeys = {
  list: ['notifications', 'list'] as const,
};

export const useNotificationsQuery = () =>
  useQuery({ queryKey: notificationsKeys.list, queryFn: getNotifications });

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
