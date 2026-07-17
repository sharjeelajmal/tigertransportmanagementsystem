import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.VERCEL ? ".next" : ".next-build",
  serverExternalPackages: ['puppeteer', 'puppeteer-core', '@sparticuz/chromium-min'],
  webpack: (config, { isServer }) => {
    config.output.hashFunction = "sha256";
    if (isServer) {
      const existingExternals = Array.isArray(config.externals) ? config.externals : config.externals ? [config.externals] : [];
      config.externals = [
        ...existingExternals,
        '@sparticuz/chromium-min',
        'puppeteer-core',
        'puppeteer',
      ];
    }
    return config;
  },
};

export default nextConfig;
