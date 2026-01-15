import type { Media } from "@/payload-types"

export const imageHero: Omit<Media, "createdAt" | "id" | "updatedAt"> = {
  alt: "Abstract hero image with gradient",
}
