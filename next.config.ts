import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Enable unminified builds for easier debugging in production when DEBUG_MODE is set
  ...(process.env.NEXT_PUBLIC_DEBUG_MODE === 'true' && {
    productionBrowserSourceMaps: true,
    compiler: {
      removeConsole: false,
    },
  }),
};

export default nextConfig;
