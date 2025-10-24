"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"

interface FlyingBird {
  id: number
  bird: string
  direction: "left" | "right"
  top: number
  speed: number
  isVisible: boolean
}

// Available bird images
const BIRD_IMAGES = ["bird", "card", "fl", "rwb", "wb"]

export function DecorativeBirds() {
  const [scrollY, setScrollY] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const [flyingBirds, setFlyingBirds] = useState<FlyingBird[]>([])
  const [birdSpeed, setBirdSpeed] = useState(1)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const slowdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const birdCounterRef = useRef(0)
  const lastScrollTimeRef = useRef(Date.now())
  const usedBirdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const now = Date.now()
      const timeSinceLastScroll = now - lastScrollTimeRef.current
      
      setScrollY(currentScrollY)
      setIsScrolling(true)
      setBirdSpeed(1) // Full speed when scrolling

      // Only add birds if enough time has passed (throttle bird creation)
      if (timeSinceLastScroll > 300 && Math.random() > 0.85) {
        const direction = Math.random() > 0.5 ? "left" : "right"
        
        // Get a random bird that hasn't been used recently
        let randomBird: string
        let attempts = 0
        do {
          randomBird = BIRD_IMAGES[Math.floor(Math.random() * BIRD_IMAGES.length)]
          attempts++
        } while (usedBirdsRef.current.has(randomBird) && attempts < 10)
        
        // Add to used birds and clear if we've used all birds
        usedBirdsRef.current.add(randomBird)
        if (usedBirdsRef.current.size >= BIRD_IMAGES.length) {
          usedBirdsRef.current.clear()
        }
        
        const newBird: FlyingBird = {
          id: birdCounterRef.current++,
          bird: randomBird,
          direction,
          top: Math.random() * 60 + 20, // 20% to 80% from top
          speed: Math.random() * 5 + 8, // 8-13 seconds to cross screen
          isVisible: true,
        }
        
        setFlyingBirds((prev) => {
          // Limit to max 3 birds at once
          if (prev.length >= 3) return prev
          return [...prev, newBird]
        })

        // Remove bird after animation would complete OR after 20 seconds (whichever comes first)
        setTimeout(() => {
          setFlyingBirds((prev) => prev.filter((b) => b.id !== newBird.id))
        }, Math.min(newBird.speed * 1000 + 2000, 20000))
        
        lastScrollTimeRef.current = now
      }

      // Clear existing timeout and interval
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      if (slowdownIntervalRef.current) {
        clearInterval(slowdownIntervalRef.current)
        slowdownIntervalRef.current = null
      }

      // Set timeout to gradually slow down birds after 1.5s of no scroll
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false)
        // Gradually reduce speed over 1.5 seconds
        let currentSpeed = 1
        slowdownIntervalRef.current = setInterval(() => {
          currentSpeed -= 0.1
          if (currentSpeed <= 0) {
            currentSpeed = 0
            if (slowdownIntervalRef.current) {
              clearInterval(slowdownIntervalRef.current)
              slowdownIntervalRef.current = null
            }
          }
          setBirdSpeed(currentSpeed)
        }, 150) // Update every 150ms for smooth transition
      }, 1500)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      if (slowdownIntervalRef.current) {
        clearInterval(slowdownIntervalRef.current)
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

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-30">
        {flyingBirds.map((bird) => (
          <div
            key={bird.id}
            className={`absolute ${bird.direction === "right" ? "animate-fly-across-right-wave" : "animate-fly-across-left-wave"}`}
            style={{
              top: `${bird.top}%`,
              animationDuration: `${bird.speed}s`,
              animationPlayState: "running",
              width: "100px",
              height: "100px",
              left: bird.direction === "right" ? "-100px" : "auto",
              right: bird.direction === "left" ? "-100px" : "auto",
              opacity: birdSpeed,
              transform: `scale(${0.8 + (birdSpeed * 0.2)})`,
              transition: "opacity 0.15s linear, transform 0.15s linear",
              animationTimingFunction: birdSpeed < 0.5 ? `cubic-bezier(0.5, 0, 1, 0.5)` : "linear",
            }}
          >
            <Image
              src={`/images/flying-birds/${bird.bird}.png`}
              alt=""
              fill
              className="object-contain"
              style={{
                filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))",
                transform: bird.direction === "left" ? "scaleX(-1)" : "none",
              }}
            />
          </div>
        ))}
      </div>
    </>
  )
}
