import db from '~/server/utils/db'

export default defineEventHandler(async () => {
  const [projects] = await db.execute('SELECT * FROM projects WHERE is_visible = 1 ORDER BY sort_order')
  const [stack] = await db.execute('SELECT * FROM project_stack ORDER BY sort_order')
  const [metrics] = await db.execute('SELECT * FROM project_metrics ORDER BY sort_order')
  return (projects as any[]).map(p => ({
    ...p,
    stack: (stack as any[]).filter(s => s.project_id === p.id).map(s => s.tech),
    metrics: (metrics as any[]).filter(m => m.project_id === p.id),
  }))
})
