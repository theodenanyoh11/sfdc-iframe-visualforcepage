"use client"

import type React from "react"

import type { Page } from "@/payload-types"

import { CMSLink } from "@/components/Link"
import { Media } from "@/components/Media"
import RichText from "@/components/RichText"

export const MediumImpactHero: React.FC<Page["hero"]> = ({ links, media, richText }) => {
  return (
    <div className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto mb-12">
          {richText && (
            <RichText className="mb-8" data={richText} enableGutter={false} enableProse={false} />
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

        {media && typeof media === "object" && (
          <div className="rounded-xl overflow-hidden border border-border shadow-2xl">
            <Media imgClassName="w-full" priority resource={media} />
            {media?.caption && (
              <div className="mt-3 text-center">
                <RichText data={media.caption} enableGutter={false} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
