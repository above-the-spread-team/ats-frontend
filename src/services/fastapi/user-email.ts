import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { User, AuthError } from "@/type/user";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export type RegisterResponse = User;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  warning?: string; // Warning message if email is not verified
}

/**
 * Register a new user with email and password
 */
export async function register(
  data: RegisterRequest
): Promise<RegisterResponse> {
  const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    // FastAPI returns detailed validation errors in 422 responses
    const errorData = await response.json().catch(() => ({}));

    // Handle 422 validation errors - FastAPI returns array of errors
    if (response.status === 422) {
      const validationErrors = errorData.detail || [];
      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        // Get the first validation error message
        const firstError = validationErrors[0];
        const field = firstError.loc?.[firstError.loc.length - 1] || "field";
        const message = firstError.msg || "Validation error";
        // Map backend field names to frontend field names
        const fieldMap: Record<string, string> = {
          username: "name",
          email: "email",
          password: "password",
        };
        const frontendField = fieldMap[field] || field;
        throw new Error(`${frontendField}: ${message}`);
      }
      throw new Error(
        typeof errorData.detail === "string"
          ? errorData.detail
          : "Invalid registration data"
      );
    }

    // Handle other error cases
    const error: AuthError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Registration failed" };

    if (response.status === 400) {
      throw new Error(error.detail || "Invalid registration data");
    }

    throw new Error(error.detail || "Registration failed. Please try again.");
  }

  const user: RegisterResponse = await response.json();
  return user;
}

/**
 * Login with email and password
 * Backend sets HttpOnly cookie automatically
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Include HttpOnly cookie
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: AuthError = await response.json().catch(() => ({
      detail: "Login failed",
    }));

    // Handle specific error cases
    if (response.status === 401) {
      throw new Error(error.detail || "Invalid email or password");
    }
    if (response.status === 403) {
      throw new Error(error.detail || "User account is inactive");
    }

    throw new Error(error.detail || "Login failed. Please try again.");
  }

  const result: LoginResponse = await response.json();
  return result;
}

/**
 * React Query mutation hook for user registration
 */
export function useRegister() {
  return useMutation<RegisterResponse, Error, RegisterRequest>({
    mutationFn: register,
  });
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  message: string;
}

export interface VerifyEmailResponse {
  message: string;
  user: User;
  auto_login: boolean; // Signal to frontend to redirect to home
}

/**
 * Verify email with token
 * Backend returns 200 with JSON response and sets JWT cookie
 * Frontend handles redirect to home page
 */
export async function verifyEmail(token: string): Promise<VerifyEmailResponse> {
  const response = await fetch(
    `${BACKEND_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies to receive the JWT cookie
    }
  );

  if (!response.ok) {
    // Handle errors - try to get error message from response
    let errorMessage = "Verification failed";
    try {
      const error: AuthError = await response.json();
      errorMessage = error.detail || errorMessage;
    } catch {
      // If response isn't JSON, use status-based error message
      if (response.status === 400) {
        errorMessage = "Invalid or expired verification token";
      } else if (response.status === 404) {
        errorMessage = "Verification token not found";
      }
    }

    // Create custom error with detail for better error handling
    const customError = new Error(errorMessage) as Error & {
      status?: number;
      detail?: string;
    };
    customError.status = response.status;
    customError.detail = errorMessage;

    throw customError;
  }

  // Backend returns 200 with JSON response containing user data
  const result: VerifyEmailResponse = await response.json();
  return result;
}

/**
 * Resend verification email
 * Backend expects JSON body with email field
 */
export async function resendVerification(
  email: string
): Promise<ResendVerificationResponse> {
  const response = await fetch(`${BACKEND_URL}/api/auth/resend-verification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // Handle specific error cases
    if (response.status === 422) {
      // FastAPI validation errors can be arrays or strings
      const validationErrors = errorData.detail || [];
      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        const firstError = validationErrors[0];
        const message = firstError.msg || "Invalid email format";
        throw new Error(message);
      }
      throw new Error(
        typeof errorData.detail === "string"
          ? errorData.detail
          : "Invalid email format"
      );
    }

    const error: AuthError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to resend verification email" };

    if (response.status === 400) {
      throw new Error(error.detail || "Email already verified or invalid");
    }

    throw new Error(
      error.detail || "Failed to resend verification email. Please try again."
    );
  }

  const result: ResendVerificationResponse = await response.json();
  return result;
}

/**
 * React Query mutation hook for user login
 * After successful login, invalidates currentUser query to refetch auth state
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: login,
    onSuccess: () => {
      // Invalidate and refetch current user to update auth state
      // The backend sets HttpOnly cookie, so refetching will get the user
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

/**
 * React Query mutation hook for verifying email
 * After successful verification, invalidates currentUser query to refetch auth state
 * Backend sets JWT cookie in response, so we invalidate to refetch user data
 */
