"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getFixtureGroup } from "@/services/fastapi/groups";
import PostContent from "../../_components/post-content";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

export default function FixturePage() {
  const params = useParams();
  const fixtureIdParam = params["fixture-id"] as string | undefined;
  const fixtureId = fixtureIdParam ? parseInt(fixtureIdParam, 10) : null;
  const validFixtureId =
    fixtureId && !isNaN(fixtureId) && fixtureId > 0 ? fixtureId : null;

  const {
    data: group,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["fixtureGroup", validFixtureId],
    queryFn: () => getFixtureGroup(validFixtureId!),
    enabled: validFixtureId != null,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (!validFixtureId) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageCircle className="w-8 h-8 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-sm">Invalid fixture ID.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageCircle className="w-8 h-8 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm font-semibold mb-1">No discussion found</p>
          <p className="text-muted-foreground text-sm">
            This fixture does not have a discussion group yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <PostContent groupId={group.id} />;
}
