import db from '~/server/utils/db'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody(event)
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    const [result] = await conn.execute(
      'INSERT INTO experiences (slug, period, company, location, role, is_current, description, sort_order, is_visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [body.slug, body.period, body.company, body.location, body.role, body.is_current ? 1 : 0, body.description, body.sort_order || 0, body.is_visible !== undefined ? (body.is_visible ? 1 : 0) : 1]
    )
    const expId = (result as any).insertId
    for (const [i, content] of (body.bullets || []).entries()) {
      await conn.execute('INSERT INTO experience_bullets (experience_id, content, sort_order) VALUES (?, ?, ?)', [expId, content, i])
    }
    for (const [i, tag] of (body.tags || []).entries()) {
      await conn.execute('INSERT INTO experience_tags (experience_id, tag, sort_order) VALUES (?, ?, ?)', [expId, tag, i])
    }
    await conn.commit()
    return { id: expId }
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})
