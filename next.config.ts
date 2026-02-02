import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for Electron
  output: "export",

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Ensure trailing slashes for file:// protocol compatibility
  trailingSlash: true,
};

export default nextConfig;
