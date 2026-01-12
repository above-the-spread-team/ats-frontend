/**
 * League and tag color themes
 * Used for styling badges and UI elements
 */

export const TAG_COLORS: Record<string, string> = {
  Premier: "#391855",
  "La Liga": "#F04C44",
  "Serie A": "#4678EF",
  Bundesliga: "#D30617",
  "Ligue 1": "#010201",
  "UEFA Champions League": "#0A0242",
  "UEFA Europa League": "#F16A05",
  "UEFA Europa Conference League": "#39BB1F",
  "Transfer News": "#34A853",
  International: "#E84A45",
};

const DEFAULT_COLOR = "#64648F";

/**
 * Get the color for a tag/league name
 * @param tagName - The name of the tag or league
 * @returns Hex color string
 */
export function getTagColor(tagName: string): string {
  return TAG_COLORS[tagName] || DEFAULT_COLOR;
}
