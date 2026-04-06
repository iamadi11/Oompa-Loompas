import { withSerwist } from '@serwist/turbopack'

const apiUpstream = process.env.API_URL ?? 'http://localhost:3001'

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@oompa/types', '@oompa/utils'],
  typedRoutes: true,
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiUpstream.replace(/\/$/, '')}/api/v1/:path*`,
      },
    ]
  },
}

export default withSerwist(nextConfig)
