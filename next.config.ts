import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    domains: ["departments/it_img.jpeg"],
  },
};

export default nextConfig;
