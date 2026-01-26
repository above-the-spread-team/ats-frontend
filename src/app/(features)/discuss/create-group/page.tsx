"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import FullPage from "@/components/common/full-page";
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
    <FullPage minusHeight={70}>
      <div className="container mx-auto py-4 md:py-6 max-w-2xl px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/discuss")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground mr-2" />
          <p className="text-xs md:text-sm text-muted-foreground font-medium">
            Back to Discussion
          </p>
        </Button>

        {/* Create Group Form */}
        <CreateEditGroup groupId={null} />
      </div>
    </FullPage>
  );
}
