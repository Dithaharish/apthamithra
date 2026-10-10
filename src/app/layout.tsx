import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Apthamithra — Rooted in trust. Always by your side",
  description:
    "Book a free video appointment. Our team in India shops from your trusted local shops, shares QC photos and bills, and ships worldwide with full tracking.",
  keywords: ["Apthamithra", "NRI shopping", "personal shopper India", "proxy shopping", "ship from India"],
  authors: [{ name: "Apthamithra" }],
  openGraph: {
    title: "Apthamithra — Rooted in trust. Always by your side",
    description: "We shop, verify and ship from your trusted Indian stores to anywhere in the world.",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
