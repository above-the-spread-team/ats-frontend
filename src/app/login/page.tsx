"use client";

import * as React from "react";
import { useState } from "react";
import { Eye, EyeClosed, Mail, Lock, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { ZodError } from "zod";
import FullPage from "@/components/common/full-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Facebook Icon Component
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

// Google Icon Component
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<
    "facebook" | "google" | null
  >(null);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({
    email: "",
    password: "",
  });

  const validateForm = () => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Partial<Record<keyof LoginFormData, string>> = {};
        error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof LoginFormData;
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

    setIsLoading(true);

    try {
      // TODO: Replace with actual authentication API call
      // const response = await fetch("/api/auth/login", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // });
      // if (!response.ok) throw new Error("Login failed");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to home page after successful login
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        email: "",
        password: "Invalid email or password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSocialLogin = async (provider: "facebook" | "google") => {
    setSocialLoading(provider);

    try {
      // TODO: Replace with actual social authentication
      // For Facebook: window.location.href = "/api/auth/facebook";
      // For Google: window.location.href = "/api/auth/google";

      // Simulate redirect
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log(`Redirecting to ${provider} login...`);

      // In a real app, you would redirect to the OAuth provider
      // Example: window.location.href = `/api/auth/${provider}`;
    } catch (error) {
      console.error(`${provider} login error:`, error);
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <FullPage
      center
      minusHeight={110}
      className="relative pb-20 py-10 bg-[url('/images/auth.jpg')] bg-cover bg-center bg-no-repeat   min-h-[calc(100vh-84px)]"
    >
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="w-full max-w-md px-4 z-10">
        <Card className="shadow-lg bg-card/80">
          <CardHeader className=" text-center">
            <CardTitle className="font-bold">Login</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit} noValidate>
            <CardContent className="space-y-2">
              {/* Email Input */}
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-9 ${
                      errors.email ? "border-destructive" : ""
                    }`}
                    disabled={isLoading || socialLoading !== null}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1 ">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-9 pr-9 ${
                      errors.password ? "border-destructive" : ""
                    }`}
                    disabled={isLoading || socialLoading !== null}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading || socialLoading !== null}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeClosed className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="flex  items-center justify-end">
                <Link
                  href="/forgot-pwd"
                  className="text-sm text-primary-font hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button
                type="submit"
                className="w-full "
                disabled={isLoading || socialLoading !== null}
              >
                {isLoading ? (
                  <>
                    <span className=" h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className=" h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>

              {/* Divider */}
              <div className="relative  w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-1 gap-3 w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialLogin("facebook")}
                  disabled={isLoading || socialLoading !== null}
                >
                  {socialLoading === "facebook" ? (
                    <span className=" h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <FacebookIcon className=" h-4 w-4 text-[#1877F2]" />
                  )}
                  Facebook
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full "
                  onClick={() => handleSocialLogin("google")}
                  disabled={isLoading || socialLoading !== null}
                >
                  {socialLoading === "google" ? (
                    <span className=" h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <GoogleIcon className=" h-4 w-4" />
                  )}
                  Google
                </Button>
              </div>
              <div className="text-center  text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-primary-font  hover:underline font-medium"
                >
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </FullPage>
  );
}
