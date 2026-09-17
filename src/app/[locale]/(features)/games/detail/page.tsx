import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { permanentRedirect } from "@/i18n/navigation";
import { gamePath } from "@/lib/game-url";
import { serverFetchFixture } from "@/lib/server-fixture";

// Legacy URL: /games/detail?id={fixtureId}&date=&tab= → /games/{home}-vs-{away}-{fixtureId}
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    id?: string | string[];
    date?: string | string[];
    tab?: string | string[];
  }>;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LegacyGameDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  const query = await searchParams;

  // Digits only — parseInt would accept "123abc"
  const idParam = first(query.id) ?? "";
  const fixtureId = /^\d+$/.test(idParam) ? Number.parseInt(idParam, 10) : NaN;
  if (!Number.isSafeInteger(fixtureId) || fixtureId <= 0) notFound();

  // Names are only needed to land on the canonical slug in one hop; if the lookup fails
  // the bare-id path still resolves (and the match page answers 404 / 5xx itself).
  const { fixture } = await serverFetchFixture(fixtureId);
  const pathname = gamePath({
    id: fixtureId,
    home: fixture?.teams.home.name,
    away: fixture?.teams.away.name,
  });

  const preserved: Record<string, string> = {};
  const date = first(query.date);
  const tab = first(query.tab);
  if (date) preserved.date = date;
  if (tab) preserved.tab = tab;

  permanentRedirect({ href: { pathname, query: preserved }, locale });
}
