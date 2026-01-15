"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"
import type React from "react"

import type { Media as MediaType } from "@/payload-types"

export interface MediaProps {
  resource?: MediaType | string | number | null
  alt?: string
  className?: string
  imgClassName?: string
  fill?: boolean
  priority?: boolean
  size?: string
}

export const Media: React.FC<MediaProps> = ({
  resource,
  alt: altFromProps,
  className,
  imgClassName,
  fill = false,
  priority = false,
  size,
}) => {
  // If resource is not an object or is null/undefined, return null
  if (!resource || typeof resource !== "object") {
    return null
  }

  const { url, alt: altFromResource, width, height } = resource

  const alt = altFromProps ?? altFromResource ?? ""

  if (!url) return null

  // Handle fill mode
  if (fill) {
    return (
      <div className={cn("relative", className)}>
        <Image
          src={url}
          alt={alt}
          fill
          className={cn("object-cover", imgClassName)}
          priority={priority}
          sizes={size || "100vw"}
        />
      </div>
    )
  }

  // Handle normal mode with width/height
  return (
    <Image
      src={url}
      alt={alt}
      width={width || 800}
      height={height || 600}
      className={cn(className, imgClassName)}
      priority={priority}
      sizes={size}
    />
  )
}
