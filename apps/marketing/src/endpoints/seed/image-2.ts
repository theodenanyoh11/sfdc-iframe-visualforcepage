import type { Media } from "@/payload-types"

export const image2: Omit<Media, "createdAt" | "id" | "updatedAt"> = {
  alt: "Stylized 3D rendering of a dark, abstract cosmic landscape",
}
