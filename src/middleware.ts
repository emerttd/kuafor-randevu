import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const session = req.auth
  const { pathname } = req.nextUrl

  if (!session) {
    const signInUrl = new URL("/giris", req.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  const role = session.user?.role

  if (pathname.startsWith("/yonetim") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url))
  }

  if (pathname.startsWith("/calisan") && role !== "ADMIN" && role !== "EMPLOYEE") {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/yonetim/:path*", "/calisan/:path*"],
}
