import Image from "next/image";
import { mockFixtures } from "@/data/fixtures-mock";

export default function Fixtures() {
  // Group fixtures by league
  const fixturesByLeague = mockFixtures.reduce((acc, fixture) => {
    const leagueId = fixture.league.id;
    if (!acc[leagueId]) {
      acc[leagueId] = {
        league: fixture.league,
        fixtures: [],
      };
    }
    acc[leagueId].fixtures.push(fixture);
    return acc;
  }, {} as Record<number, { league: (typeof mockFixtures)[0]["league"]; fixtures: typeof mockFixtures }>);

  const getStatusBadge = (status: string, elapsed: number | null) => {
    if (status === "FT")
      return <span className="text-xs text-green-500 font-bold">FT</span>;
    if (status === "HT")
      return <span className="text-xs text-orange-500 font-bold">HT</span>;
    if (status === "1H" || status === "2H")
      return (
        <span className="text-xs text-red-500 font-bold">{elapsed}&apos;</span>
      );
    return <span className="text-xs text-mygray">VS</span>;
  };

  return (
    <div className="min-h-screen bg-background p-2 md:p-6 pb-20 md:pb-6">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 px-2 md:px-0">
        Live Fixtures
      </h1>

      <div className="space-y-6 md:space-y-8">
        {Object.values(fixturesByLeague).map(({ league, fixtures }) => (
          <div key={league.id} className="space-y-2 md:space-y-3">
            {/* League Header */}
            <div className="flex items-center gap-2 md:gap-3 pb-2 border-b border-border px-2 md:px-0">
              <Image
                src={league.logo}
                alt={league.name}
                width={28}
                height={28}
                className="w-6 h-6 md:w-8 md:h-8"
              />
              <div>
                <h2 className="font-bold text-base md:text-lg">
                  {league.name}
                </h2>
                <p className="text-xs text-muted-foreground hidden md:block">
                  {league.country} • {league.round}
                </p>
              </div>
            </div>

            {/* Fixtures List */}
            <div className="grid gap-2 md:gap-3">
              {fixtures.map((fixture) => (
                <div
                  key={fixture.fixture.id}
                  className="bg-card border border-border rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow"
                >
                  {/* Desktop Layout */}
                  <div className="hidden md:flex items-center justify-between">
                    {/* Home Team */}
                    <div className="flex items-center gap-3 flex-1">
                      <Image
                        src={fixture.teams.home.logo}
                        alt={fixture.teams.home.name}
                        width={40}
                        height={40}
                        className="w-10 h-10"
                      />
                      <span className="font-semibold text-base">
                        {fixture.teams.home.name}
                      </span>
                    </div>

                    {/* Score / Status */}
                    <div className="flex flex-col items-center gap-1 px-4 min-w-[80px]">
                      {fixture.fixture.status.short === "NS" ? (
                        <>
                          {getStatusBadge(
                            fixture.fixture.status.short,
                            fixture.fixture.status.elapsed
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(fixture.fixture.date).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xl">
                              {fixture.goals.home}
                            </span>
                            <span className="text-muted-foreground">-</span>
                            <span className="font-bold text-xl">
                              {fixture.goals.away}
                            </span>
                          </div>
                          {getStatusBadge(
                            fixture.fixture.status.short,
                            fixture.fixture.status.elapsed
                          )}
                        </>
                      )}
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-3 flex-1 justify-end">
                      <span className="font-semibold text-base text-right">
                        {fixture.teams.away.name}
                      </span>
                      <Image
                        src={fixture.teams.away.logo}
                        alt={fixture.teams.away.name}
                        width={40}
                        height={40}
                        className="w-10 h-10"
                      />
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="md:hidden space-y-2">
                    {/* Home Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Image
                          src={fixture.teams.home.logo}
                          alt={fixture.teams.home.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 flex-shrink-0"
                        />
                        <span className="font-semibold text-sm truncate">
                          {fixture.teams.home.name}
                        </span>
                      </div>
                      <span className="font-bold text-lg ml-2 flex-shrink-0">
                        {fixture.goals.home !== null ? fixture.goals.home : "-"}
                      </span>
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Image
                          src={fixture.teams.away.logo}
                          alt={fixture.teams.away.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 flex-shrink-0"
                        />
                        <span className="font-semibold text-sm truncate">
                          {fixture.teams.away.name}
                        </span>
                      </div>
                      <span className="font-bold text-lg ml-2 flex-shrink-0">
                        {fixture.goals.away !== null ? fixture.goals.away : "-"}
                      </span>
                    </div>

                    {/* Status/Time */}
                    <div className="flex items-center justify-center gap-2 pt-1 border-t border-border/50">
                      {getStatusBadge(
                        fixture.fixture.status.short,
                        fixture.fixture.status.elapsed
                      )}
                      {fixture.fixture.status.short === "NS" && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(fixture.fixture.date).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Venue Info - Hidden on mobile */}
                  <div className="hidden md:block mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground text-center">
                    {fixture.fixture.venue.name}, {fixture.fixture.venue.city}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
