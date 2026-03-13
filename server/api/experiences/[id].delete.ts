import db from '~/server/utils/db'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  await db.execute('DELETE FROM experiences WHERE id=?', [id])
  return { success: true }
})
