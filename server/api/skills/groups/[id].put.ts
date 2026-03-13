import db from '~/server/utils/db'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    await conn.execute('UPDATE skill_groups SET label=?, sort_order=? WHERE id=?', [body.label, body.sort_order || 0, id])
    await conn.execute('DELETE FROM skill_items WHERE group_id=?', [id])
    for (const [i, name] of (body.items || []).entries()) {
      await conn.execute('INSERT INTO skill_items (group_id, name, sort_order) VALUES (?, ?, ?)', [id, name, i])
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
