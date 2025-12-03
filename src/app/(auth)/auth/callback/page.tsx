"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/services/fastapi/oauth";
import FullPage from "@/components/common/full-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Backend sets HttpOnly cookie during redirect, so we verify by fetching user
  const { data: user, isLoading, error } = useCurrentUser();

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
          <CardContent className="flex flex-col items-center justify-center py-8">
            {status === "loading" && (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">
                  Please wait while we complete your login...
                </p>
              </>
            )}
            {status === "success" && (
              <>
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 mb-4" />
                <p className="text-muted-foreground">
                  Redirecting you to the home page...
                </p>
              </>
            )}
            {status === "error" && (
              <>
                <XCircle className="h-12 w-12 text-destructive mb-4" />
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
