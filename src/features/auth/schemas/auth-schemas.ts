import { z } from 'zod';

export const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email');

export const passwordSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Must contain an uppercase letter')
  .regex(/[0-9]/, 'Must contain a number');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  email: emailSchema,
  dateOfBirth: z.string().min(1, 'Select your date of birth'),
  password: passwordSchema,
});
export type SignupInput = z.infer<typeof signupSchema>;

export const otpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});
export type OtpInput = z.infer<typeof otpSchema>;

export const requestResetSchema = z.object({ email: emailSchema });
export type RequestResetInput = z.infer<typeof requestResetSchema>;

export const newPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
