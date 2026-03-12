import crypto from 'node:crypto'
import pool from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const adminKey = getHeader(event, 'x-admin-key')
  if (!adminKey || adminKey !== process.env.ADMIN_SECRET) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const name = typeof body.name === 'string' ? body.name.trim() : ''

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Name is required' })
  }

  const relationship = typeof body.relationship === 'string' ? body.relationship.trim() : null
  const token = crypto.randomBytes(32).toString('hex')

  await pool.execute(
    'INSERT INTO feedbacks (name, relationship, token, message) VALUES (?, ?, ?, ?)',
    [name, relationship, token, '']
  )

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'

  return { url: `${baseUrl}/feedback/${token}` }
})
