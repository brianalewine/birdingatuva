"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"

interface FlyingBird {
  id: number
  delay: number
  bird: number
  direction: "left" | "right"
  top: number
}

export function DecorativeBirds() {
  const [scrollY, setScrollY] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const [flyingBirds, setFlyingBirds] = useState<FlyingBird[]>([])
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()
  const birdCounterRef = useRef(0)
  const lastScrollYRef = useRef(0)

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setScrollY(currentScrollY)

      // Detect if user is actively scrolling
      if (Math.abs(currentScrollY - lastScrollYRef.current) > 5) {
        setIsScrolling(true)

        // Add flying birds while scrolling (30% chance)
        if (Math.random() > 0.7) {
          const direction = Math.random() > 0.5 ? "left" : "right"
          const newBird: FlyingBird = {
            id: birdCounterRef.current++,
            delay: Math.random() * 0.5,
            bird: Math.floor(Math.random() * 3) + 1,
            direction,
            top: Math.random() * 70 + 15, // 15% to 85% from top
          }
          setFlyingBirds((prev) => [...prev, newBird])

          // Remove bird after animation completes
          setTimeout(() => {
            setFlyingBirds((prev) => prev.filter((b) => b.id !== newBird.id))
          }, 12000)
        }

        // Clear existing timeout
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current)
        }

        // Set timeout to stop scrolling state after 1.5 seconds of no scroll
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false)
        }, 1500)
      }

      lastScrollYRef.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  if (!mounted) return null

  const getBackgroundColor = () => {
    if (scrollY < 600) return "transparent"
    if (scrollY < 1200) return "rgba(69, 123, 157, 0.02)"
    if (scrollY < 2000) return "rgba(45, 106, 79, 0.02)"
    return "rgba(232, 119, 34, 0.01)"
  }

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-colors duration-1000"
        style={{
          backgroundColor: getBackgroundColor(),
        }}
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {isScrolling &&
          flyingBirds.map((bird) => (
            <div
              key={bird.id}
              className={`absolute ${bird.direction === "right" ? "animate-fly-across-right" : "animate-fly-across-left"}`}
              style={{
                top: `${bird.top}%`,
                animationDelay: `${bird.delay}s`,
                width: "120px",
                height: "120px",
                left: bird.direction === "right" ? "-120px" : "auto",
                right: bird.direction === "left" ? "-120px" : "auto",
              }}
            >
              <Image
                src={`/images/flying-birds/bird-${bird.bird}.png`}
                alt=""
                fill
                className="object-contain"
                style={{
                  filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))",
                }}
              />
            </div>
          ))}
      </div>
    </>
  )
}
