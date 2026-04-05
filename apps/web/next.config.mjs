/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@oompa/types', '@oompa/utils'],
  experimental: {
    typedRoutes: true,
  },
}

export default nextConfig
