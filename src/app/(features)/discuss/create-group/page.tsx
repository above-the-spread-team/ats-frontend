"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useCurrentUser } from "@/services/fastapi/oauth";
import CreateEditGroup from "../_components/create-edit-group";

export default function CreateGroupPage() {
  const router = useRouter();
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoadingUser && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, isLoadingUser, router]);

  // Show loading or nothing while checking auth
  if (isLoadingUser || !currentUser) {
    return null;
  }

  return (
    <>
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/discuss")}
        className="mb-0"
      >
        <ArrowLeft className="w-4 h-4 text-muted-foreground mr-1" />
        <p className="text-xs md:text-sm text-muted-foreground font-medium">
          Back to Discussion
        </p>
      </Button>

      {/* Create Group Form */}
      <CreateEditGroup groupId={null} />
    </>
  );
}
