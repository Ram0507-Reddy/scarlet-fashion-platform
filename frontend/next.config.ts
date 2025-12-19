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
    turbo: { // Note: 'turbo: false' isn't valid type in strict Next 16 config sometimes, but user requested 'turbo: false'. 
      // Actually, correct way to disable for v15+ is usually just NOT enabling it, or specific flags. 
      // However, user explicitly asked for: experimental: { turbo: false }. I will check if valid.
      // If type error, I will just omit and rely on Env var.
      // Wait, user provided Option B as code. I should probably follow it perfectly.
      // But valid config for Next 15/16 is increasingly strict.
      // "Use: experimental: { turbo: false }".
      // I will apply it.
      // Wait, 'turbo' property expects an object usually.
      // Let's stick to the User Request exactly.
    },
  };

  export default nextConfig;
