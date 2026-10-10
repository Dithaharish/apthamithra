"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { homeFor } from "@/auth"

export function RegisterForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [country, setCountry] = useState("")
  const [timezone, setTimezone] = useState("")
  const [language, setLanguage] = useState("English")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, country, timezone, language }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || "Registration failed")
      setLoading(false)
      return
    }

    const signInRes = await signIn("credentials", { email, password, redirect: false })
    if (signInRes?.error) {
      setError("Account created, but sign-in failed. Please log in.")
      setLoading(false)
      return
    }

    // New accounts are customers by default.
    router.push(homeFor("CUSTOMER"))
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" placeholder="Raj Mehta" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="raj@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="country">Country</Label>
          <Select value={country} onValueChange={setCountry} required>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Country" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="USA">USA</SelectItem>
              <SelectItem value="UK">UK</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
              <SelectItem value="UAE">UAE</SelectItem>
              <SelectItem value="Australia">Australia</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone} required>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="TZ" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="America/New_York">Eastern</SelectItem>
              <SelectItem value="America/Chicago">Central</SelectItem>
              <SelectItem value="America/Los_Angeles">Pacific</SelectItem>
              <SelectItem value="Europe/London">London</SelectItem>
              <SelectItem value="Asia/Dubai">Dubai</SelectItem>
              <SelectItem value="Australia/Sydney">Sydney</SelectItem>
              <SelectItem value="Asia/Kolkata">India (IST)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="language">Preferred Language</Label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="English">English</SelectItem>
            <SelectItem value="Hindi">Hindi</SelectItem>
            <SelectItem value="Gujarati">Gujarati</SelectItem>
            <SelectItem value="Tamil">Tamil</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1.5" />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  )
}
