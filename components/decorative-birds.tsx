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
  // flight angle in degrees
  angle?: number
  // optional bezier path points
  startX?: number
  startY?: number
  endX?: number
  endY?: number
  cpX?: number
  cpY?: number
}

// NOTE: We do not fallback to built-in images here. If no images are provided,
// the component will render no birds (per spec).
const BIRD_IMAGES: string[] = []

interface DecorativeBirdsProps {
  images?: string[]
}

export function DecorativeBirds({ images }: DecorativeBirdsProps) {
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
  
  // use provided images array; if none provided, show no birds
  const birdImageList = images && images.length > 0 ? images : BIRD_IMAGES

  // limit concurrent birds and keep spawn frequency independent of how many files exist
  const MAX_CONCURRENT_BIRDS = 6
  const SPAWN_RATE_MS = 800
  // Render all bird images at a fixed pixel size so they appear uniform
  // (increased by 20% per request)
  const BIRD_PIXEL_SIZE = 66

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
    // don't spawn if there are no images
    if (!birdImageList || birdImageList.length === 0) return

    const direction = Math.random() > 0.5 ? "left" : "right"
    let randomBird: string
    let attempts = 0
    do {
      randomBird = birdImageList[Math.floor(Math.random() * birdImageList.length)]
      attempts++
    } while (usedBirdsRef.current.has(randomBird) && attempts < 10)

    usedBirdsRef.current.add(randomBird)
    if (usedBirdsRef.current.size >= birdImageList.length) usedBirdsRef.current.clear()

    // Fixed duration for consistent flight speed across all birds
    const duration = 10.5
    
    // build a random bezier arc path with start/end points on any edge of the screen
    const w = typeof window !== "undefined" ? window.innerWidth : 1200
    const h = typeof window !== "undefined" ? window.innerHeight : 800
    const pageHeight = typeof document !== "undefined" ? document.documentElement.scrollHeight : 3000
    
    // spawn birds across the full page height (with padding) based on current scroll position
    const currentScroll = typeof window !== "undefined" ? window.scrollY : 0
    const viewportTop = currentScroll
    const viewportBottom = currentScroll + h
    
    // Random y position within current viewport plus some buffer
    const bufferAbove = h * 0.5
    const bufferBelow = h * 0.5
    const minY = Math.max(100, viewportTop - bufferAbove)
    const maxY = Math.min(pageHeight - 200, viewportBottom + bufferBelow)
    
    // Randomly choose start and end edges (0=left, 1=right, 2=top, 3=bottom)
    const startEdge = Math.floor(Math.random() * 4)
    const endEdge = Math.floor(Math.random() * 4)
    
    let startX: number, startY: number, endX: number, endY: number
    
    // Start position
    if (startEdge === 0) { // left
      startX = -120
      startY = minY + Math.random() * (maxY - minY)
    } else if (startEdge === 1) { // right
      startX = w + 120
      startY = minY + Math.random() * (maxY - minY)
    } else if (startEdge === 2) { // top
      startX = Math.random() * w
      startY = minY
    } else { // bottom
      startX = Math.random() * w
      startY = maxY
    }
    
    // End position
    if (endEdge === 0) { // left
      endX = -120
      endY = minY + Math.random() * (maxY - minY)
    } else if (endEdge === 1) { // right
      endX = w + 120
      endY = minY + Math.random() * (maxY - minY)
    } else if (endEdge === 2) { // top
      endX = Math.random() * w
      endY = minY
    } else { // bottom
      endX = Math.random() * w
      endY = maxY
    }
    
    // Determine direction based on horizontal movement
    const actualDirection = endX > startX ? "right" : "left"
    
    // Control point with larger random offset to create more dramatic arcs
    const midX = (startX + endX) / 2
    const midY = (startY + endY) / 2
    const cpX = midX + (Math.random() - 0.5) * w * 0.6
    const cpY = midY + (Math.random() - 0.5) * h * 0.6
    
    // Random flight angle (not used directly anymore since arc determines direction)
    const flightAngle = 0

    const newBird: FlyingBird = {
      id: birdCounterRef.current++,
      bird: randomBird,
      direction: actualDirection,
      top: 0,
      speed: duration,
      isVisible: false,
      progress: 0,
      baseVelocity: 1 / (duration * 1000),
      // use a fixed scale placeholder (render size controlled via Image width/height)
      scale: 1,
      angle: flightAngle,
      startX,
      startY,
      endX,
      endY,
      cpX,
      cpY,
    }

    // add the bird using functional update to avoid stale closures and enforce max concurrent birds
    setFlyingBirds((prev) => {
      if (prev.length >= MAX_CONCURRENT_BIRDS) return prev
      return [...prev, newBird]
    })

    setTimeout(() => {
      setFlyingBirds((prev) => prev.map((b) => (b.id === newBird.id ? { ...b, isVisible: true } : b)))
    }, 16)
  }

  // spawner: spawn birds at regular intervals based on spawn rate only
  useEffect(() => {
    // start spawner when image list is available so birds show up without scrolling
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current)
      spawnIntervalRef.current = null
    }

    if (birdImageList.length > 0) {
      // spawn a couple immediately so the page isn't empty
      spawnOne()
      setTimeout(spawnOne, 300)

      spawnIntervalRef.current = setInterval(() => {
        spawnOne()
      }, SPAWN_RATE_MS)
    }

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current)
        spawnIntervalRef.current = null
      }
    }
    // re-run only if the available images change
  }, [birdImageList.length])

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
          const newProgress = Math.min(1.15, (b.progress ?? 0) + added)
          return { ...b, progress: newProgress }
        })

        // Remove birds after they've completed their progress AND faded out
        // Allow progress up to 1.15 to give time for fade-out animation
        return updated.filter((b) => (b.progress ?? 0) < 1.15)
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
        className="fixed inset-0 pointer-events-none -z-30 transition-colors duration-1000"
        style={{
          backgroundColor: getBackgroundColor(),
        }}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {flyingBirds.map((bird) => {
          // compute x position from progress so updates are continuous and won't jump
          const w = typeof window !== "undefined" ? window.innerWidth : 1200
          const p = bird.progress ?? 0

          // Quadratic Bezier evaluation for position
          const x = ((1 - p) * (1 - p) * (bird.startX ?? -120)) + (2 * (1 - p) * p * (bird.cpX ?? (w / 2))) + (p * p * (bird.endX ?? (w + 120)))
          const y = ((1 - p) * (1 - p) * (bird.startY ?? 200)) + (2 * (1 - p) * p * (bird.cpY ?? 300)) + (p * p * (bird.endY ?? 200))

          // Edge fade calculation - fade based on distance to viewport edges
          // Birds start/end at -120 or w+120, so fade within the viewport area
          const FADE_DISTANCE_LEFT = 150 // Shorter fade on left for quicker appearance
          const FADE_DISTANCE_RIGHT = 200 // Longer fade on right for smoother exit
          
          // Fade starts when bird enters viewport (x=0) and completes at FADE_DISTANCE
          const leftFade = x < 0 ? 0 : (x < FADE_DISTANCE_LEFT ? x / FADE_DISTANCE_LEFT : 1)
          
          // Fade starts when bird is FADE_DISTANCE from right edge
          const rightFade = x > w ? 0 : (x > w - FADE_DISTANCE_RIGHT ? (w - x) / FADE_DISTANCE_RIGHT : 1)
          
          // Use the minimum fade (most restrictive)
          const edgeOpacity = Math.min(leftFade, rightFade)

          // Compute derivative of Bezier for instantaneous direction (for rotation)
          const startX = bird.startX ?? -120
          const startY = bird.startY ?? 200
          const cpX = bird.cpX ?? (w / 2)
          const cpY = bird.cpY ?? 300
          const endX = bird.endX ?? (w + 120)
          const endY = bird.endY ?? 200

          // derivative B'(t) = 2(1-t)(P1-P0) + 2t(P2-P1)
          const dx = 2 * (1 - p) * (cpX - startX) + 2 * p * (endX - cpX)
          const dy = 2 * (1 - p) * (cpY - startY) + 2 * p * (endY - cpY)

          // Calculate rotation from the tangent direction
          // All bird images face right (0°), so we rotate them to match their flight path
          const rotationDeg = Math.atan2(dy, dx) * (180 / Math.PI)

          return (
            <div
              key={bird.id}
              className="absolute"
              style={{
                top: `${bird.top}px`,
                width: `${BIRD_PIXEL_SIZE}px`,
                height: `${BIRD_PIXEL_SIZE}px`,
                left: 0,
                // Position without rotation (rotation will be on the image)
                transform: `translateX(${x}px) translateY(${y}px)`,
                // Only transition transform, not opacity (opacity changes smoothly via RAF)
                transition: `transform 150ms linear`,
                // combine creation fade (isVisible) with edge fade
                opacity: (bird.isVisible ? 1 : 0) * edgeOpacity,
                willChange: "transform, opacity",
              }}
            >
            <Image
              src={`/images/flying-birds/${bird.bird}`}
              alt=""
              width={BIRD_PIXEL_SIZE}
              height={BIRD_PIXEL_SIZE}
              className="object-contain"
              style={{
                filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))",
                // All birds face right. For left-facing flight:
                // 1. Flip horizontally with scaleX(-1)
                // 2. Compensate rotation: flipping mirrors the angle across the vertical axis
                //    So if flying at angle θ to the right, flipped bird needs 180° - θ
                transform: bird.direction === "left" 
                  ? `scaleX(-1) rotate(${180 - rotationDeg}deg)` 
                  : `rotate(${rotationDeg}deg)`,
              }}
            />
            </div>
          )
        })}
      </div>
    </>
  )
}
