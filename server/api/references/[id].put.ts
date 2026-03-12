import db from '~/server/utils/db'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  await db.execute(
    'UPDATE references_list SET name=?, title=?, company=?, email=?, is_visible=?, sort_order=? WHERE id=?',
    [body.name, body.title, body.company, body.email, body.is_visible ? 1 : 0, body.sort_order || 0, id]
  )
  return { success: true }
})
