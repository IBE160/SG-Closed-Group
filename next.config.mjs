/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimized for Vercel deployment
  output: 'standalone',

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google OAuth profile images
      },
    ],
  },

  // Environment variables
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
};

export default nextConfig;
