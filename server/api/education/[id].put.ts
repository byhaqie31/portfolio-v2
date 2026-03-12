import db from '~/server/utils/db'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  await db.execute(
    'UPDATE education SET slug=?, period=?, institution=?, location=?, degree=?, cgpa=?, sort_order=?, is_visible=? WHERE id=?',
    [body.slug, body.period, body.institution, body.location, body.degree, body.cgpa, body.sort_order || 0, body.is_visible ? 1 : 0, id]
  )
  return { success: true }
})
