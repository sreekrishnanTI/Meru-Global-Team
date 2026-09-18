import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "https", hostname: "**" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/admin/:path*",
        destination: "http://localhost:5000/api/admin/:path*",
      },
      {
        source: "/api/homepage/:path*",
        destination: "http://localhost:5000/api/homepage/:path*",
      },
      {
        source: "/api/homepage",
        destination: "http://localhost:5000/api/homepage",
      },
      {
        source: "/api/programs/:path*",
        destination: "http://localhost:5000/api/programs/:path*",
      },
      {
        source: "/api/programs",
        destination: "http://localhost:5000/api/programs",
      },
      {
        source: "/api/testimonials/:path*",
        destination: "http://localhost:5000/api/testimonials/:path*",
      },
      {
        source: "/api/testimonials",
        destination: "http://localhost:5000/api/testimonials",
      },
      {
        source: "/api/media/:path*",
        destination: "http://localhost:5000/api/media/:path*",
      },
      {
        source: "/api/media",
        destination: "http://localhost:5000/api/media",
      },
      {
        source: "/api/pages/:path*",
        destination: "http://localhost:5000/api/pages/:path*",
      },
      {
        source: "/api/pages",
        destination: "http://localhost:5000/api/pages",
      },
      {
        source: "/api/contact/:path*",
        destination: "http://localhost:5000/api/contact/:path*",
      },
      {
        source: "/api/contact",
        destination: "http://localhost:5000/api/contact",
      },
      {
        source: "/api/dashboard",
        destination: "http://localhost:5000/api/dashboard",
      },
      {
        source: "/api/health/:path*",
        destination: "http://localhost:5000/api/health/:path*",
      },
      {
        source: "/api/health",
        destination: "http://localhost:5000/api/health",
      },
      {
        source: "/uploads/:path*",
        destination: "http://localhost:5000/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
