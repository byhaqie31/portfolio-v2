import pool from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const adminKey = getHeader(event, 'x-admin-key')
  if (!adminKey || adminKey !== process.env.ADMIN_SECRET) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')

  await pool.execute(
    'UPDATE feedbacks SET is_public = NOT is_public WHERE id = ?',
    [id]
  )

  const [rows] = await pool.execute(
    'SELECT * FROM feedbacks WHERE id = ?',
    [id]
  )

  const results = rows as any[]
  if (results.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Feedback not found' })
  }

  return results[0]
})
