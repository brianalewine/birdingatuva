"use client"

import { useEffect, useState } from "react"

export function DecorativeBirds() {
  const [scrollY, setScrollY] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!mounted) return null

  const getBackgroundColor = () => {
    if (scrollY < 600) return "transparent"
    if (scrollY < 1200) return "rgba(69, 123, 157, 0.03)"
    if (scrollY < 2000) return "rgba(45, 106, 79, 0.03)"
    return "rgba(232, 119, 34, 0.02)"
  }

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-colors duration-1000"
        style={{ backgroundColor: getBackgroundColor() }}
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Large bird silhouette - top right */}
        <div
          className="absolute opacity-15 parallax-bird"
          style={{
            top: "10%",
            right: "5%",
            transform: `translateY(${scrollY * 0.2}px) rotate(${scrollY * 0.05}deg)`,
            width: "200px",
            height: "200px",
          }}
        >
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-primary animate-float-slow">
            <path d="M50 20 Q30 30 20 50 Q30 45 50 50 Q70 45 80 50 Q70 30 50 20 M50 50 L50 80 M40 60 Q45 65 50 80 Q55 65 60 60" />
          </svg>
        </div>

        {/* Medium bird - left side */}
        <div
          className="absolute opacity-12 parallax-bird"
          style={{
            top: "30%",
            left: "8%",
            transform: `translateY(${scrollY * 0.15}px) rotate(${-scrollY * 0.03}deg)`,
            width: "150px",
            height: "150px",
          }}
        >
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-accent animate-float">
            <path d="M50 30 Q35 35 25 50 Q35 47 50 50 Q65 47 75 50 Q65 35 50 30 M50 50 L50 70 M45 55 Q47 60 50 70 Q53 60 55 55" />
          </svg>
        </div>

        {/* Large bird - middle right */}
        <div
          className="absolute opacity-10 parallax-bird"
          style={{
            top: "50%",
            right: "15%",
            transform: `translateY(${scrollY * 0.25}px) rotate(${scrollY * 0.04}deg) scale(${1 + scrollY * 0.0001})`,
            width: "180px",
            height: "180px",
          }}
        >
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-secondary animate-float-fast">
            <path d="M50 25 Q32 32 22 50 Q32 46 50 50 Q68 46 78 50 Q68 32 50 25 M50 50 L50 75 M42 58 Q46 63 50 75 Q54 63 58 58" />
          </svg>
        </div>

        {/* Small bird - bottom left */}
        <div
          className="absolute opacity-15 parallax-bird"
          style={{
            top: "70%",
            left: "12%",
            transform: `translateY(${scrollY * 0.18}px) rotate(${-scrollY * 0.06}deg)`,
            width: "120px",
            height: "120px",
          }}
        >
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-primary animate-float-slow">
            <path d="M50 35 Q38 40 30 52 Q38 50 50 52 Q62 50 70 52 Q62 40 50 35 M50 52 L50 68 M46 57 Q48 61 50 68 Q52 61 54 57" />
          </svg>
        </div>

        {/* Extra large bird - far right */}
        <div
          className="absolute opacity-8 parallax-bird"
          style={{
            top: "85%",
            right: "10%",
            transform: `translateY(${scrollY * 0.12}px) rotate(${scrollY * 0.02}deg)`,
            width: "220px",
            height: "220px",
          }}
        >
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-accent animate-float">
            <path d="M50 22 Q28 28 18 48 Q28 44 50 48 Q72 44 82 48 Q72 28 50 22 M50 48 L50 78 M38 56 Q44 62 50 78 Q56 62 62 56" />
          </svg>
        </div>

        {/* Floating particles for depth */}
        <div
          className="absolute w-3 h-3 rounded-full bg-accent/20 animate-particle"
          style={{
            top: "15%",
            left: "25%",
            animationDelay: "0s",
          }}
        />
        <div
          className="absolute w-2 h-2 rounded-full bg-primary/20 animate-particle"
          style={{
            top: "45%",
            right: "30%",
            animationDelay: "2s",
          }}
        />
        <div
          className="absolute w-4 h-4 rounded-full bg-secondary/15 animate-particle"
          style={{
            top: "65%",
            left: "40%",
            animationDelay: "4s",
          }}
        />
      </div>
    </>
  )
}
