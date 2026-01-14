/**
 * Cloudinary utility functions for image optimization
 * Uses Cloudinary's Fetch API to optimize external images
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/**
 * Get optimized image URL using Cloudinary's Fetch API
 *
 * Note: If Cloudinary fetch fails (e.g., 401 Unauthorized), the browser will
 * fall back to the original URL automatically. This function always returns
 * the Cloudinary URL if configured, allowing Cloudinary to handle optimization
 * when possible, and falling back gracefully when not.
 *
 * @param url - Original image URL (can be null/undefined)
 * @param options - Optional transformation parameters
 * @param fallbackToOriginal - If true, return original URL if Cloudinary not configured (default: false)
 * @returns Optimized Cloudinary URL or original URL as fallback
 */
export function getOptimizedImage(
  url: string | null | undefined,
  options: {
    width?: number;
    height?: number;
    quality?: "auto" | number;
    format?: "auto" | "webp" | "avif" | "jpg" | "png";
    crop?: string;
  } = {},
  fallbackToOriginal: boolean = false
): string {
  // Return fallback if no URL provided
  if (!url) {
    return "/images/logo.png"; // Fallback to your default logo
  }

  // If it's already a Cloudinary URL, return as is (avoid double processing)
  if (url.includes("cloudinary.com")) {
    return url;
  }

  // If it's a local/relative URL, return as is
  if (url.startsWith("/") || url.startsWith("data:")) {
    return url;
  }

  // If Cloudinary is not configured, return original URL
  if (!CLOUD_NAME) {
    if (fallbackToOriginal) {
      console.warn("CLOUDINARY_CLOUD_NAME not configured, using original URL");
    }
    return url;
  }

  // Build Cloudinary transformation parameters
  const transformations: string[] = [];

  // Format: auto chooses best format (WebP/AVIF)
  if (options.format === "auto" || !options.format) {
    transformations.push("f_auto");
  } else {
    transformations.push(`f_${options.format}`);
  }

  // Quality: auto reduces file size without losing quality
  if (options.quality === "auto" || !options.quality) {
    transformations.push("q_auto");
  } else {
    transformations.push(`q_${options.quality}`);
  }

  // Width
  if (options.width) {
    transformations.push(`w_${options.width}`);
  }

  // Height
  if (options.height) {
    transformations.push(`h_${options.height}`);
  }

  // Crop mode
  if (options.crop) {
    transformations.push(`c_${options.crop}`);
  }

  // Build Cloudinary Fetch API URL
  // Format: https://res.cloudinary.com/{cloud_name}/image/fetch/{transformations}/{source_url}
  const transformationString = transformations.join(",");
  const encodedUrl = encodeURIComponent(url);
  const cloudinaryUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${transformationString}/${encodedUrl}`;

  return cloudinaryUrl;
}

/**
 * Get optimized team logo URL
 * @param logoUrl - Team logo URL from API
 * @param width - Desired width in pixels (default: 100 for general use)
 *   - 48-64px: Small logos for list/grid views
 *   - 100px: Default, good for medium-sized displays
 *   - 120-150px: Large logos for detail pages/headers
 * @returns Optimized Cloudinary URL
 */
export function getOptimizedLogo(
  logoUrl: string | null | undefined,
  width: number = 100
): string {
  return getOptimizedImage(logoUrl, {
    width,
    format: "auto",
    quality: "auto",
    crop: "fit", // Maintain aspect ratio
  });
}

/**
 * Get optimized news image URL
 *
 * For General News (non-preview articles):
 * - Backend uploads images to Cloudinary and stores Cloudinary URLs directly
 * - This function adds transformations (width, format, quality) for responsive sizing
 * - Automatically converts to WebP/AVIF format
 * - Optimizes quality automatically
 * - Can also return URL as-is if no transformations needed
 *
 * For Match Previews:
 * - Uses team logos from API (handled separately by PreviewImage component)
 *
 * @param imageUrl - Cloudinary URL from database (e.g., https://res.cloudinary.com/daiknytnh/image/upload/...)
 * @param width - Desired width in pixels (optional, if not provided returns URL as-is)
 *   - 500px: Grid cards (3-column layout)
 *   - 800px: Default, good for most displays
 *   - 1600px: Detail page (full-width display)
 * @returns Cloudinary URL with transformations, or original URL if no width specified
 *
 * @example
 * // Use directly (no transformations)
 * <img src={news.image_url} alt={news.title} />
 *
 * // Add transformations for responsive sizing
 * <img src={getOptimizedNewsImage(article.image_url, 500)} alt={article.title} />
 * <img src={getOptimizedNewsImage(news.image_url, 1600)} alt={news.title} />
 */
export function getOptimizedNewsImage(
  imageUrl: string | null | undefined,
  width?: number
): string {
  if (!imageUrl) {
    return "/images/logo.png";
  }

  // If no width specified, return URL as-is (backend already optimized it)
  if (!width) {
    return imageUrl;
  }

  // If it's already a Cloudinary URL (backend uploaded images), add transformations
  if (
    imageUrl.includes("cloudinary.com") &&
    imageUrl.includes("/image/upload/")
  ) {
    // Parse Cloudinary URL structure:
    // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
    // or:     https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}.{format}

    const uploadIndex = imageUrl.indexOf("/image/upload/");
    if (uploadIndex !== -1) {
      const baseUrl = imageUrl.substring(
        0,
        uploadIndex + "/image/upload/".length
      );
      const afterUpload = imageUrl.substring(
        uploadIndex + "/image/upload/".length
      );

      // Build transformation string
      const transformations = [
        `w_${width}`,
        "f_auto", // Auto chooses WebP/AVIF
        "q_auto", // Automatic quality optimization
        "c_fit", // Maintain aspect ratio
      ].join(",");

      // Insert transformations after /image/upload/
      // This will add transformations before any existing version/public_id
      return `${baseUrl}${transformations}/${afterUpload}`;
    }
  }

  // If not a Cloudinary URL (shouldn't happen for general news, but handle gracefully)
  return imageUrl;
}
