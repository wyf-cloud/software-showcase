import type { NextConfig } from "next";

const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  ...(isStaticExport ? {
    output: "export",
    trailingSlash: true,
    basePath,
    images: { unoptimized: true },
  } : {}),
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
