import db from '~/server/utils/db'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody(event)
  const [result] = await db.execute(
    'INSERT INTO activities (content, sort_order, is_visible) VALUES (?, ?, ?)',
    [body.content, body.sort_order || 0, body.is_visible !== undefined ? (body.is_visible ? 1 : 0) : 1]
  )
  return { id: (result as any).insertId }
})
