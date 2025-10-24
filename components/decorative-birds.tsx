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
  // progress from 0 -> 1 across the screen
  progress?: number
  // base progress per ms (1 / durationMs)
  baseVelocity?: number
  // visual scale (fixed per bird)
  scale?: number
}

// Available bird images (fallback)
const BIRD_IMAGES = ["bird", "card", "fl", "rwb", "wb"]

interface DecorativeBirdsProps {
  images?: string[]
  target?: number
}

export function DecorativeBirds({ images, target }: DecorativeBirdsProps) {
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
  const MIN_SPEED_FACTOR = 0.2 // don't increase animation duration crazily; this is the slowest motion factor
  const rafRef = useRef<number | null>(null)
  const lastFrameRef = useRef<number | null>(null)
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // use provided images array or fallback
  const birdImageList = images && images.length > 0 ? images : BIRD_IMAGES

  // configurable target; default increased so there are more birds visible
  const TARGET_BIRDS = target ?? 3
  const MAX_BIRDS = TARGET_BIRDS + 2

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const now = Date.now()
      const timeSinceLastScroll = now - lastScrollTimeRef.current
      
      setScrollY(currentScrollY)
      setIsScrolling(true)
      setBirdSpeed(1) // Full speed when scrolling

      // Update last scroll timestamp; actual spawning is handled by the spawner effect
      lastScrollTimeRef.current = now

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
        // Gradually reduce speed factor down to MIN_SPEED_FACTOR over ~1.5s
        let currentSpeed = 1
        // multiplicative decay towards zero for tapered ease-out; when tiny, set to 0
        slowdownIntervalRef.current = setInterval(() => {
          currentSpeed = currentSpeed * 0.86
          if (currentSpeed < 0.03) {
            currentSpeed = 0
          }
          setBirdSpeed(currentSpeed)

          if (currentSpeed === 0) {
            if (slowdownIntervalRef.current) {
              clearInterval(slowdownIntervalRef.current)
              slowdownIntervalRef.current = null
            }
          }
        }, 120) // Update every 120ms for smooth transition
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
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current)
        spawnIntervalRef.current = null
      }
    }
  }, [])

  // helper to spawn a single bird
  const spawnOne = () => {
    const direction = Math.random() > 0.5 ? "left" : "right"
    let randomBird: string
    let attempts = 0
    do {
      randomBird = birdImageList[Math.floor(Math.random() * birdImageList.length)]
      attempts++
    } while (usedBirdsRef.current.has(randomBird) && attempts < 10)

    usedBirdsRef.current.add(randomBird)
    if (usedBirdsRef.current.size >= birdImageList.length) usedBirdsRef.current.clear()

    const duration = Math.random() * 5 + 8
    const newBird: FlyingBird = {
      id: birdCounterRef.current++,
      bird: randomBird,
      direction,
      top: Math.random() * 60 + 20,
      speed: duration,
      isVisible: false,
      progress: 0,
      baseVelocity: 1 / (duration * 1000),
      scale: 0.85 + Math.random() * 0.2,
    }

    setFlyingBirds((prev) => {
      // don't exceed MAX_BIRDS
      if (prev.length >= MAX_BIRDS) return prev
      return [...prev, newBird]
    })

    setTimeout(() => {
      setFlyingBirds((prev) => prev.map((b) => (b.id === newBird.id ? { ...b, isVisible: true } : b)))
    }, 16)
  }

  // spawner: when scrolling (or after birds started), ensure ~TARGET_BIRDS are present
  useEffect(() => {
    // start spawner if scrolling or there are already birds
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current)
      spawnIntervalRef.current = null
    }

    // Always try to maintain target once birds have appeared or while scrolling
    if (isScrolling || flyingBirds.length > 0) {
      // spawn immediately until target is met
      const toSpawn = Math.max(0, TARGET_BIRDS - flyingBirds.length)
      for (let i = 0; i < toSpawn; i++) spawnOne()

      spawnIntervalRef.current = setInterval(() => {
        if (flyingBirds.length < TARGET_BIRDS) {
          spawnOne()
        }
      }, 1800)
    }

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current)
        spawnIntervalRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScrolling, flyingBirds.length])

  // rAF loop to drive bird positions based on progress so changing speed doesn't cause jumps
  useEffect(() => {
    const loop = (t: number) => {
      if (!lastFrameRef.current) lastFrameRef.current = t
      const delta = t - (lastFrameRef.current || t)
      lastFrameRef.current = t

      setFlyingBirds((prev) => {
        if (prev.length === 0) return prev
        const w = typeof window !== "undefined" ? window.innerWidth : 1200
        const updated = prev.map((b) => {
          const baseV = b.baseVelocity ?? (1 / (b.speed * 1000))
          // effective velocity scales with birdSpeed; when we've slowed to MIN and not scrolling, pause fully
          const effectiveV = !isScrolling && birdSpeed <= MIN_SPEED_FACTOR + 0.001 ? 0 : baseV * birdSpeed
          const added = effectiveV * delta
          const newProgress = Math.min(1, (b.progress ?? 0) + added)
          return { ...b, progress: newProgress }
        })

        // Remove birds that completed their progress
        return updated.filter((b) => (b.progress ?? 0) < 1)
      })

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastFrameRef.current = null
    }
  }, [birdSpeed, isScrolling])

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
        {flyingBirds.map((bird) => {
          // compute x position from progress so updates are continuous and won't jump
          const w = typeof window !== "undefined" ? window.innerWidth : 1200
          const start = bird.direction === "right" ? -120 : w + 120
          const distance = bird.direction === "right" ? w + 240 : -(w + 240)
          const x = start + (bird.progress ?? 0) * distance

          // compute edge fade in pixels so both left and right sides behave identically
          const FADE_PX = Math.max(140, Math.floor(w * 0.12))
          const birdLeft = x
          const birdRight = x + 100
          let edgeOpacity = 1
          if (birdRight < FADE_PX) edgeOpacity = birdRight / FADE_PX
          else if (birdLeft > w - FADE_PX) edgeOpacity = (w - birdLeft) / FADE_PX
          edgeOpacity = Math.max(0, Math.min(1, edgeOpacity))

          const scale = (bird as any).scale ?? 0.95

          return (
            <div
              key={bird.id}
              className="absolute"
              style={{
                top: `${bird.top}%`,
                width: "100px",
                height: "100px",
                left: 0,
                // translateX handles the movement across the screen; scale is fixed per bird
                transform: `translateX(${x}px) scale(${scale})`,
                transition: "opacity 700ms ease, transform 150ms linear",
                // combine creation fade (isVisible) with edge fade
                opacity: (bird.isVisible ? 1 : 0) * edgeOpacity,
                willChange: "transform, opacity",
              }}
            >
            <Image
              src={`/images/flying-birds/${bird.bird}`}
              alt=""
              fill
              className="object-contain"
              style={{
                filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))",
                transform: bird.direction === "left" ? "scaleX(-1)" : "none",
              }}
            />
            </div>
          )
        })}
      </div>
    </>
  )
}
