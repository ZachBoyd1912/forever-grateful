import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Prisma on Cloudflare Workers — lets OpenNext patch + bundle the client.
  // pg + pg-cloudflare are external so their runtime requires (pg lazily
  // requires pg-cloudflare for Workers sockets) are traced as externals
  // instead of failing OpenNext's static esbuild bundling.
  serverExternalPackages: ["@prisma/client", ".prisma/client", "pg", "pg-cloudflare"],
  async headers() {
    return [
      {
        source: '/api/ingest',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://roobet.com' },
          { key: 'Access-Control-Allow-Methods', value: 'POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, x-api-key' },
        ],
      },
    ]
  },
};

export default nextConfig;
