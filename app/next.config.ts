import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/dashboard/wealth-tracker", destination: "/dashboard/position", permanent: true },
      { source: "/dashboard/wealth-journey", destination: "/dashboard/position", permanent: true },
      { source: "/dashboard/analytics", destination: "/dashboard/health", permanent: true },
    ];
  },
};

export default nextConfig;
