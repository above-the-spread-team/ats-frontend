# AGENTS.md

## Quick Start

```bash
npm install          # install dependencies
npm run dev          # start Next.js dev server on :3000
npm run build        # production build
npm run lint         # ESLint
npx tsc --noEmit     # type-check (no separate script in package.json)
```

Backend must be running at `NEXT_PUBLIC_BACKEND_URL` (default `http://localhost:8000`).

## Architecture

**Next.js 15.5 App Router**, deployed to Vercel. Two route groups:

| Group | Layout | Pages |
|---|---|---|
| `(auth)` | No main nav | login, register, forgot-pwd, reset-pwd, email-verify, auth/callback |
| `(features)` | Header + nav + footer | home, articles, discuss, games, stats, profile, news, our-picks, world-cup |
| `(test)` | — | Dev-only pages (not linked from prod nav) |

Also: `src/app/api/` — 33 Next.js Route Handlers that proxy API-Football calls (no CORS, cache via `next: { revalidate: N }`, server-side API key never reaches browser).

### Data Sources

1. **FastAPI backend** (`src/services/fastapi/*.ts`) — user data, posts, comments, reactions, news content. All wired through React Query hooks.
2. **API-Football** (`src/services/football-api/*.ts`) — fixtures, standings, stats, odds. Called through Next.js API routes, never from the browser directly.

### State Management

- **React Query** owns all server-derived state. No Redux, no global store.
- **URL params** own UI state (selected tab, page, tag filter) — makes URLs shareable and back/forward work.
- Query key convention: `['resourceName', param1, param2, ...]` — all params that affect the response.

### Auth

JWT in HttpOnly cookies (primary) + `localStorage` fallback for Safari. Token stored via helpers in `src/services/fastapi/token-storage.ts`:
- `storeToken(token)` / `getStoredToken()` / `clearStoredToken()` / `getAuthHeader()`
- `backendFetch()` (`src/lib/backend-fetch.ts`) adds maintenance-bypass header when `__ats_dev_pub` cookie exists.

### Maintenance Mode

`src/middleware.ts` checks Vercel Edge Config (`isInMaintenance`). If active and no valid `__ats_dev` bypass cookie, all requests rewrite to `/maintenance`. Matcher excludes `_next/static`, `_next/image`, `favicon.ico`, `maintenance`, `api/maintenance-bypass`.

## Tech Stack

| Concern | Technology |
|---|---|
| Framework | Next.js 15.5 App Router |
| Styling | Tailwind CSS 3 + CSS variables (HSL), class-based dark mode |
| UI primitives | shadcn/ui (new-york style, Radix UI, lucide-react icons) |
| Data fetching | @tanstack/react-query 5 |
| Auth | HttpOnly cookies + localStorage fallback |
| Analytics | Plausible (next-plausible) |
| Images | Cloudinary (upload via backend), Next.js Image (render) |
| Notifications | react-toastify |
| Icons | lucide-react + react-icons (BiLike/BiDislike) |
| Theme | next-themes (system/light/dark) |

## Code Conventions

### File naming & organization

```
src/
├── app/                              # Pages and API routes only
│   └── (features)/[feature]/
│       ├── page.tsx                  # route handler
│       ├── layout.tsx                # (if needed)
│       ├── _components/              # private components for this route
│       ├── _contexts/                # private React contexts
│       └── components/               # shared components within this feature
├── components/
│   ├── ui/                           # shadcn/ui primitives
│   ├── common/                       # App-wide shared components
│   └── layout/                       # Header, nav, footer
├── services/                         # React Query hooks (one file per resource)
│   ├── fastapi/                      # → FastAPI backend
│   └── football-api/                 # → API-Football (proxy)
├── type/                             # TypeScript type definitions
│   ├── fastapi/                      # matching backend Pydantic schemas
│   └── footballapi/                  # matching API-Football responses
├── lib/                              # Utility functions
├── hooks/                            # Custom React hooks (non-data-fetching)
├── data/                             # Constants (league IDs, colors, nav structure, emoji, mocks)
├── config/                           # Season configuration
└── providers/                        # React Query + theme providers
```

### Component style

- Default export for pages and major components, named exports for utilities and hooks.
- `"use client"` at the top of every file that uses hooks or browser APIs. Currently 34/36 pages are client components — the only server components are root `layout.tsx` and `maintenance/page.tsx`.
- shadcn/ui components go in `src/components/ui/` — do not modify their internals.
- New feature-specific shared components start in the feature's `components/` subfolder; promote to `src/components/common/` when reused across features.

### API & data fetching

- Every API call is wrapped in a `useQuery` or `useMutation` hook inside `src/services/fastapi/`.
- Mutations use `onSuccess` to invalidate or update cache — avoid full refetch unless necessary.
- Optimistic updates pattern (see `articles/[new-id]/page.tsx`): local state for `liked`/`disliked`/counts, revert on error.
- All requests send `credentials: "include"` + `Authorization: Bearer` header (Safari fallback).
- `fetchNewsById` and similar auth-dependent queries use `getAuthHeader()`.

### Types

- Types in `src/type/` mirror backend schemas. Match `src/type/fastapi/*.d.ts` against `ats-backend/app/schemas/` when adding fields.
- Use `resolveArticleType(news)` from `src/services/fastapi/news.ts` to determine article type — never check `article_type` directly (list endpoints may omit it).

### Styling

