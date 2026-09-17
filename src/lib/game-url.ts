/**
 * Match page URLs: /games/{home}-vs-{away}-{fixtureId}. Same scheme as articles — the
 * trailing API-Football fixture id is the lookup key, the slug is cosmetic, and a bare id
 * (/games/{fixtureId}) is accepted and redirected to the canonical segment.
 */
import { parseTrailingId, slugify } from "@/lib/slug";

interface GameUrlParts {
  id: number;
  home?: string | null;
  away?: string | null;
}

export function gameUrlSegment({ id, home, away }: GameUrlParts): string {
  const slug = home && away ? slugify(`${home} vs ${away}`) : null;
  return slug ? `${slug}-${id}` : `${id}`;
}

/** App-relative path for links (next-intl Link prepends the locale as needed). */
export function gamePath(parts: GameUrlParts): string {
  return `/games/${gameUrlSegment(parts)}`;
}

export const parseGameId = parseTrailingId;
