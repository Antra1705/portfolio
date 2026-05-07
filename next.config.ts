import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/portfolio',
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