- Use Tailwind utility classes. CSS variables defined in `src/app/globals.css` under `:root` and `.dark`.
- `cn()` from `@/lib/utils` for conditional classes.
- League colors from `src/data/league-theme.ts`.
- Responsive: mobile-first. `useMobile()` hook returns `true` below 768px.

## Pitfalls

- **Client vs server components**: Nearly all pages are `"use client"`. When adding server components, they must be at the page level or imported into client components — you cannot import a server component into a client component directly without losing server rendering.
- **`router.back()` navigation**: Used throughout instead of hardcoded URLs. Be aware `back()` does nothing if there's no history — some pages provide a fallback `router.push("/news")` for error states.
- **Optimistic updates**: Pattern is to `setOptimistic()` before mutate, revert on `catch(error)`. Must reset `optimistic` via `useEffect` when server data changes (see `articles/[new-id]/page.tsx:67-69`).
- **Auth 401 handling**: Check for `error.message.includes("401")` in mutation `catch` blocks and redirect to `/login`.
- **`toLocaleString("en-US", ...)`**: Hardcoded locale in 31 locations (dates, numbers, vote counts). These need to be updated when i18n is implemented — see the [ATS language plan](https://github.com/anomalyco/opencode/issues).
- **No test suite**: Currently zero tests. The backend tests (`ats-backend/app/tests/`) follow a consistent pattern — when tests are added, match that.
- **Middleware order** (future i18n): If locale routing is added, it must compose with the existing maintenance-mode middleware — locale routing must run AFTER maintenance check. Incorrect order = bypass cookie broken on prefixed paths.
- **`News.content` is JSON, not Markdown**: Parse with `parseNewsContent()` from `src/lib/news-content.ts`. Fallback handles legacy data and JSON parse failures.
- **Image optimization**: News images from the backend go through Cloudinary. Use `getOptimizedNewsImage(url, width)` from `src/lib/cloudinary.ts` and set `unoptimized` on `<Image>` (Cloudinary handles optimization). User avatars and third-party logos (api-sports, Google) use Next.js Image with no `unoptimized`.

## Adding Features

1. Create types in `src/type/fastapi/[resource].d.ts` (match backend schemas)
2. Add service file `src/services/fastapi/[resource].ts` with React Query hooks
3. Create page under `src/app/(features)/[feature]/`
4. Build components in feature's `components/` subfolder
5. If top-level nav item, update `src/data/nav.ts`

For new API-Football data:
1. Create `src/app/(features)/api/[endpoint]/route.ts` with `next: { revalidate: N }`
2. Add hook in `src/services/football-api/[resource].ts`
3. Add types in `src/type/footballapi/[resource].d.ts`

## Key Files

| File | Purpose |
|---|---|
| `src/app/layout.tsx` | Root layout — metadata, fonts (Sora), JSON-LD, providers, ToastContainer |
| `src/app/(features)/layout.tsx` | Features group layout — Header, Nav, Footer, mobile nav, popups, analytics |
| `src/middleware.ts` | Maintenance mode via Vercel Edge Config |
| `next.config.ts` | Remote image patterns, SVG CSP, quality settings |
| `tailwind.config.ts` | Custom colors (primary, vote, heart, etc.), animations, shadcn theme |
| `components.json` | shadcn/ui config (new-york, neutral base, cssVariables) |
| `src/lib/utils.ts` | `cn()` classname helper |
| `src/lib/news-content.ts` | `parseNewsContent()`, `getNewsPreview()` — JSON content parsing |
| `src/lib/cloudinary.ts` | `getOptimizedNewsImage()` — Cloudinary URL transforms |
| `src/lib/backend-fetch.ts` | `backendFetch()` — adds maintenance-bypass header |
| `src/services/fastapi/news.ts` | All news/react/comment API hooks (largest service file, ~1450 lines) |
| `src/services/fastapi/token-storage.ts` | Auth token localStorage helpers |
| `src/services/fastapi/oauth.ts` | `useCurrentUser()`, `useLogout()` |
| `src/data/league-ids.ts` | Tracked league ID constants |
| `src/data/league-theme.ts` | League → gradient/color mappings |
| `src/data/nav.ts` | Navigation structure |
| `src/app/(features)/articles/components/news-content-renderer.tsx` | Renders 3 article content shapes |
| `src/app/globals.css` | All CSS custom properties (light + dark) |

## Language Plan (Not Yet Implemented)

The i18n specification is at `/Users/peter/Desktop/X-parse/docs/ats-language.md`. Key points relevant to frontend:

- URL strategy: `/[locale]/` prefix for non-en languages; en stays at root (`/articles/123` = en, `/ja/articles/123` = ja)
- Package: `next-intl` with `localePrefix: "as-needed"`
- Middleware must compose with existing maintenance mode
- Article pages must convert from client to server components for `generateMetadata` / hreflang / sitemap
- ~300 UI strings need extraction into `src/i18n/messages/{en,zh-TW,zh-CN,ja}.json`
- 31 `toLocaleString("en-US", ...)` call sites to update
- `en.json` is source of truth; missing translations fall back to English
- `zh-CN.json` is mechanically derived from `zh-TW.json` (never hand-edited)
- **Do not start i18n work without reading the full spec** — it contains 10 assumptions, 8 settled decisions, and 6 known traps.

## Docs

See `docs/00-project-overview.md` for product context and `docs/01-system-overview.md` for detailed architecture.
