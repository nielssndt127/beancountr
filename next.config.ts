import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "beancountr.co.uk" }],
        destination: "https://www.beancountr.co.uk/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "beancountr.com" }],
        destination: "https://www.beancountr.co.uk/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.beancountr.com" }],
        destination: "https://www.beancountr.co.uk/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
