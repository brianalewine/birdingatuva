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
  const MAX_CONCURRENT_BIRDS = 8 // base concurrent birds per viewport (reduced slightly)
  const SPAWN_RATE_MS = 750 // Slightly slower spawn to reduce total birds a hair
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
    
    // Minimum distance to prevent tight circles (at least half screen width)
    const MIN_DISTANCE = w * 0.5
    
    let startX: number, startY: number, endX: number, endY: number
    let pathDistance: number
    let pathAttempts = 0
    
    // Keep generating start/end positions until we get a path that's long enough
    do {
      // Randomly choose start and end edges (0=left, 1=right, 2=top, 3=bottom)
      const startEdge = Math.floor(Math.random() * 4)
      // pick endEdge but avoid a strict top<->bottom pairing which forces near-vertical crossing
      let endEdge = Math.floor(Math.random() * 4)
      if ((startEdge === 2 && endEdge === 3) || (startEdge === 3 && endEdge === 2)) {
        // re-roll endEdge once to avoid guaranteed vertical crossing
        endEdge = Math.floor(Math.random() * 4)
      }
      
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
      
      // Calculate straight-line distance between start and end
      pathDistance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))
      pathAttempts++
    } while (pathDistance < MIN_DISTANCE && pathAttempts < 20)
    
  // Determine direction based on horizontal movement
  const actualDirection = endX > startX ? "right" : "left"

  // Compute a dynamic concurrent limit based on page length so very long pages
  // can host more birds without feeling sparse. Use the number of viewports
  // stacked in the page to scale the base limit, clamped to a reasonable max.
  const viewportCount = Math.max(1, Math.round(pageHeight / h))
  const dynamicMax = Math.min(30, Math.max(MAX_CONCURRENT_BIRDS, MAX_CONCURRENT_BIRDS * viewportCount))
    
  // Control point with validation to ensure birds never fly upside down
  // Birds can rotate between -60° and +60°, but NEVER backwards (outside -90° to +90°)
    let cpX: number, cpY: number
    let arcAttempts = 0
    let isValidArc = false
    
    do {
      // Generate random control point with larger offset for dramatic arcs
      const midX = (startX + endX) / 2
      const midY = (startY + endY) / 2
      cpX = midX + (Math.random() - 0.5) * w * 0.6
      cpY = midY + (Math.random() - 0.5) * h * 0.6
      
  // Sample the curve at many points to check ALL tangent angles
  isValidArc = true
  const samplePoints = [0.15, 0.3, 0.45, 0.6, 0.75] // focus on mid-curve
      
      for (const t of samplePoints) {
        // Calculate tangent: B'(t) = 2(1-t)(P1-P0) + 2t(P2-P1)
        const dx = 2 * (1 - t) * (cpX - startX) + 2 * t * (endX - cpX)
        const dy = 2 * (1 - t) * (cpY - startY) + 2 * t * (endY - cpY)
        
        // Calculate angle in degrees (-180 to +180)
        const angle = Math.atan2(dy, dx) * (180 / Math.PI)
        
        // First check: No backwards flight (angle must be between -90 and +90)
        if (angle > 90 || angle < -90) {
          isValidArc = false
          break
        }
        
        
        // Second check: Limit steepness to ±60° for natural flight
        if (Math.abs(angle) > 60) {
          isValidArc = false
          break
        }
      }

      // Also explicitly check the tangent at the endpoint (p=1) ---
      // This prevents cases where the middle of the curve is ok but the
      // endpoint tangent is nearly vertical (which later becomes the
      // off-curve direction we continue along).
      if (isValidArc) {
        const endTangentX = 2 * (endX - cpX)
        const endTangentY = 2 * (endY - cpY)
        const endAngle = Math.atan2(endTangentY, endTangentX) * (180 / Math.PI)
        if (endAngle > 90 || endAngle < -90 || Math.abs(endAngle) > 60) {
          isValidArc = false
        }
      }
      
      arcAttempts++
    } while (!isValidArc && arcAttempts < 30)
    
    // If we couldn't find a valid arc, create a safe horizontal arc (stronger bias)
    if (!isValidArc) {
      const midX = (startX + endX) / 2
      const midY = (startY + endY) / 2
      // Create a gentle arc - more horizontal bias to avoid steep angles
      cpX = midX + (Math.random() - 0.5) * w * 0.2
      cpY = midY + (Math.random() - 0.5) * h * 0.06
    }
    
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
      if (prev.length >= dynamicMax) return prev
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
        const h = typeof window !== "undefined" ? window.innerHeight : 800
        
        const updated = prev.map((b) => {
          const baseV = b.baseVelocity ?? (1 / (b.speed * 1000))
          // effective velocity scales with birdSpeed; when we've slowed to MIN and not scrolling, pause fully
          const effectiveV = !isScrolling && birdSpeed <= MIN_SPEED_FACTOR + 0.001 ? 0 : baseV * birdSpeed
          const added = effectiveV * delta
          // Don't clamp progress - let birds continue moving beyond their path end point
          const newProgress = (b.progress ?? 0) + added
          return { ...b, progress: newProgress }
        })

        // Remove birds only when they're definitely off-screen
        // Compute a conservative on-screen position for each bird and only
        // remove it once it's both past a progress threshold and off the viewport
        return updated.filter((b) => {
          const progress = b.progress ?? 0
          // If the bird hasn't passed the basic endpoint, keep it
          if (progress < 1.2) return true

          // Approximate its current x position (same logic as render):
          const startX = b.startX ?? -120
          const startY = b.startY ?? 200
          const cpX = b.cpX ?? (w / 2)
          const cpY = b.cpY ?? 300
          const endX = b.endX ?? (w + 120)
          const endY = b.endY ?? 200
          const rawProgress = progress

          let xPos: number
          if (rawProgress <= 1) {
            const p = rawProgress
            xPos = ((1 - p) * (1 - p) * startX) + (2 * (1 - p) * p * cpX) + (p * p * endX)
          } else {
            // continue along endpoint tangent
            const tangentX = 2 * (endX - cpX)
            const tangentY = 2 * (endY - cpY)
            const mag = Math.sqrt(tangentX * tangentX + tangentY * tangentY) || 1
            const nx = tangentX / mag
            const extra = (rawProgress - 1) * 800
            xPos = endX + nx * extra
          }

          // Remove only once bird is well off-screen horizontally
          const OFFSCREEN_MARGIN = 160
          if (xPos < -120 - OFFSCREEN_MARGIN) return false
          if (xPos > w + 120 + OFFSCREEN_MARGIN) return false

          // If still within that range, keep it so it can fade/move out
          return true
        })
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
          const rawProgress = bird.progress ?? 0
          
          const startX = bird.startX ?? -120
          const startY = bird.startY ?? 200
          const cpX = bird.cpX ?? (w / 2)
          const cpY = bird.cpY ?? 300
          const endX = bird.endX ?? (w + 120)
          const endY = bird.endY ?? 200
          
          let x: number, y: number
          
          if (rawProgress <= 1) {
            // Normal bezier curve while progress <= 1
            const p = rawProgress
            x = ((1 - p) * (1 - p) * startX) + (2 * (1 - p) * p * cpX) + (p * p * endX)
            y = ((1 - p) * (1 - p) * startY) + (2 * (1 - p) * p * cpY) + (p * p * endY)
          } else {
            // After progress > 1, continue in the direction of the tangent at p=1
            // This makes birds continue off-screen smoothly
            const p = 1
            const baseX = endX
            const baseY = endY
            
            // Get tangent direction at p=1: B'(1) = 2(P2 - P1)
            const tangentX = 2 * (endX - cpX)
            const tangentY = 2 * (endY - cpY)
            
            // Normalize the tangent to maintain consistent speed
            const tangentMagnitude = Math.sqrt(tangentX * tangentX + tangentY * tangentY)
            const normalizedTangentX = tangentX / tangentMagnitude
            const normalizedTangentY = tangentY / tangentMagnitude
            
            // Continue moving in that direction at a consistent speed
            // Use a large scaling factor to ensure birds quickly move off-screen
            const extraProgress = (rawProgress - 1) * 800 // Increased from 500 for faster off-screen movement
            x = baseX + normalizedTangentX * extraProgress
            y = baseY + normalizedTangentY * extraProgress
          }

          // Edge fade calculation - fade based on distance to viewport edges
          // Birds should maintain 10% opacity at the edges (not fade to 0)
          const FADE_DISTANCE_LEFT = 150 // Shorter fade on left for quicker appearance
          const FADE_DISTANCE_RIGHT = 200 // Longer fade on right for smoother exit
          const MIN_OPACITY = 0.1 // Minimum opacity at edges
          
          // Fade from MIN_OPACITY to 1 as bird enters from left
          // At x=0 (edge): opacity = MIN_OPACITY
          // At x=FADE_DISTANCE: opacity = 1
          const leftFade = x < 0 ? MIN_OPACITY : (x < FADE_DISTANCE_LEFT ? MIN_OPACITY + (x / FADE_DISTANCE_LEFT) * (1 - MIN_OPACITY) : 1)
          
          // Fade from 1 to MIN_OPACITY as bird exits to right
          // At x=w-FADE_DISTANCE: opacity = 1
          // At x=w (edge): opacity = MIN_OPACITY
          const rightFade = x > w ? MIN_OPACITY : (x > w - FADE_DISTANCE_RIGHT ? MIN_OPACITY + ((w - x) / FADE_DISTANCE_RIGHT) * (1 - MIN_OPACITY) : 1)
          
          // Use the minimum fade (most restrictive)
          const edgeOpacity = Math.min(leftFade, rightFade)

          // Compute derivative of Bezier for instantaneous direction (for rotation)
          // Use p=1 for rotation if we're past the curve
          const p = Math.min(1, rawProgress)

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
