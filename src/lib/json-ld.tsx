import { SITE_NAME, SITE_URL } from "@/lib/seo";
import type { FaqItem } from "@/type/fastapi/news";

/** Server-rendered JSON-LD. "<" is escaped so content can never close the script tag. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export const PUBLISHER_LD = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/images/logo.png`,
    width: 155,
    height: 155,
  },
};

/** Wrap several nodes into one document. */
export function graphLd(nodes: Array<object | null | undefined>) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.filter(Boolean),
  };
}

interface NewsArticleLdInput {
  url: string;
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified: string;
  locale: string;
  section?: string;
  keywords?: string[];
  articleBody?: string;
  aboutEventId?: string;
}

export function newsArticleLd(input: NewsArticleLdInput) {
  return {
    "@type": "NewsArticle",
    "@id": `${input.url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": input.url },
    url: input.url,
    headline: input.headline.slice(0, 110),
    description: input.description,
    image: [input.image],
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    inLanguage: input.locale,
    isAccessibleForFree: true,
    // Expert bylines are editorial personas, so the organisation is the accountable author.
    author: { "@id": PUBLISHER_LD["@id"] },
    publisher: PUBLISHER_LD,
    ...(input.section ? { articleSection: input.section } : {}),
    ...(input.keywords?.length ? { keywords: input.keywords.join(", ") } : {}),
    ...(input.articleBody ? { articleBody: input.articleBody } : {}),
    ...(input.aboutEventId ? { about: { "@id": input.aboutEventId } } : {}),
  };
}

export function breadcrumbLd(items: Array<{ name: string; url: string }>) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export type EventStatus =
  | "EventScheduled"
  | "EventPostponed"
  | "EventCancelled";

interface SportsEventLdInput {
  id: string;
  url: string;
  home: { name: string; logo?: string | null };
  away: { name: string; logo?: string | null };
  startDate: string;
  competition?: string | null;
  venue?: { name?: string | null; city?: string | null } | null;
  status?: EventStatus;
  description?: string;
  image?: string;
}

function teamLd(team: { name: string; logo?: string | null }) {
  return {
    "@type": "SportsTeam",
    name: team.name,
    sport: "Soccer",
    ...(team.logo ? { logo: team.logo } : {}),
  };
}

export function sportsEventLd(input: SportsEventLdInput) {
  const venueName = input.venue?.name?.trim();
  return {
    "@type": "SportsEvent",
    "@id": input.id,
    name: `${input.home.name} vs ${input.away.name}`,
    url: input.url,
    sport: "Soccer",
    startDate: input.startDate,
    eventStatus: `https://schema.org/${input.status ?? "EventScheduled"}`,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    homeTeam: teamLd(input.home),
    awayTeam: teamLd(input.away),
    competitor: [teamLd(input.home), teamLd(input.away)],
    ...(input.description ? { description: input.description } : {}),
    ...(input.image ? { image: [input.image] } : {}),
    ...(input.competition
      ? { superEvent: { "@type": "SportsEvent", name: input.competition } }
      : {}),
    ...(venueName
      ? {
          location: {
            "@type": "StadiumOrArena",
            name: venueName,
            ...(input.venue?.city
              ? {
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: input.venue.city,
                  },
                }
              : {}),
          },
        }
      : {}),
  };
}

export function faqLd(url: string, faq: FaqItem[]) {
  return {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function itemListLd(items: Array<{ name: string; url: string }>) {
  return {
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}
