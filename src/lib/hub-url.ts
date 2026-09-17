/**
 * Team / league hub pages: /teams/{slug}-{tagId}, /leagues/{slug}-{tagId}. The tag id is
 * the lookup key; the slug always comes from the English tag name.
 */
import { parseTrailingId, slugify } from "@/lib/slug";
import type { TagType } from "@/type/fastapi/tags";

interface HubTag {
  id: number;
  name: string;
  type: TagType;
  slug?: string | null;
}

const HUB_BASE: Partial<Record<TagType, string>> = {
  team: "/teams",
  league: "/leagues",
};

export function hubUrlSegment(tag: Pick<HubTag, "id" | "name" | "slug">): string {
  // `name` may be translated — only trust it for the slug when the API sent none.
  const slug = tag.slug ?? slugify(tag.name);
  return slug ? `${slug}-${tag.id}` : `${tag.id}`;
}

/** Hub path for league/team tags; undefined for topic/player tags (no hub page). */
export function hubPath(tag: HubTag): string | undefined {
  const base = HUB_BASE[tag.type];
  return base ? `${base}/${hubUrlSegment(tag)}` : undefined;
}

export const parseHubId = parseTrailingId;
