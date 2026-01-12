/**
 * Cloudinary utility functions for image optimization
 * Uses Cloudinary's Fetch API to optimize external images
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/**
 * Get optimized image URL using Cloudinary's Fetch API
 * @param url - Original image URL (can be null/undefined)
 * @param options - Optional transformation parameters
 * @returns Optimized Cloudinary URL or fallback
 */
export function getOptimizedImage(
  url: string | null | undefined,
  options: {
    width?: number;
    height?: number;
    quality?: "auto" | number;
    format?: "auto" | "webp" | "avif" | "jpg" | "png";
    crop?: string;
  } = {}
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
    console.warn("CLOUDINARY_CLOUD_NAME not configured, using original URL");
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
 * Optimized for news article images: larger size, auto format, auto quality
 * @param imageUrl - News image URL
 * @param width - Desired width (default: 800)
 * @returns Optimized Cloudinary URL
 */
export function getOptimizedNewsImage(
  imageUrl: string | null | undefined,
  width: number = 800
): string {
  return getOptimizedImage(imageUrl, {
    width,
    format: "auto",
    quality: "auto",
    crop: "fit",
  });
}
