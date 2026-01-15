import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

// Better Auth manages its own tables via the betterAuth component
// Add your custom application tables here
export default defineSchema({
  // Example:
  // posts: defineTable({
  //   title: v.string(),
  //   content: v.string(),
  //   userId: v.string(), // Better Auth user ID
  //   createdAt: v.number(),
  // }).index('by_user', ['userId']),
})
