import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.api-sports.io",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Ensure Fast Refresh is enabled
  // reactStrictMode: true,
};

export default nextConfig;
