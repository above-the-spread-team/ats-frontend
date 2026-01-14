# Frontend Architecture Guide

> 📘 **For product requirements, see [`PRD.md`](./PRD.md)**  
> 📋 **For project overview, see [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md)**

## Overview

This document provides detailed explanations of the frontend architecture, patterns, and design decisions for the Above The Spread platform.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with CSS variables
- **UI Components**: shadcn/ui
- **Data Fetching**: TanStack React Query
- **State Management**: React Query + URL state
- **Authentication**: JWT tokens (cookies + localStorage fallback)
- **Third-party API**: https://v3.football.api-sports.io

---

## Architecture Patterns

### API Data Fetching Strategy

#### Third-Party Football API (api-sports.io)

**Location**: `src/app/(features)/api/*/route.ts`

**Pattern**: Next.js API Routes with revalidation

**Purpose**:

- Proxy third-party API calls to control caching and reduce costs
- Handle rate limiting and error handling centrally
- Aggregate data from multiple leagues

**Caching Strategy**:

- Live data: 60 seconds revalidation
- Static data: 2 hours revalidation
- Odds: 3 hours revalidation
- Uses `next.revalidate` in fetch options and `Cache-Control` headers

**Example Implementation**: `src/app/(features)/api/fixtures/route.ts`

- Uses `revalidate` time based on data freshness needs
- Implements timeout handling for external API calls
- Aggregates data from multiple leagues
- Returns standardized response format

#### FastAPI Backend

**Location**: `src/services/fastapi/*.ts`

**Pattern**: TanStack React Query hooks

**Purpose**:

- All FastAPI requests use React Query for caching, stale time, and refetch intervals
- Centralized error handling and query invalidation
- Consistent authentication handling

**Authentication**: Uses `getAuthHeader()` from `token-storage.ts` for Safari compatibility

**Example Implementation**: `src/services/fastapi/posts.ts`

- Exports async functions for API calls
- Exports React Query hooks (`useQuery`, `useMutation`)
- Includes error handling and query invalidation

---

## File Structure

```
src/
├── app/
│   ├── (features)/          # Feature-based routing
│   │   ├── api/             # Next.js API routes (third-party proxy)
│   │   │   └── [endpoint]/
│   │   │       └── route.ts # API route with revalidation
│   │   ├── games/           # Fixtures and match details
│   │   ├── discuss/         # Discussion forum
│   │   ├── news/            # News articles
│   │   └── stats/           # Statistics and standings
│   └── (auth)/              # Authentication pages
├── services/
│   ├── fastapi/             # FastAPI backend services
│   │   ├── *.ts            # Service files with React Query hooks
│   │   └── token-storage.ts # Token management for Safari
│   └── football-api/        # Third-party API client hooks
│       └── *.ts            # React Query hooks for football API
├── type/
│   ├── fastapi/             # Backend TypeScript types
│   │   └── *.d.ts
│   └── footballapi/         # Football API types
│       └── *.d.ts
├── components/
│   ├── ui/                  # shadcn/ui components
│   └── common/              # Shared components
└── providers/
    ├── query-client.tsx     # React Query provider
    └── theme-provider.tsx   # Theme provider (dark/light mode)
```

---

## Type Definitions

### FastAPI Types (`src/type/fastapi/`)

- Match backend Pydantic schemas exactly
- File naming: `[resource].d.ts` (e.g., `posts.d.ts`, `user.d.ts`)
- Include all response fields including optional ones
- Use `| null` for nullable fields

### Football API Types (`src/type/footballapi/`)

- Match third-party API response structure
- File naming: `[resource].d.ts` (e.g., `fixture.d.ts`, `standing.d.ts`)
- Include nested types and optional fields

---

## Authentication Pattern

### Token Storage (`src/services/fastapi/token-storage.ts`)

**Purpose**: Safari compatibility (Safari blocks SameSite=None cookies)

**Storage**: `localStorage` (persists across sessions)

**Functions**:

- `storeToken(token: string)`: Store JWT token
- `getStoredToken()`: Retrieve token
- `clearStoredToken()`: Remove token on logout
- `getAuthHeader()`: Get `Bearer {token}` header value

