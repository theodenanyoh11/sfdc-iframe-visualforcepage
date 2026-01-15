import type { Block } from 'payload'

export const ContentBlock: Block = {
  slug: 'content',
  labels: { singular: 'Content', plural: 'Content' },
  fields: [
    { name: 'content', type: 'richText' },
  ],
}
