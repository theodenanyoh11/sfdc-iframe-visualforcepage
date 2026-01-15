import type React from "react"

import type { Post } from "@/payload-types"

import { formatAuthors } from "@/utilities/formatAuthors"
import { formatDateTime } from "@/utilities/formatDateTime"
import Link from "next/link"

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { categories, populatedAuthors, publishedAt, title } = post

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ""

  return (
    <div className="relative bg-gradient-to-b from-muted/50 to-background">
      <div className="container py-16 md:py-20 lg:py-24">
        <div className="max-w-3xl">
          {/* Category Badge */}
          {categories && categories.length > 0 && (
            <div className="flex items-center gap-2 mb-6">
              {categories.map((category) => {
                if (typeof category === "object" && category !== null) {
                  const { title: categoryTitle, slug, id } = category
                  const titleToUse = categoryTitle || "Untitled category"

                  return (
                    <Link
                      key={id || slug}
                      href={`/posts?category=${slug}`}
                      className="inline-flex items-center px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
                    >
                      {titleToUse}
                    </Link>
                  )
                }
                return null
              })}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-8">
            {title}
          </h1>

          {/* Meta Information */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            {hasAuthors && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground/70">By</span>
                <span className="font-medium">{formatAuthors(populatedAuthors)}</span>
              </div>
            )}
            {hasAuthors && publishedAt && <span className="text-muted-foreground/50">•</span>}
            {publishedAt && (
              <time dateTime={publishedAt}>
                {formatDateTime(publishedAt)}
              </time>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
