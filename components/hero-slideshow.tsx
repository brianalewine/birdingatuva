"use client"

import { useEffect, useState, useMemo } from "react"
import Image from "next/image"

interface HeroSlideshowProps {
  images: string[]
}

// Slideshow timing configuration - adjust these values to change the timing
const SLIDE_INTERVAL_MS = 4000  // Time between slide changes (4 seconds)
const FADE_DURATION_MS = 2000   // Fade transition duration (1.5 seconds)

export function HeroSlideshow({ images }: HeroSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  // Randomize images order on component mount
  const shuffledImages = useMemo(() => {
    return [...images].sort(() => Math.random() - 0.5)
  }, []) // Empty dependency array ensures this only runs once on mount

  useEffect(() => {
    if (shuffledImages.length === 0) return

    const interval = setInterval(() => {
      setIsTransitioning(true)
      
        setTimeout(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % shuffledImages.length)
          setIsTransitioning(false)
        }, FADE_DURATION_MS)
    }, SLIDE_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [shuffledImages.length])

  if (images.length === 0) {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-blue-700" />
    )
  }

  return (
    <div className="absolute inset-0 z-10 bg-blue-900">
      {shuffledImages.map((imageName, index) => (
        <div
          key={imageName}
          className={`absolute inset-0 transition-opacity ${
            index === currentIndex
              ? "opacity-100"
              : "opacity-0"
          }`}
          style={{ transitionDuration: `${FADE_DURATION_MS}ms` }}
        >
          <Image
            src={`/images/hero-backgrounds/${imageName}`}
            alt=""
            fill
            className="object-cover brightness-75"
            priority={index === 0}
            quality={95}
          />
        </div>
      ))}
    </div>
  )
}
