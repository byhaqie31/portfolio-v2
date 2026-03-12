import pool from '~/server/utils/db'

export default defineEventHandler(async () => {
  const [rows] = await pool.execute(
    'SELECT name, relationship, respondent_name, position, company, rating, message, submitted_at FROM feedbacks WHERE is_public = 1 AND submitted_at IS NOT NULL ORDER BY submitted_at DESC'
  )

  return rows
})
