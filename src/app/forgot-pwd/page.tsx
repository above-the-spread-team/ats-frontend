"use client";

import * as React from "react";
import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2, Send } from "lucide-react";
import Link from "next/link";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validations/auth";
import { ZodError } from "zod";
import FullPage from "@/components/common/full-page";
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

export default function ForgotPwdPage() {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const validateForm = () => {
    try {
      forgotPasswordSchema.parse(formData);
      setError("");
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.issues[0];
        if (firstError) {
          setError(firstError.message);
        }
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
      // TODO: Replace with actual API call
      // const response = await fetch("/api/auth/forgot-password", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email }),
      // });
      // if (!response.ok) throw new Error("Failed to send reset email");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsSuccess(true);
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("Failed to send reset email. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  if (isSuccess) {
    return (
      <FullPage
        center
        minusHeight={110}
        className="relative pb-20 py-10 bg-[url('/images/auth.jpg')] bg-cover bg-center bg-no-repeat    min-h-[calc(100vh-42px)]"
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="w-full max-w-md px-4 z-10">
          <Card className="shadow-lg bg-card/80">
            <CardHeader className="text-center">
              <CheckCircle2 className="h-8 w-8 mx-auto text-primary-font" />
              <CardTitle className="font-bold text-xl">
                Check your email
              </CardTitle>
              <CardDescription className="text-base mt-2">
                We&apos;ve sent a password reset link to
              </CardDescription>
              <CardDescription className="text-base pb-1 font-semibold text-primary">
                {formData.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                <p>
                  If an account exists with this email, you will receive a
                  password reset link shortly.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button
                type="button"
                // variant="outline"
                className="w-full"
                onClick={() => {
                  setIsSuccess(false);
                  setFormData({ email: "" });
                }}
              >
                <Send className="mr-2 h-4 w-4" />
                Resend email
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
      </FullPage>
    );
  }

  return (
    <FullPage
      center
      minusHeight={110}
      className="relative pb-20 py-10 bg-[url('/images/auth.jpg')] bg-cover bg-center bg-no-repeat   min-h-[calc(100vh-42px)]"
    >
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="w-full max-w-md px-4 z-10">
        <Card className="shadow-lg bg-card/80">
          <CardHeader className="text-center">
            <CardTitle className="font-bold">Reset Password</CardTitle>
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
                    className={`pl-9 ${error ? "border-destructive" : ""}`}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send reset link
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
    </FullPage>
  );
}
