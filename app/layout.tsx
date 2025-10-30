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
  title: "Birding at UVA",
  description: "Birding Club at the University of Virginia  - Join us for birding trips, education, and community",
  icons: {
    icon: "/images/club-logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${bebasNeue.variable} ${playfair.variable} font-sans antialiased bg-background`}>
        <div className="min-h-screen flex flex-col">
          {/* Temporary banner for announcements. Comment out this section when the banner is not needed. */}
          <div className="bg-yellow-100 border-b border-yellow-300 py-4 text-center rounded-md shadow-md">
            <h2 className="text-2xl font-bold text-yellow-800">Birding Club Interest Meetings!</h2>
            <p className="text-yellow-700">Wed Nov 5, 6:30pm-7:30pm at Gibson 142</p>
            <p className="text-yellow-700">Tue Nov 11, 6:30pm-7:30pm at New Cabell 232</p>
          </div>
          {children}
        </div>
      </body>
    </html>
  )
}
