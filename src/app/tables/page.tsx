import Image from "next/image";
import { mockStandings } from "@/data/standings-mock";

export default function Tables() {
  const getFormIcon = (result: string, isMobile = false) => {
    const size = isMobile ? "w-5 h-5" : "w-6 h-6";
    if (result === "W")
      return (
        <span
          className={`${size} rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold`}
        >
          W
        </span>
      );
    if (result === "D")
      return (
        <span
          className={`${size} rounded-full bg-gray-500 text-white text-xs flex items-center justify-center font-bold`}
        >
          D
        </span>
      );
    if (result === "L")
      return (
        <span
          className={`${size} rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold`}
        >
          L
        </span>
      );
    return null;
  };

  const getQualificationColor = (description: string | null) => {
    if (!description) return "";
    if (description.includes("Champions League"))
      return "border-l-4 border-l-blue-500";
    if (description.includes("Europa League"))
      return "border-l-4 border-l-orange-500";
    if (description.includes("Relegation"))
      return "border-l-4 border-l-red-500";
    return "";
  };

  return (
    <div className="min-h-screen bg-background p-2 md:p-6 pb-20 md:pb-6">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 px-2 md:px-0">
        League Standings
      </h1>

      <div className="space-y-6 md:space-y-8">
        {mockStandings.map((standing) => (
          <div
            key={standing.league.id}
            className="bg-card rounded-lg border border-border overflow-hidden"
          >
            {/* League Header */}
            <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-primary">
              <Image
                src={standing.league.logo}
                alt={standing.league.name}
                width={28}
                height={28}
                className="w-6 h-6 md:w-8 md:h-8"
              />
              <div>
                <h2 className="font-bold text-base md:text-lg text-white">
                  {standing.league.name}
                </h2>
                <p className="text-xs text-white/80 hidden md:block">
                  {standing.league.country} • Season {standing.league.season}
                </p>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold">
                      #
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold">
                      Team
                    </th>
                    <th className="text-center py-3 px-2 text-xs font-semibold">
                      P
                    </th>
                    <th className="text-center py-3 px-2 text-xs font-semibold">
                      W
                    </th>
                    <th className="text-center py-3 px-2 text-xs font-semibold">
                      D
                    </th>
                    <th className="text-center py-3 px-2 text-xs font-semibold">
                      L
                    </th>
                    <th className="text-center py-3 px-2 text-xs font-semibold">
                      GF
                    </th>
                    <th className="text-center py-3 px-2 text-xs font-semibold">
                      GA
                    </th>
                    <th className="text-center py-3 px-2 text-xs font-semibold">
                      GD
                    </th>
                    <th className="text-center py-3 px-2 text-xs font-semibold">
                      Pts
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold">
                      Form
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {standing.league.standings[0].map((team) => (
                    <tr
                      key={team.team.id}
                      className={`border-b border-border hover:bg-muted/50 transition-colors ${getQualificationColor(
                        team.description
                      )}`}
                    >
                      <td className="py-3 px-4 text-sm font-semibold">
                        {team.rank}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Image
                            src={team.team.logo}
                            alt={team.team.name}
                            width={24}
                            height={24}
                            className="w-6 h-6"
                          />
                          <span className="font-medium text-sm">
                            {team.team.name}
                          </span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-2 text-sm">
                        {team.all.played}
                      </td>
                      <td className="text-center py-3 px-2 text-sm">
                        {team.all.win}
                      </td>
                      <td className="text-center py-3 px-2 text-sm">
                        {team.all.draw}
                      </td>
                      <td className="text-center py-3 px-2 text-sm">
                        {team.all.lose}
                      </td>
                      <td className="text-center py-3 px-2 text-sm">
                        {team.all.goals.for}
                      </td>
                      <td className="text-center py-3 px-2 text-sm">
                        {team.all.goals.against}
                      </td>
                      <td className="text-center py-3 px-2 text-sm font-semibold">
                        {team.goalsDiff > 0
                          ? `+${team.goalsDiff}`
                          : team.goalsDiff}
                      </td>
                      <td className="text-center py-3 px-2 text-sm font-bold">
                        {team.points}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          {team.form.split("").map((result, i) => (
                            <div key={i}>{getFormIcon(result)}</div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border">
              {standing.league.standings[0].map((team) => (
                <div
                  key={team.team.id}
                  className={`p-3 ${getQualificationColor(team.description)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-base font-bold text-muted-foreground w-5 flex-shrink-0">
                        {team.rank}
                      </span>
                      <Image
                        src={team.team.logo}
                        alt={team.team.name}
                        width={28}
                        height={28}
                        className="w-7 h-7 flex-shrink-0"
                      />
                      <span className="font-semibold text-sm truncate">
                        {team.team.name}
                      </span>
                    </div>
                    <span className="text-lg font-bold ml-2 flex-shrink-0">
                      {team.points}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-xs text-center mb-2">
                    <div>
                      <div className="text-muted-foreground">P</div>
                      <div className="font-semibold">{team.all.played}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">W</div>
                      <div className="font-semibold">{team.all.win}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">D</div>
                      <div className="font-semibold">{team.all.draw}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">L</div>
                      <div className="font-semibold">{team.all.lose}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">GD</div>
                      <div className="font-semibold">
                        {team.goalsDiff > 0
                          ? `+${team.goalsDiff}`
                          : team.goalsDiff}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    {team.form.split("").map((result, i) => (
                      <div key={i}>{getFormIcon(result, true)}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="p-3 md:p-4 bg-muted/30 text-xs space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 border-l-4 border-l-blue-500 bg-white"></div>
                <span className="text-xs">Champions League</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 border-l-4 border-l-orange-500 bg-white"></div>
                <span className="text-xs">Europa League</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 border-l-4 border-l-red-500 bg-white"></div>
                <span className="text-xs">Relegation Zone</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
