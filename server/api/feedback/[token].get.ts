import pool from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')

  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Token is required' })
  }

  const [rows] = await pool.execute(
    'SELECT name, submitted_at FROM feedbacks WHERE token = ?',
    [token]
  )

  const results = rows as any[]

  if (results.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Invalid feedback link' })
  }

  const row = results[0]

  if (row.submitted_at !== null) {
    throw createError({ statusCode: 410, statusMessage: 'Feedback already submitted' })
  }

  return { valid: true, name: row.name }
})
