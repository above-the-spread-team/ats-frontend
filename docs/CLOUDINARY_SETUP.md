# Cloudinary Setup Guide

## Overview

Cloudinary is used to optimize external news images from various sources (NewsAPI.ai, etc.) by:
- Converting to modern formats (WebP/AVIF)
- Optimizing quality automatically
- Caching images for better performance
- Reducing bandwidth usage

## Configuration Steps

### 1. Get Your Cloudinary Cloud Name

1. Sign up or log in to [Cloudinary](https://cloudinary.com)
2. Go to Dashboard
3. Copy your **Cloud Name** (e.g., `daiknytnh`)

### 2. Set Environment Variable

Add to your `.env.local` file:

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### 3. Configure Fetch API Settings

Since news images come from various sources (you don't know all domains in advance), you need to allow fetching from all domains:

#### Option A: Allow All Domains (Recommended for News)

1. Go to **Cloudinary Dashboard** → **Settings** → **Security**
2. Under **"Restricted media types"**, **uncheck "Fetched URL"** OR
3. Under **"Allowed fetch domains"**, **leave the list empty** (allows all domains)
4. Click **Save**

**Why this is safe for news images:**
- News images are public content from reputable sources
- Cloudinary only fetches and optimizes images, doesn't store them permanently
- The fetch API is read-only for external URLs
- Your account is only used for optimization, not hosting

#### Option B: Restrict to Specific Domains (More Secure)

If you want to restrict to known news image domains:

1. Go to **Cloudinary Dashboard** → **Settings** → **Security**
2. Under **"Allowed fetch domains"**, add domains like:
   - `images.ladbible.com`
   - `cdn.example.com`
   - (add other known news image domains)
3. Click **Save**

**Note:** This requires maintaining a list of domains, which may not be practical for news from various sources.

### 4. Verify Configuration

After configuration, test by:

1. Check browser Network tab when loading news images
2. Images should load from `res.cloudinary.com` URLs
3. If you see 401 errors, check your Security settings again
4. Images will automatically fall back to original URLs if Cloudinary fails

## Troubleshooting

### 401 Unauthorized Error

**Symptoms:** Images fail to load, browser shows 401 error for Cloudinary URLs

**Solutions:**
1. ✅ Check Cloudinary Dashboard → Settings → Security
2. ✅ Ensure "Fetched URL" restriction is unchecked OR "Allowed fetch domains" is empty
3. ✅ Verify `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set correctly
4. ✅ Restart your Next.js dev server after changing env variables
5. ✅ Images will automatically fall back to original URLs (no user-facing errors)

### Images Not Optimizing

**Symptoms:** Images load but aren't using Cloudinary URLs

**Solutions:**
1. ✅ Check browser Network tab - are requests going to `res.cloudinary.com`?
2. ✅ Verify environment variable is loaded (check in browser console)
3. ✅ Check Cloudinary Dashboard for any account restrictions
4. ✅ Ensure images are external URLs (not local paths)

### Account Restrictions

**Symptoms:** Cloudinary fetch feature disabled

**Solutions:**
1. ✅ Cloudinary may disable fetch if unused for 7 days after account creation
2. ✅ Contact Cloudinary support to re-enable fetch feature
3. ✅ Images will fall back to original URLs automatically

## Security Considerations

### For Public News Images (Current Use Case)

**Allowing all fetch domains is safe because:**
- ✅ News images are public content
- ✅ Cloudinary fetch is read-only (doesn't modify source images)
- ✅ No permanent storage of fetched images
- ✅ Only used for optimization, not hosting
- ✅ Images are from reputable news sources

### For User-Uploaded Content (Future)

If you add user uploads later:
- Use Cloudinary upload API (not fetch)
- Implement signed URLs for security
- Use upload presets with restrictions
- Store uploaded images in Cloudinary (not fetch)

## How It Works

1. **Backend** stores raw image URLs from NewsAPI.ai in `image_url` column
2. **Frontend** calls `getOptimizedNewsImage(image_url, width)`
3. **Cloudinary** fetches the external image, optimizes it, and serves it
4. **Browser** loads optimized image from Cloudinary CDN
5. **Fallback** If Cloudinary fails (401), browser automatically uses original URL

## Code Usage

```typescript
import { getOptimizedNewsImage } from "@/lib/cloudinary";

// Grid card (500px)
<Image
  src={getOptimizedNewsImage(article.image_url, 500)}
  alt={article.title}
  onError={(e) => {
    // Fallback to original URL if Cloudinary fails
    const target = e.target as HTMLImageElement;
    if (article.image_url && target.src !== article.image_url) {
      target.src = article.image_url;
    }
  }}
/>

// Detail page (1600px)
<Image
  src={getOptimizedNewsImage(news.image_url, 1600)}
  alt={news.title}
  onError={(e) => {
    const target = e.target as HTMLImageElement;
    if (news.image_url && target.src !== news.image_url) {
      target.src = news.image_url;
    }
  }}
/>
```

## References

- [Cloudinary Fetch API Documentation](https://cloudinary.com/documentation/fetch_remote_images)
- [Cloudinary Security Settings](https://cloudinary.com/documentation/developer_onboarding_faq_account_security)
- [Cloudinary Fetch Troubleshooting](https://cloudinary.com/documentation/fetch_remote_images#troubleshooting)
