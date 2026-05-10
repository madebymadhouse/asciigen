import type { NextConfig } from "next";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(appDir, "../..");

const nextConfig: NextConfig = {
  transpilePackages: ["@asciigen/engine"],
  turbopack: {
    root: repoRoot,
  },
};

export default nextConfig;
