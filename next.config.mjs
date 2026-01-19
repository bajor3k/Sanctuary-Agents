/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Your existing webpack config, if any, goes here
    return config;
  },
  experimental: {
    // Empty as allowedDevOrigins is moved
  },
  allowedDevOrigins: ["6000-firebase-studio-1747526771127.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev"],
};

export default nextConfig;
