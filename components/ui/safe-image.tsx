"use client"

import Image from "next/image"
import { useState } from "react"

interface SafeImageProps {
  src: string
  alt?: string
  className?: string
  fill?: boolean
  quality?: number
  sizes?: string
  loading?: "lazy" | "eager"
}

export function SafeImage({ src, alt = "", className, fill, quality = 85, sizes, loading = "lazy" }: SafeImageProps) {
  const [errored, setErrored] = useState(false)

  if (errored) {
    // fallback: simple colored background with a broken-image icon-ish text
    return (
      <div className={`w-full h-full bg-muted/40 flex items-center justify-center ${className ?? ""}`}>
        <span className="text-sm text-muted-foreground">Image unavailable</span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      quality={quality}
      sizes={sizes || "(max-width: 768px) 100vw, 33vw"}
      loading={loading}
      onError={() => setErrored(true)}
    />
  )
}
