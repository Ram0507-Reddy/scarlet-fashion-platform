import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    turbo: {
      // rules: {} // empty object implies turbo enabled but no rules. 
      // effectively, 'turbo: false' is deprecated/removed in recent versions.
      // But user asked for it. 
      // I will trust the user prompt "Option B" code block EXACTLY.
    }
  },
};

export default nextConfig;
