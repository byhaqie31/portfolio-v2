import pool from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')
  const body = await readBody(event)

  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Token is required' })
  }

  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!message) {
    throw createError({ statusCode: 400, statusMessage: 'Message is required' })
  }
  if (message.length > 2000) {
    throw createError({ statusCode: 400, statusMessage: 'Message must be 2000 characters or less' })
  }

  const rating = body.rating != null ? Number(body.rating) : null
  if (rating === null || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw createError({ statusCode: 400, statusMessage: 'Rating is required (1-5)' })
  }

  const email = typeof body.email === 'string' ? body.email.trim() : ''
  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'Email is required' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email format' })
  }

  const respondentName = typeof body.respondent_name === 'string' ? body.respondent_name.trim() : ''
  if (!respondentName) {
    throw createError({ statusCode: 400, statusMessage: 'Name is required' })
  }

  const position = typeof body.position === 'string' ? body.position.trim() : ''
  if (!position) {
    throw createError({ statusCode: 400, statusMessage: 'Position is required' })
  }

  const company = typeof body.company === 'string' ? body.company.trim() : ''
  if (!company) {
    throw createError({ statusCode: 400, statusMessage: 'Company is required' })
  }

  const [result] = await pool.execute(
    'UPDATE feedbacks SET message = ?, rating = ?, email = ?, respondent_name = ?, position = ?, company = ?, submitted_at = NOW() WHERE token = ? AND submitted_at IS NULL',
    [message, rating, email, respondentName, position, company, token]
  )

  const { affectedRows } = result as any

  if (affectedRows === 0) {
    throw createError({ statusCode: 410, statusMessage: 'Feedback link expired or already used' })
  }

  return { success: true }
})
