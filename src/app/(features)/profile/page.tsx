"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  CheckCircle2,
  XCircle,
  Upload,
  Loader2,
  Calendar,
} from "lucide-react";
import { useCurrentUser } from "@/services/fastapi/oauth";
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
import { Skeleton } from "@/components/ui/skeleton";
import UserDetailItem from "@/app/(features)/profile/_components/user-detail-item";
import UserDetailItemSkeleton from "@/app/(features)/profile/_components/user-detail-item-skeleton";
import UserIcon from "@/components/common/user-icon";

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

  // Use upload icon mutation hook
  const uploadIconMutation = useUploadUserIcon();

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
      <FullPage minusHeight={80}>
        <div className="w-full mx-auto max-w-5xl px-4 py-4 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 md:h-8 w-24" />
            <Skeleton className="h-9 w-20" />
          </div>
          {/* Avatar and Username Skeleton */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Skeleton className="h-20 w-20 md:h-24 md:w-24 rounded-full" />
              <Skeleton className="absolute -bottom-1 -right-2 h-8 w-8 rounded-full" />
            </div>
            <div className="text-center space-y-2">
              <Skeleton className="h-6 md:h-7 w-32 mx-auto" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </div>
          </div>
          {/* User Details Skeleton */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <UserDetailItemSkeleton />
            <UserDetailItemSkeleton />
            <UserDetailItemSkeleton />
            <UserDetailItemSkeleton />
          </div>
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

  return (
    <FullPage minusHeight={80}>
      <div className="w-full mx-auto max-w-5xl px-4 py-4 space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-primary-title">
            Profile
          </h1>
          {/* make the logout button here */}
        </div>
        {/* Avatar and Username */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <div className="h-20 w-20 md:h-28 md:w-28 cursor-pointer ring-2 ring-transparent group-hover:ring-primary/20 transition-all rounded-full">
              <UserIcon
                avatarUrl={previewUrl || user.avatar_url}
                name={user.username}
                size="large"
                variant="primary"
                className="h-20 w-20 md:h-28 md:w-28 text-2xl md:text-3xl ring-2 ring-transparent group-hover:ring-primary/20 transition-all"
              />
            </div>
            <button
              onClick={handleAvatarClick}
              disabled={uploadIconMutation.isPending}
              className="absolute -bottom-1 -right-2 p-2 bg-bar-green text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            <h2 className="text-lg md:text-xl font-bold">{user.username}</h2>
            {user.email_verified && (
              <div className="flex items-center justify-center gap-1 mt-1 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary-font" />
                <span>Verified</span>
              </div>
            )}
          </div>
        </div>
        {/* User Details */}
        <div className=" p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <UserDetailItem
            icon={Mail}
            label="Email"
            value={user.email}
            warning={!user.email_verified ? "Email not verified" : undefined}
          />

          <UserDetailItem icon={User} label="Username" value={user.username} />

          <UserDetailItem
            icon={user.is_active ? CheckCircle2 : XCircle}
            label="Account Status"
            value={user.is_active ? "Active" : "Inactive"}
            valueClassName={user.is_active ? "text-bar-green" : "text-bar-red"}
            iconClassName={user.is_active ? "text-bar-green" : "text-bar-red"}
          />

          <UserDetailItem
            icon={Calendar}
            label="Member Since"
            value={formatDate(user.created_at)}
          />
        </div>
      </div>
    </FullPage>
  );
}
