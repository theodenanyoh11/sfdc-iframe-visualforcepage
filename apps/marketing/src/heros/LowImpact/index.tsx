import type React from "react"

import type { Page } from "@/payload-types"

import { CMSLink } from "@/components/Link"
import RichText from "@/components/RichText"

type LowImpactHeroType =
  | {
      children?: React.ReactNode
      richText?: never
      links?: never
    }
  | (Omit<Page["hero"], "richText"> & {
      children?: never
      richText?: Page["hero"]["richText"]
    })

export const LowImpactHero: React.FC<LowImpactHeroType> = ({ children, richText, links }) => {
  return (
    <div className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          {children ||
            (richText && (
              <RichText
                className="mb-8"
                data={richText}
                enableGutter={false}
                enableProse={false}
              />
            ))}
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
    </div>
  )
}
