import pool from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const adminKey = getHeader(event, 'x-admin-key')
  if (!adminKey || adminKey !== process.env.ADMIN_SECRET) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const [rows] = await pool.execute(
    'SELECT * FROM feedbacks ORDER BY created_at DESC'
  )

  return rows
})
