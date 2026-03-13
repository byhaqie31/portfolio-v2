import db from '~/server/utils/db'

export default defineEventHandler(async () => {
  const [experiences] = await db.execute('SELECT * FROM experiences WHERE is_visible = 1 ORDER BY sort_order')
  const [bullets] = await db.execute('SELECT * FROM experience_bullets ORDER BY sort_order')
  const [tags] = await db.execute('SELECT * FROM experience_tags ORDER BY sort_order')
  return (experiences as any[]).map(e => ({
    ...e,
    bullets: (bullets as any[]).filter(b => b.experience_id === e.id).map(b => b.content),
    tags: (tags as any[]).filter(t => t.experience_id === e.id).map(t => t.tag),
  }))
})
