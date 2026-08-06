"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { CheckCircle2, XCircle, Mail, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
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

function EmailVerifyForm() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerification();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "verifying" | "success" | "error" | "expired" | "registered"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showResendForm, setShowResendForm] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [showRegistrationMessage, setShowRegistrationMessage] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const redirectTimeoutRef = useRef<number | null>(null);

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
            setStatus("success");
            if (redirectTimeoutRef.current) {
              window.clearTimeout(redirectTimeoutRef.current);
            }
            redirectTimeoutRef.current = window.setTimeout(() => {
              // Prevent error states
              setIsRedirecting(true);
              // Invalidate query to refetch user data with the new cookie
              queryClient.invalidateQueries({ queryKey: ["currentUser"] });
              // Redirect to home page after showing success UI
              window.location.href = "/";
            }, 2000);
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
            // Show error UI with guidance
            setStatus("error");
            setErrorMessage("Email already verified. Please sign in.");
            setShowResendForm(false);
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

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

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
        // Clear error status when resend succeeds
        if (status === "error" || status === "expired") {
          setStatus("idle");
        }
        // Keep form visible - don't hide it
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
      <div className="w-full  max-w-md px-4 z-10">
        <Card className="shadow-lg bg-card/80">
          <CardContent className="">
            <div className="flex flex-col items-center justify-center pt-4 gap-2">
              <Loading />
              <h3 className="text-base md:text-lg font-semibold text-center"></h3>
              <div className="text-muted-foreground text-xs md:text-sm text-center px-2">
                {t("emailVerifiedLoggingIn")}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full  max-w-md px-4 z-10">
      <Card className="shadow-lg bg-card/80">
        <CardContent className="">
          {/* Initial Loading State - Show while checking token/params */}
          {isInitializing && (
            <div className="flex flex-col items-center justify-center pt-4 gap-2">
              <Loading />
              <h3 className="text-base md:text-lg font-semibold text-center"></h3>
              <div className="text-muted-foreground text-xs md:text-sm text-center px-2">
                {t("checkingStatus")}
              </div>
            </div>
          )}

          {/* Verifying State */}
          {!isInitializing && status === "verifying" && !isRedirecting && (
            <div className="flex flex-col items-center justify-center pt-4 gap-2">
              <Loading />
              <h3 className="text-base md:text-lg font-semibold text-center"></h3>
              <div className="text-muted-foreground text-xs md:text-sm text-center px-2">
                {t("verifying")}
              </div>
            </div>
          )}

          {/* Resend Success State - Show when email is sent successfully (highest priority) */}
          {!isInitializing && resendSuccess && (
            <div className="flex flex-col items-center justify-center pt-4 gap-2">
              <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10 text-bar-green" />
              <h3 className="text-base md:text-lg font-semibold text-center">
                {t("verificationEmailSent")}
              </h3>
              <div className="text-muted-foreground text-xs md:text-sm text-center px-2">
                {t("checkInbox", { email: email || "your email address" })}
              </div>
            </div>
          )}

          {/* Success State - Only show if resendSuccess is false */}
          {!isInitializing && status === "success" && !resendSuccess && (
            <div className="flex flex-col items-center justify-center pt-4 gap-2">
              <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10 text-bar-green" />
              <h3 className="text-base md:text-lg font-semibold text-center">
                {t("emailVerified")}
              </h3>
              <div className="text-muted-foreground text-xs md:text-sm text-center px-2">
                {t("emailVerifiedMsg")}
              </div>
              <Button onClick={() => router.push("/")} className="w-full">
                {tc("goToHome")}
              </Button>
            </div>
          )}

          {/* Error/Expired State - Only show if not redirecting and resendSuccess is false */}
          {!isInitializing &&
            (status === "error" || status === "expired") &&
            !isRedirecting &&
            !resendSuccess && (
              <div className="flex flex-col items-center justify-center pt-4 gap-2">
                <XCircle className="h-8 w-8 md:h-10 md:w-10 text-bar-red" />
                <h3 className="text-base md:text-lg font-semibold text-center">
                  {status === "expired"
                    ? t("verificationExpired")
                    : t("verificationFailed")}
                </h3>
                <div className="text-muted-foreground text-xs md:text-sm text-center px-2">
                  {status === "expired"
                    ? t("verificationExpiredMsg")
                    : errorMessage || t("invalidTokenMsg")}
                </div>
              </div>
            )}

          {/* Registered State - Just registered - Only show if resendSuccess is false */}
          {!isInitializing && status === "registered" && !resendSuccess && (
            <div className="flex flex-col items-center justify-center pt-4 gap-2">
              <h3 className="text-base md:text-lg font-semibold text-center">
                {t("checkYourEmail")}
              </h3>
              <div className="text-muted-foreground text-xs md:text-sm text-center px-2">
                {showRegistrationMessage ? (
                  <>
                    {t("registrationSuccess", { email: email || "your email address" })}
                  </>
                ) : (
                  <>
                    {t("emailSentTo", { email: email || "your email address" })}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Idle State - No token provided - Only show if resendSuccess is false */}
          {!isInitializing && status === "idle" && !resendSuccess && (
            <div className="flex flex-col items-center justify-center pt-4 gap-2">
              <h3 className="text-base md:text-lg font-semibold text-center">
                {t("verifyEmail")}
              </h3>
              <div className="text-muted-foreground text-xs md:text-sm text-center px-2">
                {t("verifyEmailMsg")}
              </div>
            </div>
          )}

          {/* Resend Form - Keep visible even after resend success */}
          {(showResendForm || status === "idle" || status === "registered") && (
            <div className="space-y-2 pt-4">
              {/* Only show error message here if it's not a verification error and resendSuccess is false */}
              {errorMessage &&
                !resendSuccess &&
                status !== "error" &&
                status !== "expired" && (
                  <div className="text-sm text-destructive-foreground text-center px-2">
                    {errorMessage}
                  </div>
                )}

              <form onSubmit={handleResend} className="space-y-3" noValidate>
                <div className="space-y-1">
                  <Label htmlFor="email">{t("emailLabel")}</Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder={t("emailPlaceholder")}
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
                    <p className="text-sm text-destructive-foreground">
                      {emailError}
                    </p>
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
                      {t("sending")}
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      {t("resendVerification")}
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-center text-sm text-muted-foreground">
            {t("alreadyVerified")}{" "}
            <Link
              href="/login"
              className="text-primary-font hover:underline font-medium"
            >
              {t("signInLink")}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function EmailVerifyPage() {
  const tc = useTranslations("common");
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md px-4 z-10">
          <Card className="shadow-lg bg-card/80">
            <CardContent>
              <div className="flex flex-col items-center justify-center pt-4 gap-2">
                <Loading />
                <div className="text-muted-foreground text-xs md:text-sm text-center px-2">
                  {tc("loading")}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <EmailVerifyForm />
    </Suspense>
  );
}
