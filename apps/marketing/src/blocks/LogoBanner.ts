import type { Block } from 'payload'

export const LogoBannerBlock: Block = {
  slug: 'logoBanner',
  labels: { singular: 'Logo Banner', plural: 'Logo Banners' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'logos',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'logo', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
