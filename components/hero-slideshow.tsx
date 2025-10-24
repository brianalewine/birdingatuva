"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

interface HeroSlideshowProps {
  images: string[]
}

export function HeroSlideshow({ images }: HeroSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (images.length === 0) return

    const interval = setInterval(() => {
      setIsTransitioning(true)
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
        setIsTransitioning(false)
      }, 1000) // 1 second transition
    }, 10000) // 10 seconds per image

    return () => clearInterval(interval)
  }, [images.length])

  if (images.length === 0) {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-blue-700" />
    )
  }

  return (
    <div className="absolute inset-0 z-10">
      {images.map((imageName, index) => (
        <div
          key={imageName}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex
              ? "opacity-100"
              : "opacity-0"
          }`}
        >
          <Image
            src={`/images/hero-backgrounds/${imageName}`}
            alt=""
            fill
            className="object-cover"
            priority={index === 0}
            quality={95}
          />
        </div>
      ))}
    </div>
  )
}
