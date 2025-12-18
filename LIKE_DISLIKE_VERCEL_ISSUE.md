# Like/Dislike Functionality Issue: Works on Localhost Safari but Not on Vercel

## Problem Description

The like/dislike functionality for posts and comments works correctly when testing on **localhost with Safari** (both macOS and iOS), but **fails to work when deployed on Vercel**.

## Current Implementation

### Files Affected

- `src/app/(features)/discuss/page.tsx` - Post like/dislike functionality
- `src/app/(features)/discuss/_components/comment-item.tsx` - Comment like/dislike functionality

### Current State Management Approach

Both components use:

1. **Lazy initialization** in `useState` with strict boolean checks:

   ```typescript
   const [userLiked, setUserLiked] = useState(() => post.userLiked === true);
   const [userDisliked, setUserDisliked] = useState(
     () => post.userDisliked === true
   );
   ```

2. **useEffect** to sync state with props:

   ```typescript
   useEffect(() => {
     setUserLiked(post.userLiked === true);
     setUserDisliked(post.userDisliked === true);
     setLikeCount(post.likeCount ?? 0);
     setDislikeCount(post.dislikeCount ?? 0);
   }, [post.userLiked, post.userDisliked, post.likeCount, post.dislikeCount]);
   ```

3. **Optimistic updates** in mutation handlers that update state immediately, then sync with API response.

## Expected Behavior

1. User clicks Like/Dislike on a post or comment
2. UI updates immediately (optimistic update)
3. API call is made to persist the reaction
4. State is updated with the actual API response
5. After page refresh, the like/dislike state persists and is correctly displayed

## Actual Behavior

### On Localhost (Safari) ✅

- All functionality works as expected
- Like/dislike states persist after refresh
- UI correctly reflects backend state

### On Vercel (Safari) ❌

- Like/dislike functionality does not work correctly
- States may not persist after refresh
- UI may not reflect backend state

## Technical Context

### Data Flow

1. Backend API returns `user_reaction: boolean | null` (true for like, false for dislike, null for no reaction)
2. Mapping functions convert this to frontend format:
   ```typescript
   userLiked: post.user_reaction === true,
   userDisliked: post.user_reaction === false,
   ```
3. React Query hooks fetch and cache the data
4. Components receive props and manage local state

### Environment Differences

- **Localhost**: Direct connection to backend, no CDN, development mode
- **Vercel**: Production build, CDN caching, serverless functions, different network conditions

## Potential Causes

1. **React Query caching issues** - Vercel's CDN or edge caching might interfere with query invalidation
2. **Server-side rendering (SSR) hydration mismatch** - Initial state might differ between server and client
3. **Network timing issues** - Vercel's edge network might have different timing for API calls
4. **Build optimization** - Production build might optimize away some state management logic
5. **Environment variables** - Backend URL or API keys might differ between localhost and Vercel
6. **Cookie/authentication issues** - Safari's cookie handling might differ in production vs development

## Questions to Investigate

1. Are the API calls actually being made on Vercel? (Check network tab)
2. Are the API responses correct? (Check response data)
3. Is React Query invalidating queries correctly after mutations?
4. Is there a hydration mismatch between server and client?
5. Are environment variables correctly set on Vercel?
6. Is authentication working correctly on Vercel?
7. Are there any console errors specific to Vercel deployment?

## Request

Please investigate and fix the like/dislike functionality so it works consistently on both localhost and Vercel, especially in Safari browsers.
