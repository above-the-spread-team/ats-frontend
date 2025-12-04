"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  useResendVerification,
  useVerifyEmail,
} from "@/services/fastapi/user-email";
import StatusMessage from "./_components/status-message";
import ResendVerificationForm from "./_components/resend-verification-form";
import VerificationCard, {
  VerificationCardFooter,
} from "./_components/verification-card";

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
  const [showResendForm, setShowResendForm] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [showRegistrationMessage, setShowRegistrationMessage] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    console.log("status", status);
  }, [status]);

  // No longer needed - backend returns 200 JSON instead of redirect

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
    } else if (!token && status === "idle" && !isRedirecting) {
      // No token, show idle state (user can enter email to resend)
      setStatus("idle");
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

    if (!email) {
      setErrorMessage("Please enter your email address");
      return;
    }

    resendMutation.mutate(email, {
      onSuccess: () => {
        setResendSuccess(true);
        setErrorMessage("");
        // Hide form after 3 seconds
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
      <VerificationCard title="Email Verification">
        <StatusMessage
          variant="loading"
          title=""
          message="Email verified! Logging you in..."
        />
      </VerificationCard>
    );
  }

  return (
    <VerificationCard
      title="Email Verification"
      footer={<VerificationCardFooter />}
    >
      {/* Verifying State */}
      {status === "verifying" && !isRedirecting && (
        <StatusMessage
          variant="loading"
          title=""
          message="Verifying your email address..."
        />
      )}

      {/* Success State */}
      {status === "success" && (
        <StatusMessage
          variant="success"
          icon={CheckCircle2}
          title="Email Verified Successfully!"
          message="Your email address has been verified. Redirecting you to the home page..."
          actionButton={{
            label: "Go to Home",
            onClick: () => router.push("/"),
          }}
        />
      )}

      {/* Already Verified State */}
      {status === "already-verified" && (
        <StatusMessage
          variant="success"
          icon={CheckCircle2}
          title="Email Already Verified"
          message="Your email address has already been verified. You can log in to your account."
          actionButton={{
            label: "Go to Login",
            onClick: () => router.push("/login"),
          }}
        />
      )}

      {/* Error/Expired State - Only show if not redirecting */}
      {(status === "error" || status === "expired") && !isRedirecting && (
        <StatusMessage
          variant="error"
          icon={XCircle}
          title={
            status === "expired"
              ? "Verification Link Expired"
              : "Verification Failed"
          }
          message={
            status === "expired"
              ? "This verification link has expired. Please request a new one."
              : errorMessage || "Invalid or expired verification token."
          }
        />
      )}

      {/* Registered State - Just registered */}
      {status === "registered" && (
        <StatusMessage
          variant="info"
          title="Check Your Email"
          message={
            <>
              We&apos;ve sent a verification email to{" "}
              <span className="font-medium">
                {email || "your email address"}
              </span>
              . Please click the verification link in the email to activate your
              account.
            </>
          }
        />
      )}

      {/* Idle State - No token provided */}
      {status === "idle" && (
        <StatusMessage
          variant="info"
          title="Verify Your Email"
          message="Please check your email and click the verification link. If you didn't receive the email, you can request a new one below."
        />
      )}

      {/* Resend Form */}
      {(showResendForm || status === "idle" || status === "registered") && (
        <ResendVerificationForm
          email={email}
          onEmailChange={setEmail}
          onSubmit={handleResend}
          isPending={resendMutation.isPending}
          showRegistrationMessage={showRegistrationMessage}
          resendSuccess={resendSuccess}
          errorMessage={errorMessage}
        />
      )}
    </VerificationCard>
  );
}
