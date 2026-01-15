import type React from "react"

import type { Page } from "@/payload-types"

import { HighImpactHero } from "@/heros/HighImpact"
import { LowImpactHero } from "@/heros/LowImpact"
import { MediumImpactHero } from "@/heros/MediumImpact"
import { ProductShowcaseHero } from "@/heros/ProductShowcase"

const heroes = {
  highImpact: HighImpactHero,
  lowImpact: LowImpactHero,
  mediumImpact: MediumImpactHero,
  productShowcase: ProductShowcaseHero,
}

export const RenderHero: React.FC<Page["hero"]> = (props) => {
  const { type } = props || {}

  if (!type || type === "none") return null

  const HeroToRender = heroes[type]

  if (!HeroToRender) return null

  return <HeroToRender {...props} />
}
