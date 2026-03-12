import db from '~/server/utils/db'

export default defineEventHandler(async () => {
  const [rows] = await db.execute('SELECT * FROM activities WHERE is_visible = 1 ORDER BY sort_order')
  return rows
})
