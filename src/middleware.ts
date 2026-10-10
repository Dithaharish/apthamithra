import { withAuth } from "next-auth/middleware"

/**
 * Role-based route protection.
 *
 * Being signed in is not enough — each workspace is restricted by role:
 *   /admin/*     ADMIN only
 *   /shopper/*   SHOPPER and ADMIN
 *   /dashboard/* any signed-in user
 */
export default withAuth({
  callbacks: {
    authorized({ token, req }) {
      const { pathname } = req.nextUrl

      if (pathname.startsWith("/admin")) {
        return token?.role === "ADMIN"
      }
      if (pathname.startsWith("/shopper")) {
        return token?.role === "SHOPPER" || token?.role === "ADMIN"
      }
      if (pathname.startsWith("/dashboard")) {
        return Boolean(token)
      }
      return true
    },
  },
  pages: {
    signIn: "/login",
  },
})

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/shopper/:path*"],
}
