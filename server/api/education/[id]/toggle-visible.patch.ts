import db from '~/server/utils/db'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  await db.execute('UPDATE education SET is_visible = NOT is_visible WHERE id=?', [id])
  const [rows] = await db.execute('SELECT * FROM education WHERE id=?', [id])
  return (rows as any[])[0]
})
