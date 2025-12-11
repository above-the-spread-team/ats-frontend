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
import { useForgotPassword } from "@/services/fastapi/user-email";

export default function ForgotPwdPage() {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const forgotPasswordMutation = useForgotPassword();

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

    setError("");

    forgotPasswordMutation.mutate(formData.email, {
      onSuccess: () => {
        setIsSuccess(true);
      },
      onError: (error) => {
        setError(
          error.message || "Failed to send reset email. Please try again later."
        );
      },
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

    return (
      <>
        <div className="w-full max-w-md px-4 z-10">
          <Card className="shadow-lg bg-card/80">
            <CardHeader className="text-center">
            {isSuccess ? (
              <>
                <CheckCircle2 className="h-8 w-8 mx-auto text-bar-green" />
              <CardTitle className="font-bold text-xl">
                Check your email
              </CardTitle>
                <CardDescription className="text-base pb-1 font-semibold text-primary-font">
                {formData.email}
              </CardDescription>
              </>
            ) : (
              <CardTitle className="font-bold">Reset Password</CardTitle>
            )}
            </CardHeader>
          {isSuccess && (
            <div className="mx-4 my-1">
              <div className="rounded-lg bg-muted py-2 px-4 shadow-inner text-xs md:text-sm text-muted-foreground">
                <p>
                  If an account exists with this email, you will receive a
                  password reset link shortly.
                </p>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate>
            <CardContent className="space-y-2 ">
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
                    disabled={forgotPasswordMutation.isPending}
                    autoComplete="email"
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive-foreground">{error}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={forgotPasswordMutation.isPending}
              >
                {forgotPasswordMutation.isPending ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {isSuccess ? "Resend email" : "Send reset link"}
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
