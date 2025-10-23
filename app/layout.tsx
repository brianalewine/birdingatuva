import type React from "react"
import type { Metadata } from "next"
import { Bebas_Neue, Inter, Playfair_Display } from "next/font/google"
import "./globals.css"

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Hoo's Watching Hoos - UVA Bird Club",
  description: "University of Virginia Birding Club - Join us for birding trips, education, and community",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${bebasNeue.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
