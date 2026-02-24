import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },

  staticPageGenerationTimeout: 120,

  output: "standalone",

  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

const analyze = withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

export default analyze(nextConfig);
