"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Eye, EyeClosed, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/validations/auth";
import { ZodError } from "zod";
import { useResetPassword } from "@/services/fastapi/user-email";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Loading from "@/components/common/loading";

export default function ResetPwdPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetPasswordMutation = useResetPassword();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [token, setToken] = useState<string>("");
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    token: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ResetPasswordFormData, string>>
  >({
    token: "",
    password: "",
    confirmPassword: "",
  });

  // Get token from URL query params
  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
      setFormData((prev) => ({ ...prev, token: tokenParam }));
    } else {
      setErrors((prev) => ({
        ...prev,
        token: "Reset token is missing. Please use the link from your email.",
      }));
    }
    // Mark token check as complete
    setIsCheckingToken(false);
  }, [searchParams]);

  const validateForm = () => {
    try {
      resetPasswordSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Partial<Record<keyof ResetPasswordFormData, string>> =
          {};
        error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof ResetPasswordFormData;
          if (field) {
            newErrors[field] = issue.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!token) {
      setErrors((prev) => ({
        ...prev,
        token: "Reset token is missing. Please use the link from your email.",
      }));
      return;
    }

    resetPasswordMutation.mutate(
      {
        token: formData.token,
        new_password: formData.password,
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login?passwordReset=true");
          }, 3000);
        },
        onError: (error) => {
          console.error("Reset password error:", error);

          // Handle specific error messages
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to reset password. Please try again.";

          // Parse error message format: "field: message" or just "message"
          const errorMatch = errorMessage.match(
            /^(token|password|new_password):\s*(.+)$/i
          );

          if (errorMatch) {
            const [, field, message] = errorMatch;
            // Map new_password to password field
            const targetField =
              field.toLowerCase() === "new_password"
                ? "password"
                : field.toLowerCase();

            setErrors({
              token: targetField === "token" ? message : "",
              password: targetField === "password" ? message : "",
              confirmPassword: "",
            });
          } else {
            // General error - show on password field
            setErrors({
              token: "",
              password: errorMessage,
              confirmPassword: "",
            });
          }
        },
      }
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof ResetPasswordFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Show loading state while checking token
  if (isCheckingToken) {
    return (
      <>
        <div className="w-full max-w-md px-4 z-10">
          <Card className="shadow-lg bg-card/80">
            <CardContent className="">
              <div className="flex flex-col items-center justify-center pt-4 gap-2">
                <Loading />
                <h3 className="text-base md:text-lg font-semibold text-center"></h3>
                <div className="text-muted-foreground text-xs md:text-sm text-center px-2">
                  Checking reset token...
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (isSuccess) {
    return (
      <>
        <div className="w-full max-w-md px-4 z-10">
          <Card className="shadow-lg bg-card/80">
            <CardHeader className="text-center">
              <CheckCircle2 className="h-8 w-8 mx-auto text-bar-green" />
              <CardTitle className="font-bold ">
                Password reset successful
              </CardTitle>
              <CardDescription className="text-xs md:text-sm mx-2  px-2">
                Your password has been reset successfully. You will be
                redirected to the login page shortly.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col mt-2 gap-2">
              <Button
                type="button"
                className="w-full"
                onClick={() => router.push("/login")}
              >
                Go to login
              </Button>
            </CardFooter>
          </Card>
        </div>
      </>
    );
  }

  if (!token) {
    return (
      <>
        <div className="w-full max-w-md px-4 z-10">
          <Card className="shadow-lg bg-card/80">
            <CardHeader className="text-center ">
              <CardTitle className="font-bold">Invalid Reset Link</CardTitle>
              <CardDescription className="text-xs md:text-sm  px-2">
                The reset link is invalid or missing. Please request a new
                password reset link.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col mt-2 gap-2">
              <Button
                type="button"
                className="w-full"
                onClick={() => router.push("/forgot-pwd")}
              >
                Request new reset link
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                <Link
                  href="/login"
                  className="text-primary-font hover:underline font-medium inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to login
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="w-full max-w-md px-4 z-10">
        <Card className="shadow-lg bg-card/80">
          <CardHeader className="text-center">
            <CardTitle className="font-bold">Reset Password</CardTitle>
            <CardDescription className="text-xs md:text-sm mx-2  px-2">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} noValidate>
            <CardContent className="space-y-2 mt-1">
              {/* Password Input */}
              <div className="space-y-1">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-9 pr-9 ${
                      errors.password ? "border-destructive" : ""
                    }`}
                    disabled={resetPasswordMutation.isPending}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeClosed className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive-foreground">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`pl-9 pr-9 ${
                      errors.confirmPassword ? "border-destructive" : ""
                    }`}
                    disabled={resetPasswordMutation.isPending}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeClosed className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive-foreground">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Reset Password
                  </>
                )}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                <Link
                  href="/login"
                  className="text-primary-font hover:underline font-medium inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}
