export interface FixtureStatusMeta {
  short: string;
  long: string;
  type:
    | "Scheduled"
    | "In Play"
    | "Finished"
    | "Postponed"
    | "Cancelled"
    | "Abandoned"
    | "Not Played"
    | "Unknown";
  description: string;
  badgeClass: string;
}

export const FIXTURE_STATUS_MAP: Record<string, FixtureStatusMeta> = {
  TBD: {
    short: "TBD",
    long: "Time To Be Defined",
    type: "Scheduled",
    description: "Scheduled but the exact date and time are not yet confirmed.",
    badgeClass:
      "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  },
  NS: {
    short: "NS",
    long: "Not Started",
    type: "Scheduled",
    description: "Match is scheduled and has not kicked off yet.",
    badgeClass:
      "bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
  },
  PST: {
    short: "PST",
    long: "Match Postponed",
    type: "Postponed",
    description: "Fixture postponed to a later date; awaiting new schedule.",
    badgeClass:
      "bg-amber-200 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
  },
  "1H": {
    short: "1H",
    long: "First Half, Kick Off",
    type: "In Play",
    description: "First half currently in progress.",
    badgeClass:
      "bg-green-200 text-green-900 dark:bg-green-900/50 dark:text-green-200",
  },
  HT: {
    short: "HT",
    long: "Halftime",
    type: "In Play",
    description: "Teams are at halftime.",
    badgeClass:
      "bg-yellow-200 text-yellow-900 dark:bg-yellow-900/50 dark:text-yellow-200",
  },
  "2H": {
    short: "2H",
    long: "Second Half Started",
    type: "In Play",
    description: "Second half currently in progress.",
    badgeClass:
      "bg-green-200 text-green-900 dark:bg-green-900/50 dark:text-green-200",
  },
  ET: {
    short: "ET",
    long: "Extra Time",
    type: "In Play",
    description: "Extra time is being played.",
    badgeClass:
      "bg-orange-200 text-orange-900 dark:bg-orange-900/50 dark:text-orange-200",
  },
  BT: {
    short: "BT",
    long: "Break Time",
    type: "In Play",
    description: "Short break during extra time.",
    badgeClass:
      "bg-yellow-200 text-yellow-900 dark:bg-yellow-900/50 dark:text-yellow-200",
  },
  P: {
    short: "P",
    long: "Penalty In Progress",
    type: "In Play",
    description: "Penalty shootout is currently underway.",
    badgeClass:
      "bg-purple-200 text-purple-900 dark:bg-purple-900/50 dark:text-purple-200",
  },
  SUSP: {
    short: "SUSP",
    long: "Match Suspended",
    type: "In Play",
    description: "Suspended by referee; may resume or be rescheduled.",
    badgeClass: "bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-200",
  },
  INT: {
    short: "INT",
    long: "Match Interrupted",
    type: "In Play",
    description: "Temporarily interrupted; should resume shortly.",
    badgeClass: "bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-200",
  },
  LIVE: {
    short: "LIVE",
    long: "Live (No Phase Info)",
    type: "In Play",
    description:
      "Fixture is live, but detailed phase information is unavailable.",
    badgeClass: "bg-emerald-500 text-white animate-pulse",
  },
  FT: {
    short: "FT",
    long: "Match Finished",
    type: "Finished",
    description: "Match ended after regulation time.",
    badgeClass:
      "bg-slate-300 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
  },
  AET: {
    short: "AET",
    long: "Match Finished (Extra Time)",
    type: "Finished",
    description: "Match finished after extra time without penalties.",
    badgeClass:
      "bg-slate-300 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
  },
  PEN: {
    short: "PEN",
    long: "Match Finished (Penalties)",
    type: "Finished",
    description: "Match decided via penalty shootout.",
    badgeClass:
      "bg-slate-300 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
  },
  CANC: {
    short: "CANC",
    long: "Match Cancelled",
    type: "Cancelled",
    description: "Fixture cancelled and will not be played.",
    badgeClass: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  },
  ABD: {
    short: "ABD",
    long: "Match Abandoned",
    type: "Abandoned",
    description:
      "Match abandoned due to external factors (weather, safety, etc.). May or may not be rescheduled.",
    badgeClass: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  },
  AWD: {
    short: "AWD",
    long: "Technical Loss",
    type: "Not Played",
    description: "Match awarded to one team due to technical loss.",
    badgeClass:
      "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  },
  WO: {
    short: "WO",
    long: "Walkover",
    type: "Not Played",
    description: "Victory by forfeit; opponent did not show or withdrew.",
    badgeClass:
      "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  },
};

export function getFixtureStatus(shortCode: string): FixtureStatusMeta {
  return (
    FIXTURE_STATUS_MAP[shortCode] || {
      short: shortCode,
      long: shortCode,
      type: "Unknown",
      description: "Status information is currently unavailable.",
      badgeClass:
        "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
    }
  );
}
