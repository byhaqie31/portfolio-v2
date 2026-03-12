import db from '~/server/utils/db'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody(event)
  const [result] = await db.execute(
    'INSERT INTO references_list (name, title, company, email, is_visible, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
    [body.name, body.title, body.company, body.email, body.is_visible !== undefined ? (body.is_visible ? 1 : 0) : 1, body.sort_order || 0]
  )
  return { id: (result as any).insertId }
})
