import type { GlobalConfig } from "payload"

import { link } from "@/fields/link"
import { revalidateHeader } from "./hooks/revalidateHeader"

export const Header: GlobalConfig = {
  slug: "header",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "navItems",
      type: "array",
      maxRows: 8,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: "@/Header/RowLabel#RowLabel",
        },
      },
      fields: [
        {
          name: "type",
          type: "select",
          defaultValue: "link",
          options: [
            { label: "Simple Link", value: "link" },
            { label: "Mega Menu", value: "megaMenu" },
          ],
          admin: {
            description: "Choose between a simple link or a mega menu dropdown",
          },
        },
        {
          name: "label",
          type: "text",
          required: true,
          label: "Nav Item Label",
        },
        {
          name: "position",
          type: "select",
          defaultValue: "left",
          options: [
            { label: "Left (Near Logo)", value: "left" },
            { label: "Right (CTA Section)", value: "right" },
          ],
          admin: {
            description: "Control where this nav item appears in the header",
          },
        },
        {
          name: "appearance",
          type: "select",
          defaultValue: "button",
          options: [
            { label: "Button", value: "button" },
            { label: "Link", value: "link" },
          ],
          admin: {
            description: "How this item should be displayed",
            condition: (_, siblingData) => siblingData?.position === "right",
          },
        },
        // Simple link fields
        link({
          appearances: false,
          disableLabel: true,
          overrides: {
            admin: {
              condition: (_, siblingData) => siblingData?.type === "link",
            },
          },
        }),
        // Mega menu fields
        {
          name: "megaMenuColumns",
          type: "array",
          label: "Menu Columns",
          maxRows: 4,
          admin: {
            condition: (_, siblingData) => siblingData?.type === "megaMenu",
          },
          fields: [
            {
              name: "columnLabel",
              type: "text",
              label: "Column Heading",
            },
            {
              name: "columnDescription",
              type: "textarea",
              label: "Column Description",
              admin: {
                description: "Optional description shown below the column heading",
              },
            },
            {
              name: "items",
              type: "array",
              label: "Menu Items",
              maxRows: 8,
              fields: [
                {
                  name: "label",
                  type: "text",
                  required: true,
                  label: "Item Label",
                },
                {
                  name: "description",
                  type: "text",
                  label: "Item Description",
                  admin: {
                    description: "Short description shown below the label",
                  },
                },
                {
                  name: "icon",
                  type: "select",
                  label: "Icon",
                  options: [
                    { label: "None", value: "none" },
                    { label: "Layout", value: "layout" },
                    { label: "Dollar Sign", value: "dollarSign" },
                    { label: "Search", value: "search" },
                    { label: "Settings", value: "settings" },
                    { label: "Zap", value: "zap" },
                    { label: "Layers", value: "layers" },
                    { label: "Users", value: "users" },
                    { label: "Building", value: "building" },
                    { label: "Globe", value: "globe" },
                    { label: "Store", value: "store" },
                    { label: "Rocket", value: "rocket" },
                    { label: "Target", value: "target" },
                    { label: "BarChart", value: "barChart" },
                    { label: "Shield", value: "shield" },
                    { label: "Database", value: "database" },
                  ],
                  defaultValue: "none",
                },
                link({
                  appearances: false,
                  disableLabel: true,
                }),
              ],
            },
          ],
        },
        // Featured section for mega menu
        {
          name: "featuredItem",
          type: "group",
          label: "Featured Section",
          admin: {
            condition: (_, siblingData) => siblingData?.type === "megaMenu",
            description: "Optional featured content shown in the mega menu",
          },
          fields: [
            {
              name: "enabled",
              type: "checkbox",
              label: "Show Featured Section",
              defaultValue: false,
            },
            {
              name: "heading",
              type: "text",
              label: "Featured Heading",
              admin: {
                condition: (_, siblingData) => siblingData?.enabled,
              },
            },
            {
              name: "description",
              type: "textarea",
              label: "Featured Description",
              admin: {
                condition: (_, siblingData) => siblingData?.enabled,
              },
            },
            {
              name: "image",
              type: "upload",
              relationTo: "media",
              label: "Featured Image",
              admin: {
                condition: (_, siblingData) => siblingData?.enabled,
              },
            },
            link({
              appearances: false,
              overrides: {
                admin: {
                  condition: (_, siblingData) => siblingData?.enabled,
                },
              },
            }),
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
