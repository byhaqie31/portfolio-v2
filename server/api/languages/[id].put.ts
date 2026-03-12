import db from '~/server/utils/db'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  await db.execute('UPDATE languages SET lang=?, level=?, sort_order=? WHERE id=?', [body.lang, body.level, body.sort_order || 0, id])
  return { success: true }
})
