"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const links = [
    { href: "/", label: "Home" },
    //{ href: "/leadership", label: "Leadership" },
    { href: "/faq", label: "FAQ" },
  ]

  return (
  <nav className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Name */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <Image
              src="/images/club-logo.png"
              alt="Birding at UVA Logo"
              width={50}
              height={50}
              className="rounded-full"
              quality={90}
              sizes="50px"
            />
            <div className="hidden sm:flex flex-col">
              <span className="font-sans text-xl md:text-2xl font-semibold tracking-wide">
                Birding at UVA
              </span>
              <span className="font-sans text-xs md:text-sm font-light italic -mt-1">
                Hoo's Watching Hoo?
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg transition-all ${
                  pathname === link.href
                    ? "bg-primary-foreground text-primary font-semibold"
                    : "hover:bg-primary-foreground/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-primary-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg transition-all ${
                  pathname === link.href
                    ? "bg-primary-foreground text-primary font-semibold"
                    : "hover:bg-primary-foreground/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
