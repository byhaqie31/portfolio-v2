import db from '~/server/utils/db'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody(event)
  const [result] = await db.execute(
    'INSERT INTO languages (lang, level, sort_order) VALUES (?, ?, ?)',
    [body.lang, body.level, body.sort_order || 0]
  )
  return { id: (result as any).insertId }
})
