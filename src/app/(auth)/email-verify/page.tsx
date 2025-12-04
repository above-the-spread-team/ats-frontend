"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { CheckCircle2, XCircle, Mail, Loader2 } from "lucide-react";
import { ZodError } from "zod";
import Loading from "@/components/common/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useResendVerification,
  useVerifyEmail,
} from "@/services/fastapi/user-email";
import { resendVerificationSchema } from "@/lib/validations/auth";

export default function EmailVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerification();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    | "idle"
    | "verifying"
    | "success"
    | "error"
    | "expired"
    | "already-verified"
    | "registered"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showResendForm, setShowResendForm] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [showRegistrationMessage, setShowRegistrationMessage] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check for verification token in URL
  useEffect(() => {
    // Skip if already redirecting
    if (isRedirecting) return;

    const token = searchParams.get("token");
    const registered = searchParams.get("registered");
    const login = searchParams.get("login");
    const emailParam = searchParams.get("email");

    // If redirected from login with unverified email, show message and pre-fill email
    if (login === "true") {
      setShowResendForm(true);
      if (emailParam) {
        setEmail(decodeURIComponent(emailParam));
      }
      setStatus("registered"); // Use same status to show "check your email" message
      setIsInitializing(false);
      // Clear the query parameters
      router.replace("/email-verify", { scroll: false });
      return;
    }

    // If redirected from registration, show registration message and pre-fill email
    if (registered === "true") {
      setShowRegistrationMessage(true);
      setShowResendForm(true);
      if (emailParam) {
        setEmail(decodeURIComponent(emailParam));
      }
      setStatus("registered");
      setIsInitializing(false);
      // Clear the query parameters
      router.replace("/email-verify", { scroll: false });
      return;
    }

    // If token exists and we haven't verified yet, verify it via API
    // Backend returns 200 with JSON response and sets JWT cookie
    if (
      token &&
      !hasVerified &&
      !isRedirecting &&
      status !== "verifying" &&
      status !== "success"
    ) {
      setHasVerified(true);
      setIsInitializing(false);
      setStatus("verifying");
      verifyMutation.mutate(token, {
        onSuccess: (data) => {
          // Backend returns auto_login=true when verification succeeds
          // Cookie is already set by backend response
          if (data.auto_login) {
            // Prevent error states
            setIsRedirecting(true);
            // Invalidate query to refetch user data with the new cookie
            queryClient.invalidateQueries({ queryKey: ["currentUser"] });
            // Redirect to home page immediately
            window.location.href = "/";
            return;
          }
          setStatus("success");
        },
        onError: (error) => {
          // Don't show error if we're redirecting
          if (isRedirecting) return;

          const errorDetail =
            error.detail || error.message || "Verification failed";

          // Handle specific error cases
          if (errorDetail.toLowerCase().includes("already verified")) {
            setStatus("already-verified");
          } else if (errorDetail.toLowerCase().includes("expired")) {
            setStatus("expired");
            setShowResendForm(true);
          } else {
            setStatus("error");
            setErrorMessage(errorDetail);
            setShowResendForm(true);
          }
        },
      });
    } else if (!token && !isRedirecting) {
      // No token, show idle state (user can enter email to resend)
      setIsInitializing(false);
      if (status === "idle") {
        // Status already set, just mark as initialized
      } else {
        setStatus("idle");
      }
    }
  }, [
    searchParams,
    router,
    queryClient,
    verifyMutation,
    hasVerified,
    status,
    isRedirecting,
  ]);

  const handleResend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setEmailError("");
    setErrorMessage("");

    // Validate email with Zod
    try {
      resendVerificationSchema.parse({ email });
    } catch (error) {
      if (error instanceof ZodError) {
        const emailError = error.issues.find((err) => err.path[0] === "email");
        if (emailError) {
          setEmailError(emailError.message);
          return;
        }
      }
      setEmailError("Please enter a valid email address");
      return;
    }

    resendMutation.mutate(email, {
      onSuccess: () => {
        setResendSuccess(true);
        setErrorMessage("");
        setEmailError("");
        // Hide form after 6 seconds
        setTimeout(() => {
          setShowResendForm(false);
          setResendSuccess(false);
        }, 6000);
      },
      onError: (error) => {
        setResendSuccess(false);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to resend verification email. Please try again."
        );
      },
    });
  };

  // Early return if redirecting - prevent any error UI from showing
  if (isRedirecting) {
    return (
      <div className="w-full py-14 max-w-md px-4 z-10">
        <Card className="shadow-lg bg-card/80">
          <CardContent className="">
            <div className="flex flex-col items-center justify-center pt-4 gap-2">
              <Loading />
              <h3 className="text-base md:text-lg font-semibold text-center"></h3>
              <div className="text-muted-foreground text-xs md:text-sm text-center px-2">
                Email verified! Logging you in...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full py-14 max-w-md px-4 z-10">
      <Card className="shadow-lg bg-card/80">
        <CardContent className="">
          {/* Initial Loading State - Show while checking token/params */}
          {isInitializing && (
            <div className="flex flex-col items-center justify-center pt-4 gap-2">
              <Loading />
              <h3 className="text-base md:text-lg font-semibold text-center"></h3>
              <div className="text-muted-foreground text-xs md:text-sm text-center px-2">
                Checking verification status...
              </div>
            </div>
          )}

          {/* Verifying State */}
          {!isInitializing && status === "verifying" && !isRedirecting && (
            <div className="flex flex-col items-center justify-center pt-4 gap-2">
              <Loading />
              <h3 className="text-base md:text-lg font-semibold text-center"></h3>
              <div className="text-muted-foreground text-xs md:text-sm text-center px-2">
                Verifying your email address...
              </div>
            </div>
          )}

          {/* Resend Success State - Show when email is sent successfully */}
          {!isInitializing && resendSuccess && (
            <div className="flex flex-col items-center justify-center pt-4 gap-2">
              <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10 text-green-600 dark:text-green-400" />
              <h3 className="text-base md:text-lg font-semibold text-center">
                Verification Email Sent!
              </h3>
              <div className="text-muted-foreground text-xs md:text-sm text-center px-2">
                Please check your inbox at{" "}
                <span className="font-medium">
                  {email || "your email address"}
                </span>{" "}
                and click the verification link to activate your account.
              </div>
            </div>
          )}

          {/* Success State */}
          {!isInitializing && status === "success" && !resendSuccess && (
            <div className="flex flex-col items-center justify-center pt-4 gap-2">
              <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10 text-green-600 dark:text-green-400" />
              <h3 className="text-base md:text-lg font-semibold text-center">
                Email Verified Successfully!
              </h3>
              <div className="text-muted-foreground text-xs md:text-sm text-center px-2">
                Your email address has been verified. Redirecting you to the
                home page...
              </div>
              <Button onClick={() => router.push("/")} className="w-full">
                Go to Home
              </Button>
            </div>
          )}

          {/* Already Verified State */}
          {!isInitializing && status === "already-verified" && (
            <div className="flex flex-col items-center justify-center pt-4 gap-2">
              <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10 text-green-600 dark:text-green-400" />
              <h3 className="text-base md:text-lg font-semibold text-center">
                Email Already Verified
              </h3>
              <div className="text-muted-foreground text-xs md:text-sm text-center px-2">
                Your email address has already been verified. You can log in to
                your account.
              </div>
              <Button onClick={() => router.push("/login")} className="w-full">
                Go to Login
              </Button>
            </div>
          )}

          {/* Error/Expired State - Only show if not redirecting */}
          {!isInitializing &&
            (status === "error" || status === "expired") &&
            !isRedirecting && (
              <div className="flex flex-col items-center justify-center pt-4 gap-2">
                <XCircle className="h-8 w-8 md:h-10 md:w-10 text-destructive" />
                <h3 className="text-base md:text-lg font-semibold text-center">
                  {status === "expired"
                    ? "Verification Link Expired"
                    : "Verification Failed"}
                </h3>
                <div className="text-muted-foreground text-xs md:text-sm text-center px-2">
                  {status === "expired"
                    ? "This verification link has expired. Please request a new one."
                    : errorMessage || "Invalid or expired verification token."}
                </div>
              </div>
            )}

          {/* Registered State - Just registered */}
          {!isInitializing && status === "registered" && !resendSuccess && (
            <div className="flex flex-col items-center justify-center pt-4 gap-2">
              <h3 className="text-base md:text-lg font-semibold text-center">
                Check Your Email
              </h3>
              <div className="text-muted-foreground text-xs md:text-sm text-center px-2">
                {showRegistrationMessage ? (
                  <>
                    Registration successful! A verification email has been sent
                    to{" "}
                    <span className="font-medium">
                      {email || "your email address"}
                    </span>
                    . Please click the verification link in the email to
                    activate your account.
                  </>
                ) : (
                  <>
                    We&apos;ve sent a verification email to{" "}
                    <span className="font-medium">
                      {email || "your email address"}
                    </span>
                    . Please click the verification link in the email to
                    activate your account.
                  </>
                )}
              </div>
            </div>
          )}

          {/* Idle State - No token provided */}
          {!isInitializing && status === "idle" && !resendSuccess && (
            <div className="flex flex-col items-center justify-center pt-4 gap-2">
              <h3 className="text-base md:text-lg font-semibold text-center">
                Verify Your Email
              </h3>
              <div className="text-muted-foreground text-xs md:text-sm text-center px-2">
                Please check your email and click the verification link. If you
                didn&apos;t receive the email, you can request a new one below.
              </div>
            </div>
          )}

          {/* Resend Form */}
          {(showResendForm || status === "idle" || status === "registered") && (
            <div className="space-y-2 pt-4">
              {/* Only show error message here if it's not a verification error (status !== "error") */}
              {errorMessage && !resendSuccess && status !== "error" && (
                <div className="text-sm text-destructive text-center px-2">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleResend} className="space-y-3" noValidate>
                <div className="space-y-1">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      // Clear error when user starts typing
                      if (emailError) {
                        setEmailError("");
                      }
                    }}
                    disabled={resendMutation.isPending}
                    className={emailError ? "border-destructive" : ""}
                  />
                  {emailError && (
                    <p className="text-sm text-destructive">{emailError}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={resendMutation.isPending}
                >
                  {resendMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-center text-sm text-muted-foreground">
            Already verified?{" "}
            <Link
              href="/login"
              className="text-primary-font hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
