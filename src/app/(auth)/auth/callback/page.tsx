"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/services/fastapi/oauth";
import { exchangeOAuthCode } from "@/services/fastapi/oauth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import Loading from "@/components/common/loading";
import { Suspense } from "react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  // Track whether the exchange has been attempted so we don't fire it twice
  const exchangeAttempted = useRef(false);

  // Strategy:
  // 1. Backend redirects here as /auth/callback?code=<short-lived-code>
  // 2. We POST the code to /api/auth/exchange-token to receive the JWT in the
  //    response body — this works on Safari where HttpOnly cookies are blocked.
  // 3. Chrome/Firefox also receive the cookie set by the exchange endpoint, so
  //    both paths end up authenticated.
  // 4. If no ?code= is present (unexpected), fall through to useCurrentUser
  //    which will read the cookie (non-Safari only).
  useEffect(() => {
    if (exchangeAttempted.current) return;
    exchangeAttempted.current = true;

    const code = searchParams.get("code");

    if (!code) {
      // No exchange code — cookie-only path (non-Safari browsers in edge cases)
      // useCurrentUser below will handle this.
      return;
    }

    // Clean code from URL immediately so refresh/back doesn't replay it
    window.history.replaceState({}, "", window.location.pathname);

    exchangeOAuthCode(code)
      .then((data) => {
        // Seed the React Query cache so useCurrentUser returns immediately
        queryClient.setQueryData(["currentUser"], data.user);
        // Clear vote cache so the new account's vote state is fetched fresh
        queryClient.removeQueries({ queryKey: ["votes"] });
        queryClient.removeQueries({ queryKey: ["popup", "vote-today"] });
        setStatus("success");
        setTimeout(() => router.push("/"), 1500);
      })
      .catch((err) => {
        setStatus("error");
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Failed to complete authentication"
        );
      });
  }, [searchParams, router, queryClient]);

  // Cookie fallback: if no ?code= was present the exchange effect is a no-op,
  // and this query reads the HttpOnly cookie (Chrome/Firefox only).
  const { data: user, isLoading, error } = useCurrentUser({
    // Only run if exchange didn't already succeed
    enabled: status === "loading",
  });

  useEffect(() => {
    if (status !== "loading") return;
    if (isLoading) return;

    if (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to complete authentication"
      );
      return;
    }

    if (user) {
      queryClient.removeQueries({ queryKey: ["votes"] });
      queryClient.removeQueries({ queryKey: ["popup", "vote-today"] });
      setStatus("success");
      setTimeout(() => router.push("/"), 1500);
    }
  }, [user, isLoading, error, status, router, queryClient]);

  return (
    <>
      <div className="w-full max-w-md px-4">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold">
              {status === "loading" && "Completing authentication..."}
              {status === "success" && "Authentication successful!"}
              {status === "error" && "Authentication failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4">
            {status === "loading" && (
              <>
                <div className="mb-4">
                  <Loading />
                </div>
                <p className="text-muted-foreground">
                  Please wait while we complete your login...
                </p>
              </>
            )}
            {status === "success" && (
              <>
                <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10 text-bar-green mb-4" />
                <p className="text-muted-foreground">
                  Redirecting you to the home page...
                </p>
              </>
            )}
            {status === "error" && (
              <>
                <XCircle className="h-8 w-8 md:h-10 md:w-10 text-bar-red mb-4" />
                <p className="text-destructive text-center mb-4">
                  {errorMessage}
                </p>
                <button
                  onClick={() => router.push("/login")}
                  className="text-primary hover:underline"
                >
                  Return to login page
                </button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md px-4">
          <Card className="shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-4">
              <Loading />
            </CardContent>
          </Card>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
