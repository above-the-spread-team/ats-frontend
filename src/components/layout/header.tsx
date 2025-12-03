"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/common/theme-toggle";
import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUser } from "@/services/fastapi/oauth";

export default function Header() {
  const queryClient = useQueryClient();

  // Use React Query to check authentication status
  // If user data exists, user is authenticated (HttpOnly cookie is present)
  const { data: user, error } = useCurrentUser();
  // User is authenticated if we have user data and no 401 error
  const authenticated =
    !!user && !(error instanceof Error && error.message.includes("401"));

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

  const getInitials = (username: string) => {
    return username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
          <Link href="/profile">
            <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-white/20 transition-all">
              {user?.avatar_url ? (
                <AvatarImage
                  src={user.avatar_url}
                  alt={user.username || "User"}
                />
              ) : null}
              <AvatarFallback className="bg-primary-active text-white text-sm font-semibold">
                {user?.username ? (
                  getInitials(user.username)
                ) : (
                  <User className="h-4 w-4" />
                )}
              </AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-mygray font-bold text-sm hover:underline"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
