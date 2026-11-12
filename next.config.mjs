/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["mongoose"],
    webpackBuildWorker: true,
    memoryBasedWorkersCount: true,
  },
};

export default nextConfig;

