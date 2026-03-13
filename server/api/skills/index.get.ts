import db from '~/server/utils/db'

export default defineEventHandler(async () => {
  const [groups] = await db.execute('SELECT * FROM skill_groups ORDER BY sort_order')
  const [items] = await db.execute('SELECT * FROM skill_items ORDER BY sort_order')
  return (groups as any[]).map(g => ({
    ...g,
    items: (items as any[]).filter(i => i.group_id === g.id).map(i => i.name),
  }))
})
