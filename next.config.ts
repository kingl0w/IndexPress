import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  // No <Image> optimization needed — covers are CSS gradients, Gutenberg has no images
  images: {
    unoptimized: true,
  },

  // 50K+ pages need a generous timeout per page during static generation
  staticPageGenerationTimeout: 120,

  // Produce standalone output for easy containerized deployment
  output: "standalone",

  // Suppress noisy build logs for thousands of static pages
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

const analyze = withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

export default analyze(nextConfig);
