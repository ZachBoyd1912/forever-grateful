import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Prisma on Cloudflare Workers — lets OpenNext patch + bundle the client.
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
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
