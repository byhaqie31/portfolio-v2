import db from '~/server/utils/db'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const [rows] = await db.execute('SELECT * FROM projects WHERE id=?', [id])
  const project = (rows as any[])[0]
  if (!project) throw createError({ statusCode: 404, message: 'Not found' })
  const [stack] = await db.execute('SELECT * FROM project_stack WHERE project_id=? ORDER BY sort_order', [id])
  const [metrics] = await db.execute('SELECT * FROM project_metrics WHERE project_id=? ORDER BY sort_order', [id])
  return { ...project, stack: (stack as any[]).map(s => s.tech), metrics }
})
