import db from '~/server/utils/db'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const [rows] = await db.execute('SELECT * FROM experiences WHERE id=?', [id])
  const exp = (rows as any[])[0]
  if (!exp) throw createError({ statusCode: 404, message: 'Not found' })
  const [bullets] = await db.execute('SELECT * FROM experience_bullets WHERE experience_id=? ORDER BY sort_order', [id])
  const [tags] = await db.execute('SELECT * FROM experience_tags WHERE experience_id=? ORDER BY sort_order', [id])
  return { ...exp, bullets: (bullets as any[]).map(b => b.content), tags: (tags as any[]).map(t => t.tag) }
})
