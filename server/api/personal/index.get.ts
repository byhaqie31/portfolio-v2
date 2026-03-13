import db from '~/server/utils/db'

export default defineEventHandler(async () => {
  const [rows] = await db.execute('SELECT * FROM personal LIMIT 1')
  const personal = (rows as any[])[0] || null
  const [langs] = await db.execute('SELECT * FROM languages ORDER BY sort_order')
  return { ...personal, languages: langs }
})
