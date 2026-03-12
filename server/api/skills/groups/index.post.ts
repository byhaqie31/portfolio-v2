import db from '~/server/utils/db'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody(event)
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    const [result] = await conn.execute(
      'INSERT INTO skill_groups (label, sort_order) VALUES (?, ?)',
      [body.label, body.sort_order || 0]
    )
    const groupId = (result as any).insertId
    for (const [i, name] of (body.items || []).entries()) {
      await conn.execute('INSERT INTO skill_items (group_id, name, sort_order) VALUES (?, ?, ?)', [groupId, name, i])
    }
    await conn.commit()
    return { id: groupId }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
