"use client"

import { useHeaderTheme } from "@/providers/HeaderTheme"
import type React from "react"
import { useEffect } from "react"

import type { Page } from "@/payload-types"

import { CMSLink } from "@/components/Link"
import { Media } from "@/components/Media"
import RichText from "@/components/RichText"

export const ProductShowcaseHero: React.FC<Page["hero"]> = ({
  links,
  richText,
  media,
  backgroundMedia,
}) => {
  const { setHeaderTheme } = useHeaderTheme()
  const hasMedia = media && typeof media === "object"
  const hasBackgroundMedia = backgroundMedia && typeof backgroundMedia === "object"

  useEffect(() => {
    setHeaderTheme("light")
  }, [setHeaderTheme])

  return (
    <div className="relative overflow-hidden">
      {/* Hero Content - Left Aligned */}
      <div className="container mx-auto px-4 pt-8 pb-16 md:pt-16 md:pb-24">
        <div className="max-w-2xl">
          {richText && (
            <RichText
              className="mb-8"
              data={richText}
              enableGutter={false}
              enableProse={false}
            />
          )}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex flex-wrap gap-4">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink {...link} size="lg" />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Product Showcase Section */}
      <div className="container mx-auto px-4">
        <div className="relative rounded-2xl overflow-hidden min-h-[400px] md:min-h-[500px]">
          {/* Background */}
          <div className="absolute inset-0">
            {hasBackgroundMedia ? (
              <Media
                resource={backgroundMedia}
                fill
                imgClassName="object-cover"
                priority
                size="100vw"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 via-primary/5 to-background" />
            )}
          </div>

          {/* Product Media - centered */}
          {hasMedia && (
            <div className="relative z-10 flex items-center justify-center p-8 md:p-12">
              <div className="max-w-4xl w-full rounded-lg overflow-hidden shadow-2xl border border-border/50">
                <Media
                  resource={media}
                  imgClassName="w-full h-auto object-contain"
                  size="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 960px"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
