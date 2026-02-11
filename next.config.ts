import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "@react-email/components", "@clerk/nextjs"],
  },
};

export default nextConfig;
