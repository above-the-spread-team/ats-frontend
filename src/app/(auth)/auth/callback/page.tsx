"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/services/fastapi/oauth";
import { storeToken } from "@/services/fastapi/token-storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import Loading from "@/components/common/loading";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [tokenExtracted, setTokenExtracted] = useState(false);

  // Extract token from URL hash for Safari compatibility
  // Backend redirects with token in hash: #token=eyJhbGc...
  // This MUST happen before useCurrentUser() tries to fetch
  useEffect(() => {
    // Extract token synchronously on mount
    const hash = window.location.hash.substring(1); // Remove the #
    console.log("Callback page - URL hash:", hash);
    console.log("Callback page - Full URL:", window.location.href);

    if (hash) {
      const params = new URLSearchParams(hash);
      const token = params.get("token");

      console.log(
        "Callback page - Token from hash:",
        token ? "Found" : "Not found"
      );

      if (token) {
        // Store token in localStorage for Safari compatibility
        storeToken(token);
        console.log("Token extracted from URL hash and stored in localStorage");

        // Clean up URL - remove hash fragment
        window.history.replaceState({}, "", window.location.pathname);
      } else {
        console.warn("No token found in URL hash. Hash content:", hash);
      }
    } else {
      console.warn("No hash found in URL");
    }

    // Mark as extracted (even if no token found) - this allows query to run
    setTokenExtracted(true);
  }, []);

  // Backend sets HttpOnly cookie during redirect, but Safari blocks it
  // So we use the token from localStorage (extracted from hash) for Safari
  // Only fetch user after token extraction is complete
  const {
    data: user,
    isLoading,
    error,
  } = useCurrentUser({
    enabled: tokenExtracted, // Only run query after token is extracted
  });

  useEffect(() => {
    if (isLoading) {
      setStatus("loading");
      return;
    }

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
      setStatus("success");
      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push("/");
      }, 1500);
    }
  }, [user, isLoading, error, router]);

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
