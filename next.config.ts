import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep a custom dist dir for local Windows builds, but use Next.js default
  // output on Vercel so deployment expects `.next/routes-manifest.json`.
  distDir: process.env.VERCEL ? ".next" : ".next-build",
  webpack: (config) => {
    // Work around WasmHash crashes in some Node/webpack combinations.
    config.output.hashFunction = "sha256";
    return config;
  },
};

export default nextConfig;
