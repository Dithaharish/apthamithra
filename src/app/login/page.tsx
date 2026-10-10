import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="h-12 w-12 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold text-2xl mx-auto">A</div>
            <h1 className="mt-4 text-2xl font-semibold">Welcome back</h1>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">Sign in to your Apthamithra account</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
            <LoginForm />
            <div className="mt-4 text-right">
              <Link href="/forgot-password" className="text-sm text-amber-600 hover:underline">Forgot your password?</Link>
            </div>
            <div className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
              Don&apos;t have an account? <Link href="/register" className="text-amber-600 hover:underline font-medium">Create one</Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}