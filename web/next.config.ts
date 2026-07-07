import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Disable trailing slash so Tauri asset URLs resolve correctly
  trailingSlash: false,
};

export default nextConfig;
