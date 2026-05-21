export type UserRole = 'GROWTH_SEEKER' | 'EXPLORER';

export type User = {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  fullName?: string;
  createdAt: string;
};
