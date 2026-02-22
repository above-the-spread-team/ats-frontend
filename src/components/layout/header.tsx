"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/common/theme-toggle";
import ConfirmDialog from "@/components/common/popup";
import Image from "next/image";
import { FaBell } from "react-icons/fa";
import Link from "next/link";
import { User, LogOut, Users } from "lucide-react";
import UserIcon from "@/components/common/user-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurrentUser, useLogout } from "@/services/fastapi/oauth";
import {
  useUnreadCount,
  useNotifications,
} from "@/services/fastapi/notification";
import type { NotificationItem } from "@/type/fastapi/notification";
import { formatTimeAgo } from "@/app/(features)/discuss/_components/comment-item";

export default function Header() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Use React Query to check authentication status
  // If user data exists, user is authenticated (HttpOnly cookie is present)
  const { data: user, error } = useCurrentUser();
  const { data: unreadData } = useUnreadCount();
  // User is authenticated if we have user data and no 401 error
  const authenticated =
    !!user && !(error instanceof Error && error.message.includes("401"));
  const unreadCount = authenticated ? (unreadData?.unread_count ?? 0) : 0;
  const { data: notificationsData } = useNotifications(
    1,
    8,
    true, // unread only
    authenticated,
  );
  const unreadItems = authenticated ? (notificationsData?.items ?? []) : [];

  function formatNotificationMessage(item: NotificationItem): string {
    const sender = item.sender?.username ?? "Someone";
    const type = item.notification_type;
    switch (type) {
      case "like":
        return `${sender} liked your post`;
      case "comment":
        return `${sender} commented on your post`;
      case "follow_request":
        return `${sender} requested to follow a group`;
      case "follow_approved":
        return `You were approved to join a group`;
      case "follow_rejected":
        return `Your request to join a group was declined`;
      case "banned":
        return `You were removed from a group`;
      case "group_deleted":
        return `A group you were in was deleted`;
      default:
        return `${sender} — ${type.replace(/_/g, " ")}`;
    }
  }

  function getNotificationLink(item: NotificationItem): string | null {
    const meta = item.metadata;
    if (!meta) return null;
    if (typeof meta.post_id === "number") return `/discuss/${meta.post_id}`;
    if (typeof meta.group_id === "number")
      return `/discuss/group-posts/${meta.group_id}`;
    return null;
  }

  // Use logout mutation hook from service
  const logoutMutation = useLogout();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

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

      <div className="flex items-center gap-3">
        <ThemeToggle />
        {authenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative inline-flex items-center justify-center p-1 rounded-full hover:bg-white/10 transition-colors outline-none"
                aria-label={
                  unreadCount > 0
                    ? `${unreadCount} unread notifications`
                    : "Notifications"
                }
              >
                <FaBell className="h-5 w-5 text-gray-200 hover:text-primary-active cursor-pointer" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-primary">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 overflow-hidden p-0 flex flex-col"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-3 py-2">
                <span className="text-sm font-semibold text-foreground">
                  Notifications
                </span>
                <Link
                  href="/profile/?tab=notifications"
                  className="text-sm font-semibold text-foreground hover:underline"
                >
                  View all
                </Link>
              </div>
              <ScrollArea className="h-[min(70vh,320px)]">
                {unreadItems.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                    No unread notifications
                  </div>
                ) : (
                  <div className="py-1">
                    {unreadItems.map((item) => {
                      const href = getNotificationLink(item);
                      const showGroupIcon = !!item.group_avatar_url;
                      const content = (
                        <div className="px-3 py-2 flex gap-2 hover:bg-muted/50 cursor-pointer">
                          <UserIcon
                            avatarUrl={
                              showGroupIcon
                                ? item.group_avatar_url
                                : (item.sender?.avatar_url ?? null)
                            }
                            name={
                              showGroupIcon
                                ? "Group"
                                : (item.sender?.username ?? "?")
                            }
                            size="small"
                            variant={
                              showGroupIcon || item.sender ? "primary" : "muted"
                            }
                            className="!h-8 !w-8 ring-1 ring-border/50"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground line-clamp-2">
                              {formatNotificationMessage(item)}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {formatTimeAgo(item.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                      if (href) {
                        return (
                          <Link key={item.id} href={href}>
                            {content}
                          </Link>
                        );
                      }
                      return <div key={item.id}>{content}</div>;
                    })}
                  </div>
                )}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            href="/profile"
            className="relative inline-flex items-center justify-center p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Notifications"
          >
            <FaBell className="h-5 w-5 text-gray-200 hover:text-primary-active cursor-pointer" />
          </Link>
        )}
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
