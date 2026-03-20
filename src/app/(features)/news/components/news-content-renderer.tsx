import { ExternalLink } from "lucide-react";
import type {
  GeneralNewsContent,
  MatchPreviewContent,
  NewsSource,
} from "@/type/fastapi/news";
import { parseNewsContent } from "@/lib/news-content";
import Link from "next/link";

// ── Shared sub-components ─────────────────────────────────────────────────────

function SourcesList({ sources }: { sources: NewsSource[] }) {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="pt-2 pb-4 border-t border-border">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        Sources
      </p>
      <ul className="space-y-1">
        {sources.map((s, i) => (
          <li key={i}>
            <Link
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs md:text-sm text-primary-font hover:underline"
            >
              <ExternalLink className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              {s.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── General News renderer ─────────────────────────────────────────────────────

function GeneralNewsRenderer({ content }: { content: GeneralNewsContent }) {
  return (
    <div className="space-y-8">
      {content.events.map((event, i) => (
        <div key={i} className="space-y-3">
          <h3 className="text-lg md:text-xl font-bold text-foreground border-l-4 border-primary pl-3">
            {event.headline}
          </h3>
          <div className="space-y-3">
            {event.paragraphs.map((para, j) => (
              <p key={j} className="leading-7 text-base text-foreground">
                {para}
              </p>
            ))}
          </div>
          <SourcesList sources={event.sources} />
        </div>
      ))}
    </div>
  );
}

// ── Match Preview renderer ────────────────────────────────────────────────────

function MatchPreviewRenderer({ content }: { content: MatchPreviewContent }) {
  return (
    <div className="space-y-6">
      {/* Analysis paragraphs */}
      <div className="space-y-3">
        {content.paragraphs.map((para, i) => (
          <p key={i} className="leading-7 text-base text-foreground">
            {para}
          </p>
        ))}
      </div>

      {/* Betting Tips */}
      {content.betting_tips && content.betting_tips.length > 0 && (
        <div className="bg-muted/40 rounded-xl border border-border p-4 space-y-2">
          <p className="text-sm font-semibold text-primary-font uppercase tracking-wide">
            Betting Tips
          </p>
          <ul className="space-y-1.5">
            {content.betting_tips.map((tip, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-primary-font flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      <SourcesList sources={content.sources} />
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

interface NewsContentRendererProps {
  content: string;
}

export default function NewsContentRenderer({
  content,
}: NewsContentRendererProps) {
  const parsed = parseNewsContent(content);

  if (!parsed) {
    // Legacy markdown content — render as plain paragraphs
    return (
      <div className="space-y-3">
        {content.split("\n\n").map((block, i) => (
          <p key={i} className="leading-7 text-base text-foreground">
            {block.replace(/^#+\s*/, "").trim()}
          </p>
        ))}
      </div>
    );
  }

  if (parsed.type === "general_news") {
    return <GeneralNewsRenderer content={parsed} />;
  }

  return <MatchPreviewRenderer content={parsed} />;
}
