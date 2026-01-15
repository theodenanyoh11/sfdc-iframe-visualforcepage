import type { CollectionSlug, File, Payload, PayloadRequest } from "payload"

import { home } from "./home"
import { image1 } from "./image-1"
import { image2 } from "./image-2"
import { imageHero } from "./image-hero"
import { post1 } from "./post-1"

const collections: CollectionSlug[] = [
  "categories",
  "media",
  "pages",
  "posts",
]

const categories = ["Technology", "News", "Finance", "Design", "Software", "Engineering"]

// Next.js revalidation errors are normal when seeding the database without a server running
// i.e. running `yarn seed` locally instead of using the admin UI within an active app
// The app is not running to revalidate the pages and so the API routes are not available
// These error messages can be ignored: `Error hitting revalidate route for...`
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info("Seeding database...")

  // we need to clear the media directory before seeding
  // as well as the collections and globals
  // this is because while `yarn seed` drops the database
  // the custom `/api/seed` endpoint does not
  payload.logger.info(`— Clearing collections and globals...`)

  // clear the database - header
  await payload.updateGlobal({
    slug: "header",
    data: {
      navItems: [],
    },
    depth: 0,
    context: {
      disableRevalidate: true,
    },
  })

  // clear the database - footer
  await payload.updateGlobal({
    slug: "footer",
    data: {
      columns: [],
      socialLinks: {},
      newsletter: { enabled: false },
      copyrightText: "",
      bottomLinks: [],
    },
    depth: 0,
    context: {
      disableRevalidate: true,
    },
  })

  await Promise.all(
    collections.map((collection) => payload.db.deleteMany({ collection, req, where: {} })),
  )

  await Promise.all(
    collections
      .filter((collection) => Boolean(payload.collections[collection].config.versions))
      .map((collection) => payload.db.deleteVersions({ collection, req, where: {} })),
  )

  payload.logger.info(`— Seeding demo author and user...`)

  await payload.delete({
    collection: "users",
    depth: 0,
    where: {
      email: {
        equals: "demo-author@example.com",
      },
    },
  })

  payload.logger.info(`— Seeding media...`)

  const [image1Buffer, image2Buffer, heroBuffer] = await Promise.all([
    fetchFileByURL(
      "https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post1.webp",
    ),
    fetchFileByURL(
      "https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post2.webp",
    ),
    fetchFileByURL(
      "https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-hero1.webp",
    ),
  ])

  const [demoAuthor, image1Doc, image2Doc, imageHeroDoc] = await Promise.all([
    payload.create({
      collection: "users",
      data: {
        name: "Demo Author",
        email: "demo-author@example.com",
        password: "password",
      },
    }),
    payload.create({
      collection: "media",
      data: image1,
      file: image1Buffer,
    }),
    payload.create({
      collection: "media",
      data: image2,
      file: image2Buffer,
    }),
    payload.create({
      collection: "media",
      data: imageHero,
      file: heroBuffer,
    }),
    ...categories.map((category) =>
      payload.create({
        collection: "categories",
        data: {
          title: category,
        },
      }),
    ),
  ])

  payload.logger.info(`— Seeding posts...`)

  const post1Doc = await payload.create({
    collection: "posts",
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post1({ heroImage: image1Doc, author: demoAuthor }),
  })

  payload.logger.info(`— Seeding pages...`)

  await payload.create({
    collection: "pages",
    depth: 0,
    data: home({ heroImage: imageHeroDoc }),
  })

  payload.logger.info(`— Seeding globals...`)

  await Promise.all([
    payload.updateGlobal({
      slug: "header",
      data: {
        navItems: [
          {
            type: "link",
            label: "Posts",
            link: {
              type: "custom",
              url: "/posts",
            },
          },
        ],
      },
    }),
    payload.updateGlobal({
      slug: "footer",
      data: {
        columns: [
          {
            title: "Resources",
            links: [
              {
                link: {
                  type: "custom",
                  label: "Admin",
                  url: "/admin",
                },
              },
              {
                link: {
                  type: "custom",
                  label: "Payload Docs",
                  newTab: true,
                  url: "https://payloadcms.com/docs",
                },
              },
            ],
          },
        ],
        socialLinks: {
          github: "https://github.com/payloadcms/payload",
          twitter: "https://x.com/payloadcms",
        },
        newsletter: {
          enabled: true,
          title: "Newsletter",
          description: "Stay up to date with the latest updates.",
          buttonText: "Subscribe",
          placeholder: "Enter your email",
        },
        copyrightText: "sfdc-lex-out",
        bottomLinks: [],
      },
    }),
  ])

  payload.logger.info("Seeded database successfully!")
}

async function fetchFileByURL(url: string): Promise<File> {
  const res = await fetch(url, {
    credentials: "include",
    method: "GET",
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}, status: ${res.status}`)
  }

  const data = await res.arrayBuffer()

  return {
    name: url.split("/").pop() || `file-${Date.now()}`,
    data: Buffer.from(data),
    mimetype: `image/${url.split(".").pop()}`,
    size: data.byteLength,
  }
}
