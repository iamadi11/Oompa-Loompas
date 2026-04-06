import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  reloadOnOnline: true,
  fallbacks: {
    document: '/offline',
  },
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: ({ url }) => url.pathname.startsWith('/api/v1'),
        handler: 'NetworkOnly',
      },
    ],
  },
})

const apiUpstream = process.env.API_URL ?? 'http://localhost:3001'

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@oompa/types', '@oompa/utils'],
  experimental: {
    typedRoutes: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiUpstream.replace(/\/$/, '')}/api/v1/:path*`,
      },
    ]
  },
}

export default withPWA(nextConfig)
