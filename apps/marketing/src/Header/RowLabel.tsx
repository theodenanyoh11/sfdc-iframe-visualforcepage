"use client"
import type { Header } from "@/payload-types"
import { type RowLabelProps, useRowLabel } from "@payloadcms/ui"

export const RowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<NonNullable<Header["navItems"]>[number]>()

  const itemLabel = data?.data?.label
  const itemType = data?.data?.type === "megaMenu" ? "Mega Menu" : "Link"
  const isRight = (data?.data?.position || "left") === "right"
  const itemPosition = isRight ? "Right" : "Left"
  const itemAppearance = isRight
    ? ` · ${(data?.data?.appearance || "button") === "button" ? "Button" : "Link"}`
    : ""

  const label = itemLabel
    ? `${data.rowNumber !== undefined ? data.rowNumber + 1 : ""}. ${itemLabel} — ${itemType} (${itemPosition}${itemAppearance})`
    : "Row"

  return <div>{label}</div>
}
