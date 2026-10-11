import type { NextAuthOptions } from "next-auth"
import type { DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { normalizeEmail } from "@/lib/normalize"
import { db } from "@/lib/db"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "CUSTOMER" | "SHOPPER" | "ADMIN"
    } & DefaultSession["user"]
  }
  interface User {
    role: "CUSTOMER" | "SHOPPER" | "ADMIN"
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await db.user.findUnique({ email: normalizeEmail(credentials.email) })
        if (!user || !user.passwordHash) return null
        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as "CUSTOMER" | "SHOPPER" | "ADMIN"
      }
      return session
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
}

/**
 * Where a user lands after signing in, based on their role.
 */
export function homeFor(role?: string | null): string {
  switch (role) {
    case "ADMIN":
      return "/admin"
    case "SHOPPER":
      return "/shopper"
    default:
      return "/dashboard"
  }
}

export default authOptions
