import db from '~/server/utils/db'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody(event)
  const [result] = await db.execute(
    'INSERT INTO education (slug, period, institution, location, degree, cgpa, sort_order, is_visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [body.slug, body.period, body.institution, body.location, body.degree, body.cgpa, body.sort_order || 0, body.is_visible !== undefined ? (body.is_visible ? 1 : 0) : 1]
  )
  return { id: (result as any).insertId }
})
