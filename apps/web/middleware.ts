import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_SESSION_COOKIE_NAME } from './lib/auth-cookie-name'

function isProtectedPath(pathname: string): boolean {
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) return true
  if (pathname === '/deals' || pathname.startsWith('/deals/')) return true
  if (pathname === '/attention' || pathname.startsWith('/attention/')) return true
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return true
  return false
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value

  if (pathname === '/' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (isProtectedPath(pathname) && !session) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/dashboard',
    '/dashboard/:path*',
    '/deals',
    '/deals/:path*',
    '/attention',
    '/attention/:path*',
    '/admin',
    '/admin/:path*',
  ],
}
