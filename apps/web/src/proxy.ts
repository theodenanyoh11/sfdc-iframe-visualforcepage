import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isAuthenticated } from '@/lib/auth-server'

const publicRoutes = ['/sign-in', '/sign-up', '/api/auth']

function isPublicRoute(pathname: string) {
  return publicRoutes.some(route => pathname.startsWith(route))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Skip auth check if Convex URL isn't configured yet
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return NextResponse.next()
  }

  // Check authentication
  try {
    const authenticated = await isAuthenticated()

    // Redirect unauthenticated users to /sign-up
    if (!authenticated) {
      return NextResponse.redirect(new URL('/sign-up', request.url))
    }
  } catch {
    // If auth check fails (e.g., Convex not running), allow request through
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
