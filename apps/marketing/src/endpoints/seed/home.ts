import type { Media } from "@/payload-types"
import type { RequiredDataFromCollectionSlug } from "payload"

type HomeArgs = {
  heroImage: Media
}

export const home: (args: HomeArgs) => RequiredDataFromCollectionSlug<"pages"> = ({
  heroImage,
}) => {
  return {
    slug: "home",
    _status: "published",
    title: "Home",
    layout: [
      {
        blockType: "hero",
        heading: "Welcome to sfdc-lex-out",
        subheading: "Build something amazing with Payload CMS and Next.js",
        primaryCta: {
          label: "Get Started",
          url: "/posts",
        },
        secondaryCta: {
          label: "Learn More",
          url: "/contact",
        },
      },
      {
        blockType: "features",
        heading: "Core Features",
        subheading: "Everything you need to build modern websites",
        features: [
          {
            icon: "layout",
            title: "Page Builder",
            description: "Create beautiful pages with our flexible block-based editor.",
          },
          {
            icon: "zap",
            title: "Lightning Fast",
            description: "Optimized for performance with Next.js and React Server Components.",
          },
          {
            icon: "shield",
            title: "Secure by Default",
            description: "Built-in authentication and role-based access control.",
          },
          {
            icon: "database",
            title: "Flexible Database",
            description: "Works with MongoDB, PostgreSQL, and other databases.",
          },
        ],
      },
      {
        blockType: "cta",
        heading: "Ready to get started?",
        subheading: "Start building your next project today.",
        primaryCta: {
          label: "View Posts",
          url: "/posts",
        },
        secondaryCta: {
          label: "Contact Us",
          url: "/contact",
        },
      },
    ],
    meta: {
      description: "Welcome to sfdc-lex-out - Built with Payload CMS and Next.js",
      image: heroImage.id,
      title: "sfdc-lex-out",
    },
  }
}
