import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Montserrat, Open_Sans } from "next/font/google"
import "./globals.css"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Reno Mini",
  description: "A mini project to showcase skills in Next.js, MySQL, Python FLask and Tailwind CSS",
    generator: 'v0.app'
}

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700", "900"],
  display: "swap",
  variable: "--font-montserrat",
})

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-open-sans",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} ${openSans.variable} antialiased`}
    >
      <body className="font-sans bg-background text-foreground app-bg">
        <header className="bg-primary text-primary-foreground sticky top-0 z-40 shadow-sm/50">
          <div className="page-shell flex items-center justify-between gap-4 py-3">
            <Link href="/showSchools" className="flex items-center gap-2">
              <span className="inline-block h-6 w-6 rounded-md bg-secondary/90" aria-hidden />
              <span className="font-heading h-title text-lg md:text-xl">School Data</span>
            </Link>
            <nav className="flex items-center gap-2 md:gap-3">
              <Link
                href="/showSchools"
                className="link-pill transition hover:bg-secondary hover:text-secondary-foreground"
              >
                Browse
              </Link>
              <Link href="/addSchool" className="btn-cta">
                Add School
              </Link>
            </nav>
          </div>
        </header>
        <div className="min-h-dvh">{children}</div>
      </body>
    </html>
  )
}
