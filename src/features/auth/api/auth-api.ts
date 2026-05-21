import { apiRequest } from '@/lib/api/client';
import type { User } from '@/types';

// Response shapes are inferred — backend hasn't been called yet.
// When the real shapes land, update these types and the calling code.
export type AuthSuccess = {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
  // Backends often nest the token under `data` — log responses to confirm.
  [key: string]: unknown;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  fullName: string;
  email: string;
  // ISO 8601 date string (YYYY-MM-DD).
  dateOfBirth: string;
  password: string;
};

export type VerifyRegistrationInput = {
  email: string;
  otp: string;
};

export type ForgotPasswordInput = {
  email: string;
};

export type VerifyForgotPasswordInput = {
  email: string;
  otp: string;
};

export type ResetPasswordInput = {
  password: string;
  otp: string;
};

export type ChangePasswordInput = {
  password: string;
  otp: string;
};

export const login = (input: LoginInput) =>
  apiRequest<AuthSuccess>('/api/auth/login', {
    method: 'POST',
    body: input,
    unauthenticated: true,
  });

export const register = (input: RegisterInput) =>
  apiRequest<AuthSuccess>('/api/auth/register', {
    method: 'POST',
    body: input,
    unauthenticated: true,
  });

export const verifyRegistration = (input: VerifyRegistrationInput) =>
  apiRequest<AuthSuccess>('/api/auth/email/verify-registration', {
    method: 'POST',
    body: input,
    unauthenticated: true,
  });

// Resend OTP — endpoint takes no body in the swagger doc. If the backend needs
// the email, switch this to a POST with `{ email }` later.
export const requestOtp = (email?: string) =>
  apiRequest<unknown>('/api/auth/email/request-otp', {
    method: 'GET',
    query: email ? { email } : undefined,
    unauthenticated: true,
  });

// Signup-specific resend OTP — used on the verify-otp step after registration.
export const resendRegistrationOtp = (email: string) =>
  apiRequest<unknown>('/api/auth/email/resend-registration-otp', {
    method: 'POST',
    body: { email },
    unauthenticated: true,
  });

export const forgotPassword = (input: ForgotPasswordInput) =>
  apiRequest<unknown>('/api/auth/email/forgot-password', {
    method: 'POST',
    body: input,
    unauthenticated: true,
  });

export const verifyForgotPasswordOtp = (input: VerifyForgotPasswordInput) =>
  apiRequest<unknown>('/api/auth/email/verify/forgot-password', {
    method: 'POST',
    body: input,
    unauthenticated: true,
  });

export const resetPassword = (input: ResetPasswordInput) =>
  apiRequest<unknown>('/api/auth/reset-password', {
    method: 'POST',
    body: input,
    unauthenticated: true,
  });

// Authenticated change-password flow: GET sends an OTP to the user's email,
// then POST submits the OTP + new password.
export const requestChangePasswordOtp = () =>
  apiRequest<unknown>('/api/auth/email/change-password', { method: 'GET' });

export const changePassword = (input: ChangePasswordInput) =>
  apiRequest<unknown>('/api/auth/change-password', { method: 'POST', body: input });

// Server-side logout — invalidates the user's session/refresh token. The auth
// store still clears local storage on its own; this just tells the backend.
export const logout = () => apiRequest<unknown>('/api/auth/logout', { method: 'POST' });
