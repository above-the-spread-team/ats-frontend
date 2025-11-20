"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import FullPage from "@/components/common/full-page";
import Loading from "@/components/common/loading";
import FixtureDetail from "./_components/fixture-detail";
import FixtureNav from "./_components/nav";
import HeadtoHead from "./_components/headtohead";
import Lineups from "./_components/lineups";
import FixtureStatistics from "./_components/fixture-statistics";
import Events from "./_components/events";
import FixturePlayers from "./_components/fixture-players";
import type { FixturesApiResponse } from "@/type/fixture";

type TabType = "headtohead" | "lineups" | "statistics" | "events" | "players";

export default function GameDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fixtureId = searchParams.get("id");

  // Get tab from URL or default to headtohead
  const tabParam = searchParams.get("tab") as TabType;
  const [activeTab, setActiveTab] = useState<TabType>(
    tabParam &&
      ["headtohead", "lineups", "statistics", "events", "players"].includes(
        tabParam
      )
      ? tabParam
      : "headtohead"
  );

  const [fixtureData, setFixtureData] = useState<FixturesApiResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync tab state with URL parameter
  useEffect(() => {
    const tab = searchParams.get("tab") as TabType;
    if (
      tab &&
      ["headtohead", "lineups", "statistics", "events", "players"].includes(tab)
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
            onClick={() => router.back()}
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

  return (
    <FullPage>
      <div className="container mx-auto max-w-4xl px-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 py-2 md:py-3 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Fixture Detail - Always visible at top */}
        <FixtureDetail fixture={fixture} />

        {/* Tab Navigation */}
        {fixtureId && (
          <FixtureNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            fixtureId={fixtureId}
          />
        )}

        <div className="pt-2 pb-10">
          {/* Tab Content */}
          {activeTab === "headtohead" && (
            <HeadtoHead
              homeTeamId={fixture.teams.home.id}
              awayTeamId={fixture.teams.away.id}
              leagueId={fixture.league.id}
              season={fixture.league.season}
            />
          )}
          {activeTab === "lineups" && (
            <Lineups fixtureId={fixture.fixture.id} />
          )}
          {activeTab === "statistics" && (
            <FixtureStatistics fixtureId={fixture.fixture.id} />
          )}
          {activeTab === "events" && <Events fixtureId={fixture.fixture.id} />}
          {activeTab === "players" && (
            <FixturePlayers fixtureId={fixture.fixture.id} />
          )}
        </div>
      </div>
    </FullPage>
  );
}
