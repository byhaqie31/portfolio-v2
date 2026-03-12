import type { H3Event } from 'h3'

export function requireAdmin(event: H3Event) {
  const key = getHeader(event, 'x-admin-key')
  if (!key || key !== process.env.ADMIN_SECRET) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
}
