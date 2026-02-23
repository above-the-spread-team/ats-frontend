"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { NotificationBell } from "@/components/common/notification";
import ConfirmDialog from "@/components/common/popup";
import Image from "next/image";
import Link from "next/link";
import { User, LogOut, Menu } from "lucide-react";
import UserIcon from "@/components/common/user-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser, useLogout } from "@/services/fastapi/oauth";
import { useSidebar } from "@/app/(features)/discuss/_contexts/sidebar-context";

export default function Header() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Use React Query to check authentication status
  // If user data exists, user is authenticated (HttpOnly cookie is present)
  const { data: user, error } = useCurrentUser();
  // User is authenticated if we have user data and no 401 error
  const authenticated =
    !!user && !(error instanceof Error && error.message.includes("401"));

  // Use logout mutation hook from service
  const logoutMutation = useLogout();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { toggleSidebar } = useSidebar();

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

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  // Listen for logout event to clear user data immediately
  useEffect(() => {
    const handleLogout = () => {
      // Cancel any ongoing queries first
      queryClient.cancelQueries({ queryKey: ["currentUser"] });

      // Reset query state completely - this clears data and resets status
      // This ensures components see the change immediately
      queryClient.resetQueries({
        queryKey: ["currentUser"],
        exact: true,
      });

      // Set data to undefined to ensure UI updates
      queryClient.setQueryData(["currentUser"], undefined);

      // Invalidate to mark as stale and trigger refetch
      // The refetch will get 401 and properly update the error state
      queryClient.invalidateQueries({
        queryKey: ["currentUser"],
        refetchType: "active",
      });
    };

    window.addEventListener("logout", handleLogout);
    return () => {
      window.removeEventListener("logout", handleLogout);
    };
  }, [queryClient]);

  return (
    <div className="flex justify-between  items-center px-4 md:px-6 h-12 md:h-14  bg-primary">
      {/* Hamburger menu */}
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="outline-none">
          <Menu className="w-6 h-6 text-white" />
        </button>
        <Link
          href="/"
          className="cursor-pointer gap-2 flex flex-row justify-center items-center "
        >
          <Image
            src="/images/logo.png"
            alt="Above The Spread"
            width={600}
            height={600}
            className="w-8"
          />
          <Image
            src="/images/ats-full.png"
            alt="Above The Spread"
            width={600}
            height={600}
            className="w-48 max-h-8 mt-2 hidden md:block "
          />
          <Image
            src="/images/ats.png"
            alt="Above The Spread"
            width={600}
            height={600}
            className="w-14 max-h-8  mt-1 block md:hidden "
          />
        </Link>
        <Link href="/" className="cursor-pointer md:hidden "></Link>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <NotificationBell authenticated={authenticated} />
        {authenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="outline-none">
                <div className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-white/20 transition-all rounded-full">
                  <UserIcon
                    avatarUrl={user?.avatar_url}
                    name={user?.username || "User"}
                    size="small"
                    variant="primary"
                    className="ring-2 !w-8 !h-8 ring-transparent hover:ring-white/20 transition-all"
                  />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogoutClick}
                className="cursor-pointer text-destructive-foreground hover:text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            href="/login"
            className="text-mygray font-bold text-sm hover:underline"
          >
            Login
          </Link>
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogout}
        title="Sign Out"
        description="Are you sure you want to sign out? You will need to log in again to access your account."
        confirmText="Sign out"
        isPending={logoutMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
