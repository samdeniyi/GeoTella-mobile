import { useMemo } from 'react';

import { useUserRole } from '@/stores/auth-store';
import { getRoleTheme } from '@/theme/role-theme';

export const useRoleTheme = () => {
  const role = useUserRole();
  return useMemo(() => getRoleTheme(role), [role]);
};
