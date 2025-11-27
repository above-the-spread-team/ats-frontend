"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock8,
  Users,
  BarChart3,
  Activity,
  User,
  Brain,
} from "lucide-react";
import FullPage from "@/components/common/full-page";
import Nav, { NavTab } from "@/components/common/nav";
import { Skeleton } from "@/components/ui/skeleton";
import FixtureDetail from "./_components/fixture-detail";
import Lineups from "./_components/lineups";
import FixtureStatistics from "./_components/fixture-statistics";
import Events from "./_components/events";
import FixturePlayers from "./_components/fixture-players";
import Predictions from "./_components/predictions";
import { useFixture } from "@/services/fixtures";
import { getFixtureStatus } from "@/data/fixture-status";

type TabType = "lineups" | "statistics" | "events" | "players" | "predictions";

function GameDetailSkeleton() {
  return (
    <FullPage minusHeight={0}>
      {/* Header Skeleton */}
      <div className="flex items-center justify-between my-2 container mx-auto max-w-4xl px-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-6 w-32" />
      </div>

      {/* Fixture Detail Skeleton */}
      <div className="container mx-auto max-w-5xl px-1">
        <div className="space-y-0 flex flex-col items-center justify-center gap-1 md:gap-2">
          {/* League Header Skeleton */}
          <div className="flex items-center justify-center gap-3">
            <Skeleton className="w-6 h-6 rounded-md" />
            <Skeleton className="h-5 w-48 md:w-56" />
          </div>

          {/* Date & Time Skeleton */}
          <div className="space-y-1 text-center">
            <Skeleton className="h-3 md:h-4 w-40 md:w-48 mx-auto" />
            <Skeleton className="h-4 md:h-5 w-20 md:w-24 mx-auto" />
          </div>

          {/* Teams & Score Skeleton */}
          <div className="w-[270px] md:w-full max-w-lg grid grid-cols-7  ">
            {/* Home Team */}
            <div className="col-span-3 flex flex-col-reverse md:flex-row items-center gap-3 md:gap-4">
              <Skeleton className="h-3 md:h-4 w-24 md:w-32" />
              <Skeleton className="w-10 h-10 md:w-16 md:h-16 rounded-md" />
            </div>

            {/* Score/VS */}
            <div className="col-span-1 flex flex-col items-center justify-center gap-2">
              <Skeleton className="h-8 md:h-9 w-16 md:w-20" />
              <Skeleton className="h-3 w-12 md:w-16" />
            </div>

            {/* Away Team */}
            <div className="col-span-3 flex flex-col md:flex-row items-center gap-3 md:gap-4 justify-end">
              <Skeleton className="w-10 h-10 md:w-16 md:h-16 rounded-md" />
              <Skeleton className="h-3 md:h-4 w-24 md:w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation Skeleton */}
      <div className="mt-6 mb-6 max-w-4xl mx-auto px-2">
        <div className="flex items-center justify-between gap-1">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-10 flex-1 rounded-md" />
          ))}
        </div>
      </div>
    </FullPage>
  );
}

function GameDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fixtureIdParam = searchParams.get("id");
  const dateParam = searchParams.get("date");

  // Parse fixture ID
  const fixtureId = fixtureIdParam ? parseInt(fixtureIdParam, 10) : null;

  // Get tab from URL or default to predictions
  const tabParam = searchParams.get("tab") as TabType;
  const [activeTab, setActiveTab] = useState<TabType>(
    tabParam &&
      ["lineups", "statistics", "events", "players", "predictions"].includes(
        tabParam
      )
      ? tabParam
      : "predictions"
  );

  const timezone = useMemo(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return tz && tz.trim().length > 0 ? tz : "UTC";
    } catch {
      return "UTC";
    }
  }, []);

  // Use React Query to fetch fixture
  const {
    data: fixtureData,
    isLoading,
    error: queryError,
  } = useFixture(fixtureId);

  // Sync tab state with URL parameter
  useEffect(() => {
    const tab = searchParams.get("tab") as TabType;
    if (
      tab &&
      ["lineups", "statistics", "events", "players", "predictions"].includes(
        tab
      )
    ) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Handle loading state
  if (isLoading) {
    return <GameDetailSkeleton />;
  }

  // Handle error state
  const error =
    queryError instanceof Error
      ? queryError.message
      : fixtureData?.errors && fixtureData.errors.length > 0
      ? fixtureData.errors.join("\n")
      : !fixtureId
      ? "Missing required parameter: id"
      : null;

  if (
    error ||
    !fixtureData ||
    !fixtureData.response ||
    fixtureData.response.length === 0
  ) {
    return (
      <FullPage center>
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-destructive">
            {error || "No fixture data available"}
          </p>
          <button
            onClick={() => {
              // Preserve date parameter when going back
              if (dateParam) {
                router.push(`/games?date=${dateParam}`);
              } else {
                router.back();
              }
            }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </FullPage>
    );
  }

  const fixture = fixtureData.response[0];

  const tabs: NavTab<TabType>[] = [
    { id: "predictions", label: "Predictions", icon: Brain },

    { id: "statistics", label: "Statistics", icon: BarChart3 },

    { id: "players", label: "Players", icon: User },
    { id: "events", label: "Events", icon: Activity },
    { id: "lineups", label: "Lineups", icon: Users },
  ];

  return (
    <FullPage>
      {/* Fixture Detail - Always visible at top */}
      <div className="bg-gradient-to-br from-white/50 dark:from-black/80 to-card/90 ">
        <div className="flex items-center justify-between mb-2 container mx-auto max-w-4xl px-4">
          <button
            onClick={() => {
              // Preserve date parameter when going back
              if (dateParam) {
                router.push(`/games?date=${dateParam}`);
              } else {
                router.back();
              }
            }}
            className="flex items-center gap-2 py-2 md:py-3 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2 text-xs md:text-sm font-bold dark:text-mygray text-primary">
            <Clock8 className="w-4 h-4" />
            <p>{timezone}</p>
          </div>
        </div>
        <div className="container mx-auto max-w-5xl px-1">
          <FixtureDetail fixture={fixture} />
        </div>
        {/* Tab Navigation */}
        {fixtureId && (
          <Nav
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            preserveParams={true}
            additionalParams={{ id: fixtureId.toString() }}
            containerClassName="mt-2 mb-2 justify-between max-w-4xl  mx-auto  px-2 gap-1"
            hideIconOnMobile={true}
            justify="between"
          />
        )}
      </div>

      <div className="pt-2 pb-10">
        {/* Tab Content */}
        {activeTab === "lineups" && (
          <div className="container mx-auto w-[95%]  max-w-4xl ">
            <Lineups
              fixtureId={fixture.fixture.id}
              statusType={getFixtureStatus(fixture.fixture.status.short).type}
            />
          </div>
        )}
        {activeTab === "statistics" && (
          <div className="container mx-auto w-[90%] max-w-3xl px-1">
            <FixtureStatistics
              fixtureId={fixture.fixture.id}
              homeTeamId={fixture.teams.home.id}
              awayTeamId={fixture.teams.away.id}
              statusType={getFixtureStatus(fixture.fixture.status.short).type}
            />
          </div>
        )}

        {activeTab === "events" && (
          <div className="container mx-auto w-[95%]  max-w-2xl ">
            <Events
              fixtureId={fixture.fixture.id}
              homeTeamId={fixture.teams.home.id}
              awayTeamId={fixture.teams.away.id}
              statusType={getFixtureStatus(fixture.fixture.status.short).type}
            />
          </div>
        )}

        {activeTab === "players" && (
          <div className="container mx-auto  max-w-5xl ">
            <FixturePlayers
              fixtureId={fixture.fixture.id}
              homeTeamId={fixture.teams.home.id}
              awayTeamId={fixture.teams.away.id}
              statusType={getFixtureStatus(fixture.fixture.status.short).type}
            />
          </div>
        )}

        {activeTab === "predictions" && (
          <div className="container mx-auto w-[95%]  max-w-4xl ">
            <Predictions fixtureId={fixture.fixture.id} />
          </div>
        )}
      </div>
    </FullPage>
  );
}

export default function GameDetailPage() {
  return (
    <Suspense fallback={<GameDetailSkeleton />}>
      <GameDetailContent />
    </Suspense>
  );
}
