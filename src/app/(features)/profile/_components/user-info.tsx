"use client";

import {
  Mail,
  Calendar,
  CheckCircle2,
  FileText,
  Users,
  MessageCircle,
  Heart,
  Shield,
  Clock,
  CircleDot,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import UserIcon from "@/components/common/user-icon";
import type { User, UserPublicResponse } from "@/type/fastapi/user";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

/** Optional stats to show when we have User (e.g. from GET /users/{id}) for "my profile". */
export interface UserStats {
  post_count: number;
  group_count: number;
  comment_count: number;
  total_likes: number;
}

/** Full user has email/email_verified/role/etc.; public profile has counts. */
export interface UserInfoProps {
  user: User | UserPublicResponse;
  /** When true (default for User with email), show email and verified status. Omit for public profiles. */
  showEmail?: boolean;
  /** Optional counts (e.g. from GET /users/{id}) when showing full User so "my profile" can show stats. */
  stats?: UserStats;
}

function isFullUser(user: User | UserPublicResponse): user is User {
  return "email" in user;
}

function InfoRow({
  icon: Icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "mt-0.5 text-sm font-medium text-foreground",
            valueClassName,
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export default function UserInfo({ user, showEmail, stats }: UserInfoProps) {
  const fullUser = isFullUser(user) ? user : null;
  const publicUser = "post_count" in user ? user : null;
  const statsToShow = publicUser ?? stats;

  const hasEmail = fullUser && fullUser.email != null;
  const showEmailSection = showEmail !== false && hasEmail;
  const emailVerified =
    fullUser && "email_verified" in fullUser
      ? fullUser.email_verified
      : undefined;

  return (
    <div className="space-y-6">
      {/* Profile header: avatar + name + badge */}
      <Card className="overflow-hidden border-border/50 bg-card shadow-sm">
        <div className="relative bg-gradient-to-br from-primary-font/5 via-transparent to-primary-font/10  px-4 py-2">
          <div className="flex flex-col items-center py-2 px-2 gap-4 text-center sm:flex-row sm:items-center sm:text-left">
            <div className="relative shrink-0">
              <div className="ring-primary/20 flex overflow-hidden rounded-full ring-4 ring-offset-4 ring-offset-card">
                <UserIcon
                  avatarUrl={user.avatar_url}
                  name={user.username}
                  size="large"
                  variant="primary"
                  className="h-16 w-16 sm:h-28 sm:w-28"
                />
              </div>
              {fullUser && "is_active" in fullUser && fullUser.is_active && (
                <span
                  className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-card"
                  title="Active"
                />
              )}
            </div>
            <div className="sm:pb-1">
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {user.username}
              </h1>

              {showEmailSection && emailVerified !== undefined && (
                <span
                  className={cn(
                    "mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    emailVerified
                      ? "bg-green-500/10 text-green-700 dark:text-green-400/90"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-400/90",
                  )}
                >
                  {emailVerified ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Mail className="h-3.5 w-3.5" />
                  )}
                  {emailVerified ? "Email verified" : "Email not verified"}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Details & Activity in one block */}
      <div className="p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Details
        </p>
        <div className="divide-y divide-border/60">
          {showEmailSection && fullUser && (
            <InfoRow
              icon={Mail}
              label="Email"
              value={<span className="truncate">{fullUser.email}</span>}
            />
          )}
          <InfoRow
            icon={Calendar}
            label="Joined"
            value={formatDate(user.created_at)}
          />
          {fullUser?.role && (
            <InfoRow
              icon={Shield}
              label="Role"
              value={<span className="capitalize">{fullUser.role}</span>}
            />
          )}
          {fullUser?.updated_at && (
            <InfoRow
              icon={Clock}
              label="Last updated"
              value={formatDateTime(fullUser.updated_at)}
            />
          )}
          {fullUser && "is_active" in fullUser && (
            <InfoRow
              icon={CircleDot}
              label="Status"
              value={
                <span
                  className={
                    fullUser.is_active
                      ? "text-green-600 dark:text-green-400"
                      : "text-muted-foreground"
                  }
                >
                  {fullUser.is_active ? "Active" : "Inactive"}
                </span>
              }
            />
          )}
        </div>
        {statsToShow && (
          <>
            <p className="mb-3 mt-6 md:mt-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Activity
            </p>
            <div className="divide-y divide-border/60">
              <InfoRow
                icon={FileText}
                label="Posts"
                value={
                  <span className="tabular-nums">{statsToShow.post_count}</span>
                }
              />
              <InfoRow
                icon={Users}
                label="Groups"
                value={
                  <span className="tabular-nums">
                    {statsToShow.group_count}
                  </span>
                }
              />
              <InfoRow
                icon={MessageCircle}
                label="Comments"
                value={
                  <span className="tabular-nums">
                    {statsToShow.comment_count}
                  </span>
                }
              />
              <InfoRow
                icon={Heart}
                label="Likes received"
                value={
                  <span className="tabular-nums">
                    {statsToShow.total_likes}
                  </span>
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