### Authentication Flow

1. Backend sets HttpOnly cookies (primary method)
2. Frontend stores token in `localStorage` as fallback (Safari)
3. API calls include `Authorization: Bearer {token}` header if available
4. Backend falls back to cookies if no Authorization header

---

## Styling & Theming

### Theme System

**Location**: `src/app/globals.css` and `tailwind.config.ts`

**Pattern**: CSS variables for colors, supports dark/light mode

**Colors**: Defined in `:root` and `.dark` selectors

**Usage**: Use Tailwind classes that reference CSS variables

### Color Scale

- `primary`: Main brand color (HSL: 184 72% 27%)
- `background`: Page background
- `foreground`: Text color
- `card`: Card background
- `muted`: Muted text/backgrounds
- `destructive`: Error/danger actions
- `border`: Border colors
- All colors adapt automatically in dark mode

### Component Styling

- Use shadcn/ui components from `src/components/ui/`
- Customize via Tailwind classes
- Ensure components work in both light and dark modes
- Use semantic color names (e.g., `text-primary`, `bg-card`)

---

## React Query Configuration

### Query Client (`src/providers/query-client.tsx`)

- Single `QueryClient` instance exported
- Wrapped in `QueryClientProvider` at root layout

### Query Patterns

**Stale Times**:

- Live data (scores): 30 seconds
- Fixtures list: 2 hours
- News: 5 minutes
- Odds: 3 hours

**Refetch Intervals**: Only for live/real-time data

**Refetch On Window Focus**: Usually `false` to prevent unnecessary requests

**Query Keys**: Include all parameters that affect the data, sort arrays consistently

---

## Component Patterns

### Page Components

- Use `"use client"` directive for client components
- Fetch data using React Query hooks
- Handle loading, error, and empty states
- Use `useMemo` for derived data transformations

### UI Components

- Use shadcn/ui components as base
- Extend with custom styling via `className`
- Ensure dark mode compatibility
- Use semantic HTML and accessibility best practices

---

## Best Practices

### Data Fetching

- ✅ Use Next.js API routes for third-party APIs (cost control)
- ✅ Use React Query for all FastAPI requests
- ✅ Set appropriate stale times and refetch intervals
- ✅ Include all query parameters in query keys
- ✅ Invalidate queries after mutations

### Error Handling

- ✅ Handle 401 (unauthorized) by redirecting to login
- ✅ Handle 403 (forbidden) with user-friendly messages
- ✅ Handle 404 (not found) appropriately
- ✅ Handle validation errors (422) with field-specific messages
- ✅ Provide fallback UI for network errors

### Type Safety

- ✅ Match backend schemas exactly in TypeScript types
- ✅ Use type definitions for all API responses
- ✅ Avoid `any` types, use proper interfaces
- ✅ Handle nullable/optional fields correctly

### Performance

- ✅ Use `useMemo` for expensive computations
- ✅ Use `useCallback` for stable function references
- ✅ Implement optimistic updates for mutations
- ✅ Use Next.js Image component for images
- ✅ Lazy load heavy components when possible

### Accessibility

- ✅ Use semantic HTML elements
- ✅ Include proper ARIA labels
- ✅ Ensure keyboard navigation works
- ✅ Maintain color contrast ratios
- ✅ Test with screen readers

### Code Organization

- ✅ Group related files in feature folders
- ✅ Keep components small and focused
- ✅ Extract reusable logic into hooks
- ✅ Use consistent naming conventions
- ✅ Add JSDoc comments for complex functions

---

## Environment Variables

### Required Variables

- `NEXT_PUBLIC_BACKEND_URL`: FastAPI backend URL
- `API_SPORTS_KEY` / `FOOTBALL_API_KEY`: Third-party API key
- `FOOTBALL_API_URL`: Third-party API base URL (optional)

### Optional Variables

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name (for image uploads)
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`: Cloudinary upload preset

---

**For implementation patterns and code examples, see `.cursor/rules/my-frontend-rule.mdc`**
