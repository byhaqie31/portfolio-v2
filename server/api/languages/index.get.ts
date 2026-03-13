import db from '~/server/utils/db'

export default defineEventHandler(async () => {
  const [rows] = await db.execute('SELECT * FROM languages ORDER BY sort_order')
  return rows
})
