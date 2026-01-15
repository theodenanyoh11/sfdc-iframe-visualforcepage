import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical"
import {
  RichText as ConvertRichText,
  type JSXConvertersFunction,
  LinkJSXConverter,
} from "@payloadcms/richtext-lexical/react"
import { cn } from "@/lib/utils"
import type React from "react"

const jsxConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref: ({ linkNode }) => {
    const { value, relationTo } = linkNode.fields.doc || {}
    if (typeof value !== "object" || !value) return "/"
    const slug = value.slug
    return relationTo === "posts" ? `/posts/${slug}` : `/${slug}`
  }}),
})

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props
  return (
    <ConvertRichText
      converters={jsxConverters}
      className={cn(
        "payload-richtext",
        {
          container: enableGutter,
          "prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-primary prose-blockquote:not-italic prose-li:marker:text-muted-foreground":
            enableProse,
        },
        !enableGutter && "max-w-none",
        className,
      )}
      {...rest}
    />
  )
}
