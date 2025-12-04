import { z } from "zod";

// Email validation schema
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

// Password validation schema
// Must contain: uppercase, lowercase, number, and be 8-16 characters
export const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(16, "Password must be at most 16 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Register form schema
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name must be at most 50 characters")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Name can only contain letters, numbers, underscores, and hyphens"
      ),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
