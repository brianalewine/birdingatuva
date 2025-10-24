"use client"

import Image from "next/image"
import { useState } from "react"

interface SafeImageProps {
  src: string
  alt?: string
  className?: string
  fill?: boolean
}

export function SafeImage({ src, alt = "", className, fill }: SafeImageProps) {
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
    // @ts-ignore - next/image accepts onError but types can be finicky with our wrapper
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      onError={() => setErrored(true)}
      unoptimized
    />
  )
}
