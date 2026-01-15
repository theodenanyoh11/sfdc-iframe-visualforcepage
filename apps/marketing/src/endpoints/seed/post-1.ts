import type { Media, User } from "@/payload-types"
import type { RequiredDataFromCollectionSlug } from "payload"

export type PostArgs = {
  heroImage: Media
  author: User
}

export const post1: (args: PostArgs) => RequiredDataFromCollectionSlug<"posts"> = ({
  heroImage,
  author,
}) => {
  return {
    slug: "getting-started",
    _status: "published",
    authors: [author],
    content: {
      root: {
        type: "root",
        children: [
          {
            type: "heading",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Welcome to your new Payload CMS site!",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            tag: "h2",
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "This is a sample post to help you get started. You can edit this post from the admin dashboard or create new ones.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "heading",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Key Features",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            tag: "h3",
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Payload CMS provides a powerful and flexible content management system that integrates seamlessly with Next.js. Some key features include:",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "list",
            children: [
              {
                type: "listitem",
                children: [
                  {
                    type: "text",
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Fully customizable collections and fields",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                value: 1,
                version: 1,
              },
              {
                type: "listitem",
                children: [
                  {
                    type: "text",
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Built-in authentication and access control",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                value: 2,
                version: 1,
              },
              {
                type: "listitem",
                children: [
                  {
                    type: "text",
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Live preview and draft functionality",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                value: 3,
                version: 1,
              },
              {
                type: "listitem",
                children: [
                  {
                    type: "text",
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "SEO optimization tools",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                value: 4,
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            listType: "bullet",
            start: 1,
            tag: "ul",
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Visit the ",
                version: 1,
              },
              {
                type: "link",
                children: [
                  {
                    type: "text",
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "admin dashboard",
                    version: 1,
                  },
                ],
                direction: "ltr",
                fields: {
                  linkType: "custom",
                  newTab: false,
                  url: "/admin",
                },
                format: "",
                indent: 0,
                version: 3,
              },
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: " to start managing your content.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1,
      },
    },
    heroImage: heroImage.id,
    meta: {
      description: "Learn how to get started with your new Payload CMS site.",
      image: heroImage.id,
      title: "Getting Started with Payload CMS",
    },
    relatedPosts: [],
    title: "Getting Started with Payload CMS",
  }
}
