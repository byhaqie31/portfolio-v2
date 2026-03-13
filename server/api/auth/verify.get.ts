import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler((event) => {
  requireAdmin(event)
  return { authenticated: true }
})
