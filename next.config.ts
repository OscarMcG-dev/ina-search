/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  env: {
    RESEND_API_KEY: process.env.RESEND_API_KEY
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "localhost:3001"]
    }
  }
};

export default nextConfig;
