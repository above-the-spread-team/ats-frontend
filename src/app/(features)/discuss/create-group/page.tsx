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
      {/* Create Group Form */}
      <CreateEditGroup groupId={null} />
    </>
  );
}
