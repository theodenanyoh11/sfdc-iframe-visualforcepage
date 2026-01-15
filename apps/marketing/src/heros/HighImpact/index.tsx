"use client"

import { useHeaderTheme } from "@/providers/HeaderTheme"
import type React from "react"
import { useEffect } from "react"

import type { Page } from "@/payload-types"

import { CMSLink } from "@/components/Link"
import { Media } from "@/components/Media"
import RichText from "@/components/RichText"

export const HighImpactHero: React.FC<Page["hero"]> = ({ links, media, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme("dark")
  })

  return (
    <div
      className="relative -mt-[10.4rem] flex items-center justify-center text-white"
      data-theme="dark"
    >
      <div className="container mx-auto px-4 z-10 relative flex items-center justify-center py-32 md:py-40">
        <div className="max-w-4xl text-center">
          {richText && (
            <RichText className="mb-8 prose-headings:text-white prose-p:text-white/90" data={richText} enableGutter={false} enableProse={false} />
          )}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex flex-wrap justify-center gap-4">
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
      <div className="absolute inset-0 min-h-[80vh] select-none">
        {media && typeof media === "object" && (
          <>
            <Media fill imgClassName="object-cover" priority resource={media} size="100vw" />
            <div className="absolute inset-0 bg-black/60" />
          </>
        )}
      </div>
    </div>
  )
}
