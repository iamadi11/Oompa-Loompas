import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@oompa/types', '@oompa/utils'],
  experimental: {
    typedRoutes: true,
  },
}

export default nextConfig
