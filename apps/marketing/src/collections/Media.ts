import type { CollectionConfig } from "payload"

import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  AlignFeature,
  BlockquoteFeature,
  ChecklistFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  IndentFeature,
  InlineCodeFeature,
  InlineToolbarFeature,
  OrderedListFeature,
  RelationshipFeature,
  StrikethroughFeature,
  SubscriptFeature,
  SuperscriptFeature,
  UnorderedListFeature,
  UploadFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical"

import { anyone } from "../access/anyone"
import { authenticated } from "../access/authenticated"

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Local storage configuration
const useLocalStorage = true

export const Media: CollectionConfig = {
  slug: "media",
  folders: true,
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: "alt",
      type: "text",
    },
    {
      name: "caption",
      type: "richText",
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            FixedToolbarFeature(),
            InlineToolbarFeature(),
            StrikethroughFeature(),
            SubscriptFeature(),
            SuperscriptFeature(),
            InlineCodeFeature(),
            BlockquoteFeature(),
            UnorderedListFeature(),
            OrderedListFeature(),
            ChecklistFeature(),
            AlignFeature(),
            IndentFeature(),
            RelationshipFeature(),
            UploadFeature(),
            EXPERIMENTAL_TableFeature(),
          ]
        },
      }),
    },
  ],
  upload: {
    // Only use local staticDir for development; production uses cloud storage
    ...(useLocalStorage && {
      staticDir: path.resolve(dirname, "../../public/media"),
    }),
    adminThumbnail: "thumbnail",
    focalPoint: true,
    // Allow common image and video file types
    mimeTypes: [
      "image/*",
      "video/mp4",
      "video/webm",
      "video/quicktime", // .mov files
    ],
    // Convert original uploaded image to WebP format for better compression
    // Note: formatOptions only applies to images, videos are uploaded as-is
    formatOptions: {
      format: "webp",
      options: {
        quality: 85,
      },
    },
    imageSizes: [
      {
        name: "thumbnail",
        width: 300,
        formatOptions: {
          format: "webp",
          options: { quality: 80 },
        },
      },
      {
        name: "square",
        width: 500,
        height: 500,
        formatOptions: {
          format: "webp",
          options: { quality: 80 },
        },
      },
      {
        name: "small",
        width: 600,
        formatOptions: {
          format: "webp",
          options: { quality: 80 },
        },
      },
      {
        name: "medium",
        width: 900,
        formatOptions: {
          format: "webp",
          options: { quality: 80 },
        },
      },
      {
        name: "large",
        width: 1400,
        formatOptions: {
          format: "webp",
          options: { quality: 80 },
        },
      },
      {
        name: "xlarge",
        width: 1920,
        formatOptions: {
          format: "webp",
          options: { quality: 80 },
        },
      },
      {
        name: "og",
        width: 1200,
        height: 630,
        crop: "center",
        formatOptions: {
          format: "webp",
          options: { quality: 85 },
        },
      },
    ],
  },
}
