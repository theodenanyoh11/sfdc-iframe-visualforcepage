import type { Metadata } from "next"
import { getServerSideURL } from "./getURL"

const defaultOpenGraph: Metadata["openGraph"] = {
  type: "website",
  description:
    "Welcome to sfdc-lex-out. Built with Payload CMS and Next.js.",
  images: [
    {
      url: `${getServerSideURL()}/og-image.png`,
      width: 1200,
      height: 630,
      alt: "sfdc-lex-out",
    },
  ],
  siteName: "sfdc-lex-out",
  title: "sfdc-lex-out",
}

export const mergeOpenGraph = (og?: Metadata["openGraph"]): Metadata["openGraph"] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
