"use client";

import { useEffect, useState, useMemo } from "react";
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
import Loading from "@/components/common/loading";
import Nav, { NavTab } from "@/components/common/nav";
import FixtureDetail from "./_components/fixture-detail";
import Lineups from "./_components/lineups";
import FixtureStatistics from "./_components/fixture-statistics";
import Events from "./_components/events";
import FixturePlayers from "./_components/fixture-players";
import Predictions from "./_components/predictions";
import type { FixturesApiResponse } from "@/type/fixture";

type TabType = "lineups" | "statistics" | "events" | "players" | "predictions";

export default function GameDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fixtureId = searchParams.get("id");
  const dateParam = searchParams.get("date");

  // Get tab from URL or default to lineups
  const tabParam = searchParams.get("tab") as TabType;
  const [activeTab, setActiveTab] = useState<TabType>(
    tabParam &&
      ["lineups", "statistics", "events", "players", "predictions"].includes(
        tabParam
      )
      ? tabParam
      : "lineups"
  );

  const [fixtureData, setFixtureData] = useState<FixturesApiResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timezone = useMemo(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return tz && tz.trim().length > 0 ? tz : "UTC";
    } catch {
      return "UTC";
    }
  }, []);

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

  useEffect(() => {
    const controller = new AbortController();

    const fetchFixture = async () => {
      if (!fixtureId) {
        setError("Missing required parameter: id");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/fixtures?id=${fixtureId}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load fixture data (${response.status})`);
        }

        const data = (await response.json()) as FixturesApiResponse;

        if (data.errors && data.errors.length > 0) {
          setError(data.errors.join("\n"));
        }

        if (!data.response || data.response.length === 0) {
          setError("Fixture not found");
        }

        setFixtureData(data);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setFixtureData(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchFixture();

    return () => {
      controller.abort();
    };
  }, [fixtureId]);

  if (isLoading) {
    return (
      <FullPage center>
        <Loading />
      </FullPage>
    );
  }

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
    { id: "lineups", label: "Lineups", icon: Users },
    { id: "statistics", label: "Statistics", icon: BarChart3 },
    { id: "events", label: "Events", icon: Activity },
    { id: "players", label: "Players", icon: User },
    { id: "predictions", label: "Predictions", icon: Brain },
  ];

  return (
    <FullPage>
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

      {/* Fixture Detail - Always visible at top */}
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
          additionalParams={{ id: fixtureId }}
          containerClassName="mt-2 mb-2 justify-between max-w-4xl  mx-auto  px-2 gap-1"
          hideIconOnMobile={true}
          justify="between"
        />
      )}

      <div className="pt-2 pb-10">
        {/* Tab Content */}
        {activeTab === "lineups" && <Lineups fixtureId={fixture.fixture.id} />}
        {activeTab === "statistics" && (
          <div className="container mx-auto w-[90%] max-w-3xl px-1">
            <FixtureStatistics
              fixtureId={fixture.fixture.id}
              homeTeamId={fixture.teams.home.id}
              awayTeamId={fixture.teams.away.id}
            />
          </div>
        )}
        <div className="container mx-auto w-[95%]  max-w-2xl ">
          {activeTab === "events" && (
            <Events
              fixtureId={fixture.fixture.id}
              homeTeamId={fixture.teams.home.id}
              awayTeamId={fixture.teams.away.id}
            />
          )}
        </div>
        <div className="container mx-auto  max-w-5xl ">
          {activeTab === "players" && (
            <FixturePlayers
              fixtureId={fixture.fixture.id}
              homeTeamId={fixture.teams.home.id}
              awayTeamId={fixture.teams.away.id}
            />
          )}
        </div>
        <div className="container mx-auto w-[95%]  max-w-4xl ">
          {activeTab === "predictions" && (
            <Predictions fixtureId={fixture.fixture.id} />
          )}
        </div>
      </div>
    </FullPage>
  );
}
