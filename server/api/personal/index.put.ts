import db from '~/server/utils/db'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody(event)
  await db.execute(
    `UPDATE personal SET name=?, short_name=?, role=?, bio_1=?, bio_2=?, summary=?, location=?, email=?, mobile=?, website=?, github=?, linkedin=?, available_for=?, focus=? WHERE id=?`,
    [body.name, body.short_name, body.role, body.bio_1, body.bio_2 || null, body.summary, body.location, body.email, body.mobile || null, body.website || null, body.github || null, body.linkedin || null, body.available_for || null, body.focus || null, body.id || 1]
  )
  return { success: true }
})
