import { cn } from "@/lib/utils"
import Link from "next/link"
import type React from "react"

import type { Page, Post } from "@/payload-types"

type CMSLinkType = {
  appearance?: "inline" | "default" | "outline" | "link"
  children?: React.ReactNode
  className?: string
  label?: string | null
  newTab?: boolean | null
  reference?: {
    relationTo: "pages" | "posts"
    value: Page | Post | string | number
  } | null
  size?: "default" | "sm" | "lg" | null
  type?: "custom" | "reference" | null
  url?: string | null
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    type,
    appearance = "inline",
    children,
    className,
    label,
    newTab,
    reference,
    size = "default",
    url,
  } = props

  const href =
    type === "reference" && typeof reference?.value === "object" && reference.value.slug
      ? `${reference?.relationTo !== "pages" ? `/${reference?.relationTo}` : ""}/${
          reference.value.slug
        }`
      : url

  if (!href) return null

  const newTabProps = newTab ? { rel: "noopener noreferrer", target: "_blank" } : {}

  // Size classes
  const sizeClasses = {
    default: "px-4 py-2",
    sm: "px-3 py-1 text-sm",
    lg: "px-6 py-3 text-lg",
  }

  // Appearance classes
  const appearanceClasses = {
    inline: "",
    default: cn(
      "inline-flex items-center justify-center rounded-md font-medium transition-colors",
      "bg-primary text-primary-foreground hover:bg-primary/90",
      sizeClasses[size || "default"]
    ),
    outline: cn(
      "inline-flex items-center justify-center rounded-md font-medium transition-colors",
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      sizeClasses[size || "default"]
    ),
    link: "underline-offset-4 hover:underline",
  }

  return (
    <Link
      className={cn(appearanceClasses[appearance], className)}
      href={href || url || ""}
      {...newTabProps}
    >
      {label && label}
      {children && children}
    </Link>
  )
}