export function useVerifyEmail() {
  const queryClient = useQueryClient();

  return useMutation<
    VerifyEmailResponse,
    Error & { status?: number; detail?: string },
    string
  >({
    mutationFn: verifyEmail,
    onSuccess: () => {
      // Invalidate and refetch current user to update auth state
      // Backend sets HttpOnly cookie in response, so refetching will get the user
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

/**
 * React Query mutation hook for resending verification email
 */
export function useResendVerification() {
  return useMutation<ResendVerificationResponse, Error, string>({
    mutationFn: resendVerification,
  });
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

/**
 * Request password reset - sends reset link to email
 * Backend always returns success message for security (doesn't reveal if email exists)
 */
export async function forgotPassword(
  email: string
): Promise<ForgotPasswordResponse> {
  const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // Handle specific error cases
    if (response.status === 422) {
      // FastAPI validation errors can be arrays or strings
      const validationErrors = errorData.detail || [];
      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        const firstError = validationErrors[0];
        const message = firstError.msg || "Invalid email format";
        throw new Error(message);
      }
      throw new Error(
        typeof errorData.detail === "string"
          ? errorData.detail
          : "Invalid email format"
      );
    }

    const error: AuthError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to send password reset email" };

    if (response.status === 500) {
      throw new Error(error.detail || "Failed to send password reset email");
    }

    throw new Error(
      error.detail || "Failed to send password reset email. Please try again."
    );
  }

  const result: ForgotPasswordResponse = await response.json();
  return result;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

/**
 * Reset password with token
 */
export async function resetPassword(
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  const response = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // Handle specific error cases
    if (response.status === 422) {
      // FastAPI validation errors can be arrays or strings
      const validationErrors = errorData.detail || [];
      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        const firstError = validationErrors[0];
        const field = firstError.loc?.[firstError.loc.length - 1] || "field";
        const message = firstError.msg || "Validation error";
        // Map backend field names to frontend field names
        const fieldMap: Record<string, string> = {
          new_password: "password",
          token: "token",
        };
        const frontendField = fieldMap[field] || field;
        throw new Error(`${frontendField}: ${message}`);
      }
      throw new Error(
        typeof errorData.detail === "string"
          ? errorData.detail
          : "Invalid reset data"
      );
    }

    const error: AuthError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to reset password" };

    if (response.status === 400) {
      throw new Error(
        error.detail ||
          "Invalid or expired reset token. Please request a new one."
      );
    }

    throw new Error(
      error.detail || "Failed to reset password. Please try again."
    );
  }

  const result: ResetPasswordResponse = await response.json();
  return result;
}

/**
 * React Query mutation hook for forgot password
 */
export function useForgotPassword() {
  return useMutation<ForgotPasswordResponse, Error, string>({
    mutationFn: forgotPassword,
  });
}

/**
 * React Query mutation hook for reset password
 */
export function useResetPassword() {
  return useMutation<ResetPasswordResponse, Error, ResetPasswordRequest>({
    mutationFn: resetPassword,
  });
}

export type UploadIconResponse = User;

/**
 * Upload user profile icon/avatar
 * Backend uploads to Cloudinary and updates user's avatar_url
 */
export async function uploadUserIcon(file: File): Promise<UploadIconResponse> {
  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size must be less than 5MB");
  }

  // Create FormData
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BACKEND_URL}/api/auth/upload-icon`, {
    method: "POST",
    credentials: "include", // Include HttpOnly cookie
    body: formData, // Don't set Content-Type header - browser will set it with boundary
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    const error: AuthError =
      errorData.detail && typeof errorData.detail === "string"
        ? { detail: errorData.detail }
        : { detail: "Failed to upload image" };

    if (response.status === 401) {
      throw new Error("401: Not authenticated");
    }
    if (response.status === 400) {
      throw new Error(error.detail || "Invalid file");
    }
    if (response.status === 403) {
      throw new Error(error.detail || "User account is inactive");
    }

    throw new Error(
      error.detail || "Failed to upload image. Please try again."
    );
  }

  const user: UploadIconResponse = await response.json();
  return user;
}

/**
 * React Query mutation hook for uploading user icon
 * After successful upload, invalidates currentUser query to refetch user data
 */
export function useUploadUserIcon() {
  const queryClient = useQueryClient();

  return useMutation<UploadIconResponse, Error, File>({
    mutationFn: uploadUserIcon,
    onSuccess: () => {
      // Invalidate and refetch current user to update avatar_url
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}
