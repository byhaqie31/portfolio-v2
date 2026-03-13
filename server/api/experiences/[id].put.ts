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
      'UPDATE experiences SET slug=?, period=?, company=?, location=?, role=?, is_current=?, description=?, sort_order=?, is_visible=? WHERE id=?',
      [body.slug, body.period, body.company, body.location, body.role, body.is_current ? 1 : 0, body.description, body.sort_order || 0, body.is_visible ? 1 : 0, id]
    )
    await conn.execute('DELETE FROM experience_bullets WHERE experience_id=?', [id])
    for (const [i, content] of (body.bullets || []).entries()) {
      await conn.execute('INSERT INTO experience_bullets (experience_id, content, sort_order) VALUES (?, ?, ?)', [id, content, i])
    }
    await conn.execute('DELETE FROM experience_tags WHERE experience_id=?', [id])
    for (const [i, tag] of (body.tags || []).entries()) {
      await conn.execute('INSERT INTO experience_tags (experience_id, tag, sort_order) VALUES (?, ?, ?)', [id, tag, i])
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
