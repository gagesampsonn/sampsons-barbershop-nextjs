import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ADMIN_PREFIXES = ['/admin/dashboard', '/admin/analytics']

function isProtectedAdminRoute(pathname: string) {
  return PROTECTED_ADMIN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const pathname = request.nextUrl.pathname

  // Legacy login URL → /admin
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
    const adminUrl = request.nextUrl.clone()
    adminUrl.pathname = '/admin'
    adminUrl.search = request.nextUrl.search
    return NextResponse.redirect(adminUrl)
  }

  if (!url || !key) {
    if (isProtectedAdminRoute(pathname)) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/admin'
      loginUrl.searchParams.set('error', 'setup')
      return NextResponse.redirect(loginUrl)
    }
    return supabaseResponse
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const allowedEmails = (process.env.ADMIN_EMAIL_ALLOWLIST || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  const isAllowedUser =
    user?.email && allowedEmails.includes(user.email.toLowerCase())

  // /admin = login; signed-in users go to dashboard
  if (pathname === '/admin') {
    if (isAllowedUser) {
      const dashboardUrl = request.nextUrl.clone()
      dashboardUrl.pathname = '/admin/dashboard'
      dashboardUrl.search = ''
      return NextResponse.redirect(dashboardUrl)
    }
    return supabaseResponse
  }

  if (isProtectedAdminRoute(pathname)) {
    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/admin'
      return NextResponse.redirect(loginUrl)
    }

    if (!isAllowedUser) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/admin'
      loginUrl.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(loginUrl)
    }
  }

  return supabaseResponse
}
