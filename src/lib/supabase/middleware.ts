import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If no Supabase credentials, allow request to proceed (for dev without Supabase)
  if (!url || !key) {
    // For admin routes without Supabase, redirect to home
    if (request.nextUrl.pathname.startsWith('/admin')) {
      const homeUrl = request.nextUrl.clone()
      homeUrl.pathname = '/'
      return NextResponse.redirect(homeUrl)
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

  // Check if accessing admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Allow access to login page
    if (request.nextUrl.pathname === '/admin/login') {
      // If already logged in, redirect to admin
      if (user) {
        const allowedEmails = (process.env.ADMIN_EMAIL_ALLOWLIST || '').split(',').map(e => e.trim().toLowerCase())
        if (allowedEmails.includes(user.email?.toLowerCase() || '')) {
          const adminUrl = request.nextUrl.clone()
          adminUrl.pathname = '/admin'
          return NextResponse.redirect(adminUrl)
        }
      }
      return supabaseResponse
    }

    // Protect other admin routes
    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/admin/login'
      return NextResponse.redirect(loginUrl)
    }

    // Check if user email is in allowlist
    const allowedEmails = (process.env.ADMIN_EMAIL_ALLOWLIST || '').split(',').map(e => e.trim().toLowerCase())
    if (!allowedEmails.includes(user.email?.toLowerCase() || '')) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/admin/login'
      loginUrl.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(loginUrl)
    }
  }

  return supabaseResponse
}
