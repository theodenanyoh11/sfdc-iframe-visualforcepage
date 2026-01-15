import type { GlobalConfig } from "payload"

import { link } from "@/fields/link"
import { revalidateFooter } from "./hooks/revalidateFooter"

export const Footer: GlobalConfig = {
  slug: "footer",
  access: {
    read: () => true,
  },
  fields: [
    // Link Columns - organized groups of links
    {
      name: "columns",
      type: "array",
      label: "Link Columns",
      maxRows: 5,
      admin: {
        initCollapsed: true,
        description: "Add columns of links (e.g., Solutions, Resources, Company)",
      },
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
          label: "Column Title",
        },
        {
          name: "links",
          type: "array",
          label: "Links",
          maxRows: 10,
          fields: [
            link({
              appearances: false,
            }),
          ],
          admin: {
            initCollapsed: true,
          },
        },
      ],
    },
    // Social Links
    {
      name: "socialLinks",
      type: "group",
      label: "Social Links",
      admin: {
        description: "Add your social media profile URLs",
      },
      fields: [
        {
          name: "twitter",
          type: "text",
          label: "X (Twitter)",
          admin: {
            placeholder: "https://x.com/yourhandle",
          },
        },
        {
          name: "instagram",
          type: "text",
          label: "Instagram",
          admin: {
            placeholder: "https://instagram.com/yourhandle",
          },
        },
        {
          name: "linkedin",
          type: "text",
          label: "LinkedIn",
          admin: {
            placeholder: "https://linkedin.com/company/yourcompany",
          },
        },
        {
          name: "github",
          type: "text",
          label: "GitHub",
          admin: {
            placeholder: "https://github.com/yourorg",
          },
        },
        {
          name: "youtube",
          type: "text",
          label: "YouTube",
          admin: {
            placeholder: "https://youtube.com/@yourchannel",
          },
        },
      ],
    },
    // Newsletter Section
    {
      name: "newsletter",
      type: "group",
      label: "Newsletter",
      admin: {
        description: "Configure the newsletter signup section",
      },
      fields: [
        {
          name: "enabled",
          type: "checkbox",
          label: "Enable Newsletter Signup",
          defaultValue: true,
        },
        {
          name: "title",
          type: "text",
          label: "Title",
          defaultValue: "Newsletter",
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
          },
        },
        {
          name: "description",
          type: "textarea",
          label: "Description",
          defaultValue: "Stay up to date with the latest updates and news.",
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
          },
        },
        {
          name: "buttonText",
          type: "text",
          label: "Button Text",
          defaultValue: "Subscribe",
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
          },
        },
        {
          name: "placeholder",
          type: "text",
          label: "Email Placeholder",
          defaultValue: "Enter your email",
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
          },
        },
      ],
    },
    // Copyright and Bottom Bar
    {
      name: "copyrightText",
      type: "text",
      label: "Copyright Text",
      defaultValue: "sfdc-lex-out",
      admin: {
        description: "Company name for copyright (year is added automatically)",
      },
    },
    {
      name: "bottomLinks",
      type: "array",
      label: "Bottom Bar Links",
      maxRows: 4,
      admin: {
        description: "Links shown in the bottom bar (e.g., Contact Support, Privacy Policy)",
        initCollapsed: true,
      },
      fields: [
        link({
          appearances: false,
        }),
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
