import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid lock contention with stale .next artifacts on Windows.
  distDir: ".next-build",
  webpack: (config) => {
    // Work around WasmHash crashes in some Node/webpack combinations.
    config.output.hashFunction = "sha256";
    return config;
  },
};

export default nextConfig;
