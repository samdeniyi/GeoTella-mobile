import { useMutation } from '@tanstack/react-query';

import {
  changePassword,
  forgotPassword,
  login,
  register,
  requestChangePasswordOtp,
  requestOtp,
  resendRegistrationOtp,
  resetPassword,
  verifyForgotPasswordOtp,
  verifyRegistration,
} from './auth-api';

export const useLoginMutation = () => useMutation({ mutationFn: login });

export const useRegisterMutation = () => useMutation({ mutationFn: register });

export const useVerifyRegistrationMutation = () => useMutation({ mutationFn: verifyRegistration });

export const useRequestOtpMutation = () =>
  useMutation({ mutationFn: (email?: string) => requestOtp(email) });

export const useResendRegistrationOtpMutation = () =>
  useMutation({ mutationFn: resendRegistrationOtp });

export const useForgotPasswordMutation = () => useMutation({ mutationFn: forgotPassword });

export const useVerifyForgotPasswordMutation = () =>
  useMutation({ mutationFn: verifyForgotPasswordOtp });

export const useResetPasswordMutation = () => useMutation({ mutationFn: resetPassword });

export const useRequestChangePasswordOtpMutation = () =>
  useMutation({ mutationFn: requestChangePasswordOtp });

export const useChangePasswordMutation = () => useMutation({ mutationFn: changePassword });
