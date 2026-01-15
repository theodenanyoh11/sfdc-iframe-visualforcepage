import type { CollectionConfig } from "payload"

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
import { anyone } from "../../access/anyone"
import { authenticated } from "../../access/authenticated"

export const FAQs: CollectionConfig = {
  slug: "faqs",
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: "question",
    defaultColumns: ["question", "category", "order", "updatedAt"],
    group: "Content",
  },
  fields: [
    {
      name: "question",
      type: "text",
      required: true,
      label: "Question",
    },
    {
      name: "answer",
      type: "richText",
      required: true,
      label: "Answer",
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
    {
      name: "category",
      type: "select",
      required: true,
      defaultValue: "general",
      options: [
        { label: "General", value: "general" },
        { label: "Pricing", value: "pricing" },
        { label: "Features", value: "features" },
        { label: "Getting Started", value: "getting-started" },
        { label: "Technical", value: "technical" },
        { label: "Support", value: "support" },
      ],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: {
        position: "sidebar",
        description: "Lower numbers appear first",
      },
    },
  ],
  defaultSort: "order",
}
