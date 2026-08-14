import { z } from "zod";

// Messages are i18n keys; the Field components translate them at render time.

export const loginSchema = z.object({
  email: z.string().email("val.emailInvalid"),
  password: z.string().min(1, "val.passwordRequired"),
});

export const signupSchema = z
  .object({
    displayName: z.string().min(1, "val.nameRequired").max(80),
    email: z.string().email("val.emailInvalid"),
    password: z.string().min(8, "val.passwordMin"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "val.passwordsNoMatch",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("val.emailInvalid"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "val.passwordMin"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "val.passwordsNoMatch",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
