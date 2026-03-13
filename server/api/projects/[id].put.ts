import db from '~/server/utils/db'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    await conn.execute(
      'UPDATE projects SET slug=?, tag=?, featured=?, name=?, description=?, href=?, github_url=?, sort_order=?, is_visible=? WHERE id=?',
      [body.slug, body.tag, body.featured ? 1 : 0, body.name, body.description, body.href || null, body.github_url || null, body.sort_order || 0, body.is_visible ? 1 : 0, id]
    )
    await conn.execute('DELETE FROM project_stack WHERE project_id=?', [id])
    for (const [i, tech] of (body.stack || []).entries()) {
      await conn.execute('INSERT INTO project_stack (project_id, tech, sort_order) VALUES (?, ?, ?)', [id, tech, i])
    }
    await conn.execute('DELETE FROM project_metrics WHERE project_id=?', [id])
    for (const [i, m] of (body.metrics || []).entries()) {
      await conn.execute('INSERT INTO project_metrics (project_id, value, label, sort_order) VALUES (?, ?, ?, ?)', [id, m.value, m.label, i])
    }
    await conn.commit()
    return { success: true }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
