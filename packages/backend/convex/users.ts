import { query } from './_generated/server'
import { authComponent } from './auth'

// Get current user from Better Auth session
// Returns null if not authenticated (instead of throwing)
export const current = query({
  args: {},
  handler: async (ctx) => {
    try {
      return await authComponent.getAuthUser(ctx)
    } catch {
      return null
    }
  },
})

// Alias for current user - used by dashboard components
// Returns null if not authenticated (instead of throwing)
export const viewer = query({
  args: {},
  handler: async (ctx) => {
    try {
      return await authComponent.getAuthUser(ctx)
    } catch {
      return null
    }
  },
})
