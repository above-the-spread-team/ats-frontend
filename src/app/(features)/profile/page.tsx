"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  CheckCircle2,
  XCircle,
  LogOut,
  Upload,
  Loader2,
} from "lucide-react";
import { useCurrentUser, useLogout } from "@/services/fastapi/oauth";
import { useUploadUserIcon } from "@/services/fastapi/user-email";
import FullPage from "@/components/common/full-page";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function MePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch user data using React Query hook from service
  // Backend reads token from HttpOnly cookie automatically
  const { data: user, isLoading, error } = useCurrentUser();

  // Redirect to login if not authenticated (401 error)
  useEffect(() => {
    if (error && error instanceof Error && error.message.includes("401")) {
      router.push("/login");
    }
  }, [error, router]);

  // Use logout mutation hook from service
  const logoutMutation = useLogout();

  // Use upload icon mutation hook
  const uploadIconMutation = useUploadUserIcon();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      // Wait a bit to ensure cache is cleared before redirect
      await new Promise((resolve) => setTimeout(resolve, 100));
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect even if logout API call fails
      router.push("/login");
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadIconMutation.mutateAsync(selectedFile);
      // Clear preview and selected file after successful upload
      setPreviewUrl(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      // Error is handled by the mutation, but we can show an alert too
      alert(error instanceof Error ? error.message : "Failed to upload image");
    }
  };

  const handleCancelUpload = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Show loading state
  if (isLoading) {
    return (
      <FullPage center minusHeight={110} className="py-10">
        <div className="w-full max-w-2xl px-4">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <Skeleton className="h-8 w-32 mx-auto mb-4" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </FullPage>
    );
  }

  // Show error state
  if (error) {
    return (
      <FullPage center minusHeight={110} className="py-10">
        <div className="w-full max-w-2xl px-4">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold">Error</CardTitle>
              <CardDescription>Failed to load user information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <XCircle className="h-12 w-12 text-destructive-foreground" />
                <p className="text-destructive-foreground text-center">
                  {error instanceof Error
                    ? error.message
                    : "An unexpected error occurred"}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="flex-1"
                >
                  Go to Login
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </FullPage>
    );
  }

  // Show user info
  if (!user) {
    return null;
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getInitials = (username: string) => {
    return username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <FullPage center minusHeight={110} className="py-10">
      <div className="w-full max-w-2xl px-4">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl md:text-2xl font-bold">
              Profile
            </CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar and Username */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 cursor-pointer ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                  {previewUrl ? (
                    <AvatarImage
                      src={previewUrl}
                      alt={user.username}
                      className="object-cover"
                    />
                  ) : user.avatar_url ? (
                    <AvatarImage
                      src={user.avatar_url}
                      alt={user.username}
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="text-2xl md:text-3xl font-bold bg-primary/10 text-primary">
                    {getInitials(user.username)}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={handleAvatarClick}
                  disabled={uploadIconMutation.isPending}
                  className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Change avatar"
                >
                  {uploadIconMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              {previewUrl && (
                <div className="flex gap-2 w-full max-w-xs">
                  <Button
                    onClick={handleUpload}
                    disabled={uploadIconMutation.isPending}
                    className="flex-1"
                    size="sm"
                  >
                    {uploadIconMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload"
                    )}
                  </Button>
                  <Button
                    onClick={handleCancelUpload}
                    disabled={uploadIconMutation.isPending}
                    variant="outline"
                    className="flex-1"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              )}
              {uploadIconMutation.error && (
                <p className="text-sm text-destructive text-center">
                  {uploadIconMutation.error instanceof Error
                    ? uploadIconMutation.error.message
                    : "Failed to upload image"}
                </p>
              )}
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold">
                  {user.username}
                </h2>
                {user.email_verified && (
                  <div className="flex items-center justify-center gap-1 mt-1 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span>Verified</span>
                  </div>
                )}
              </div>
            </div>

            {/* User Details */}
            <div className="space-y-3">
              {/* Email */}
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-base font-semibold break-words">
                    {user.email}
                  </p>
                  {!user.email_verified && (
                    <p className="text-xs text-destructive-foreground mt-1">
                      Email not verified
                    </p>
                  )}
                </div>
              </div>

              {/* Username */}
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <User className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">
                    Username
                  </p>
                  <p className="text-base font-semibold break-words">
                    {user.username}
                  </p>
                </div>
              </div>

              {/* Account Status */}
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                {user.is_active ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive-foreground mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">
                    Account Status
                  </p>
                  <p
                    className={`text-base font-semibold ${
                      user.is_active
                        ? "text-green-600 dark:text-green-400"
                        : "text-destructive"
                    }`}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <User className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">
                    Member Since
                  </p>
                  <p className="text-base font-semibold">
                    {formatDate(user.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full text-white"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </FullPage>
  );
}
