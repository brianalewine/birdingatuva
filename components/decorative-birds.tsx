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
  // Store bird DOM refs for direct manipulation (smoother than state updates)
  const birdElementsRef = useRef<Map<number, HTMLDivElement>>(new Map())
  // Store image element refs to update rotation
  const birdImageElementsRef = useRef<Map<number, HTMLImageElement>>(new Map())
  // Store bird data in a ref so we can update it without re-renders
  const birdDataRef = useRef<Map<number, FlyingBird>>(new Map())
  // Batch bird removals to reduce state updates
  const pendingRemovalsRef = useRef<Set<number>>(new Set())
  
  // use provided images array; if none provided, show no birds
  const birdImageList = images && images.length > 0 ? images : BIRD_IMAGES

  // limit concurrent birds and keep spawn frequency independent of how many files exist
  // Reduce the base concurrent birds to lower on-screen density.
  const MAX_CONCURRENT_BIRDS = 1 // base concurrent birds per viewport (further reduced)
  // Increase spawn interval so new birds appear less frequently
  const SPAWN_RATE_MS = 3000 // spawn every 3s
  // Render all bird images at a fixed pixel size so they appear uniform
  // (increased by 20% per request)
  const BIRD_PIXEL_SIZE = 66
  // Mobile birds are 25% smaller (was 35% smaller, now increased by 10%)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768
  const MOBILE_BIRD_SIZE = Math.round(BIRD_PIXEL_SIZE * 0.75)
  const effectiveBirdSize = isMobile ? MOBILE_BIRD_SIZE : BIRD_PIXEL_SIZE

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

      // Set timeout to gradually slow down birds after 7s of no scroll
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
      }, 7000)
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
    // Mobile birds are 20% slower (1.2x duration)
    const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768
    const baseDuration = 10.5
    const duration = isMobileDevice ? baseDuration * 1.2 : baseDuration
    
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
      const updated = [...prev, newBird]
      // Also update the ref with bird data
      birdDataRef.current.set(newBird.id, newBird)
      return updated
    })

    setTimeout(() => {
      setFlyingBirds((prev) => prev.map((b) => {
        if (b.id === newBird.id) {
          const updated = { ...b, isVisible: true }
          birdDataRef.current.set(b.id, updated)
          return updated
        }
        return b
      }))
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
    // Detect mobile once at setup time
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    let removeCheckCounter = 0
    
    const loop = (t: number) => {
      if (!lastFrameRef.current) lastFrameRef.current = t
      const delta = t - (lastFrameRef.current || t)
      lastFrameRef.current = t

      const w = typeof window !== "undefined" ? window.innerWidth : 1200
      const h = typeof window !== "undefined" ? window.innerHeight : 800
      
      // Check for removal every 60 frames (~1 second) to minimize state updates
      removeCheckCounter++
      const shouldCheckRemoval = removeCheckCounter % 60 === 0

      // Update bird positions directly in the DOM (no React state update)
      birdDataRef.current.forEach((bird, id) => {
        const baseV = bird.baseVelocity ?? (1 / (bird.speed * 1000))
        const effectiveV = !isScrolling && birdSpeed <= MIN_SPEED_FACTOR + 0.001 ? 0 : baseV * birdSpeed
        const added = effectiveV * delta
        const newProgress = (bird.progress ?? 0) + added
        
        // Update bird data in ref
        bird.progress = newProgress

        // Update DOM element directly
        const element = birdElementsRef.current.get(id)
        if (element) {
          const startX = bird.startX ?? -120
          const startY = bird.startY ?? 200
          const cpX = bird.cpX ?? (w / 2)
          const cpY = bird.cpY ?? 300
          const endX = bird.endX ?? (w + 120)
          const endY = bird.endY ?? 200
          const rawProgress = bird.progress ?? 0

          let x: number, y: number
          if (rawProgress <= 1) {
            const p = rawProgress
            x = ((1 - p) * (1 - p) * startX) + (2 * (1 - p) * p * cpX) + (p * p * endX)
            y = ((1 - p) * (1 - p) * startY) + (2 * (1 - p) * p * cpY) + (p * p * endY)
          } else {
            const tangentX = 2 * (endX - cpX)
            const tangentY = 2 * (endY - cpY)
            const tangentMagnitude = Math.sqrt(tangentX * tangentX + tangentY * tangentY)
            const normalizedTangentX = tangentX / tangentMagnitude
            const normalizedTangentY = tangentY / tangentMagnitude
            const extraProgress = (rawProgress - 1) * 800
            x = endX + normalizedTangentX * extraProgress
            y = endY + normalizedTangentY * extraProgress
          }

          // Use sub-pixel precision for smoother motion on both desktop and mobile
          // Mobile uses 1 decimal place, desktop uses 2 for ultra-smooth motion
          const finalX = isMobile ? x.toFixed(1) : x.toFixed(2)
          const finalY = isMobile ? y.toFixed(1) : y.toFixed(2)

          // Use a single composite transform update to avoid multiple reflows
          const newTransform = `translate3d(${finalX}px, ${finalY}px, 0)`
          element.style.transform = newTransform

          // Update bird rotation based on flight direction
          const imageElement = birdImageElementsRef.current.get(id)
          if (imageElement) {
            const p = Math.min(1, rawProgress)
            const dx = 2 * (1 - p) * (cpX - startX) + 2 * p * (endX - cpX)
            const dy = 2 * (1 - p) * (cpY - startY) + 2 * p * (endY - cpY)
            const rotationDeg = Math.atan2(dy, dx) * (180 / Math.PI)
            
            // Update rotation on the image element
            const rotationTransform = bird.direction === "left" 
              ? `scaleX(-1) rotate(${180 - rotationDeg}deg) translate3d(0,0,0)` 
              : `rotate(${rotationDeg}deg) translate3d(0,0,0)`
            imageElement.style.transform = rotationTransform
          }

          // Update opacity with responsive fade distances
          // Mobile gets shorter fade zones (proportional to screen width)
          const FADE_DISTANCE_LEFT = isMobile ? 80 : 150
          const FADE_DISTANCE_RIGHT = isMobile ? 100 : 200
          const MIN_OPACITY = 0.1
          const leftFade = x < 0 ? MIN_OPACITY : (x < FADE_DISTANCE_LEFT ? MIN_OPACITY + (x / FADE_DISTANCE_LEFT) * (1 - MIN_OPACITY) : 1)
          const rightFade = x > w ? MIN_OPACITY : (x > w - FADE_DISTANCE_RIGHT ? MIN_OPACITY + ((w - x) / FADE_DISTANCE_RIGHT) * (1 - MIN_OPACITY) : 1)
          const edgeOpacity = Math.min(leftFade, rightFade)
          const newOpacity = ((bird.isVisible ? 1 : 0) * edgeOpacity).toFixed(3)
          element.style.opacity = newOpacity

          // Check if bird should be removed (only every 60 frames)
          if (shouldCheckRemoval && newProgress >= 1.5) {
            const OFFSCREEN_MARGIN = 200
            if (x < -120 - OFFSCREEN_MARGIN || x > w + 120 + OFFSCREEN_MARGIN) {
              // Add to pending removals instead of removing immediately
              pendingRemovalsRef.current.add(id)
              // Hide it immediately
              element.style.opacity = '0'
            }
          }
        }
      })

      // Process batched removals every 60 frames
      if (shouldCheckRemoval && pendingRemovalsRef.current.size > 0) {
        const toRemove = Array.from(pendingRemovalsRef.current)
        pendingRemovalsRef.current.clear()
        
        // Clean up refs
        toRemove.forEach(id => {
          birdDataRef.current.delete(id)
          birdElementsRef.current.delete(id)
          birdImageElementsRef.current.delete(id)
        })
        
        // Single batched state update for all removals
        setFlyingBirds(prev => prev.filter(b => !toRemove.includes(b.id)))
      }

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

          return (
            <div
              key={bird.id}
              ref={(el) => {
                if (el) {
                  birdElementsRef.current.set(bird.id, el)
                } else {
                  birdElementsRef.current.delete(bird.id)
                }
              }}
              className="absolute"
              style={{
                top: `${bird.top}px`,
                width: `${effectiveBirdSize}px`,
                height: `${effectiveBirdSize}px`,
                left: 0,
                // Initial position - will be updated by RAF loop
                transform: `translate3d(0px, 0px, 0)`,
                opacity: 0,
                // Force GPU acceleration and smooth rendering
                willChange: "transform, opacity",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transformStyle: "preserve-3d",
              }}
            >
            <Image
              ref={(el) => {
                if (el) {
                  // Next.js Image returns an img element
                  const imgElement = el as unknown as HTMLImageElement
                  birdImageElementsRef.current.set(bird.id, imgElement)
                } else {
                  birdImageElementsRef.current.delete(bird.id)
                }
              }}
              src={`/images/flying-birds/${bird.bird}`}
              alt=""
              width={effectiveBirdSize}
              height={effectiveBirdSize}
              className="object-contain"
              quality={80}
              sizes={`${effectiveBirdSize}px`}
              loading="lazy"
              style={{
                filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))",
                // Initial rotation - will be updated by RAF loop
                transform: `rotate(0deg) translate3d(0,0,0)`,
                backfaceVisibility: "hidden",
              }}
            />
            </div>
          )
        })}
      </div>
    </>
  )
}
