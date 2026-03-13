import pool from '../utils/db'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

export default defineNitroPlugin(async () => {
  try {
    // 1. Ensure migrations tracking table exists
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // 2. Get already-applied migrations
    const [rows] = await pool.execute('SELECT name FROM migrations ORDER BY id')
    const applied = new Set((rows as any[]).map(r => r.name))

    // 3. Read migration files sorted by name
    const migrationsDir = join(process.cwd(), 'migrations')
    let files: string[]
    try {
      files = await readdir(migrationsDir)
    } catch {
      // No migrations directory yet — nothing to do
      console.log('[migrate] No migrations directory found, skipping.')
      return
    }

    const sqlFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort()

    // 4. Run new migrations
    let count = 0
    for (const file of sqlFiles) {
      if (applied.has(file)) continue

      const sql = await readFile(join(migrationsDir, file), 'utf-8')
      const conn = await pool.getConnection()
      try {
        await conn.beginTransaction()
        // Execute each statement separated by semicolons
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0)
        for (const stmt of statements) {
          await conn.execute(stmt)
        }
        await conn.execute('INSERT INTO migrations (name) VALUES (?)', [file])
        await conn.commit()
        console.log(`[migrate] Applied: ${file}`)
        count++
      } catch (err) {
        await conn.rollback()
        console.error(`[migrate] Failed: ${file}`, err)
        throw err
      } finally {
        conn.release()
      }
    }

    if (count === 0) {
      console.log('[migrate] Database is up to date.')
    } else {
      console.log(`[migrate] Applied ${count} migration(s).`)
    }
  } catch (err) {
    console.error('[migrate] Migration error:', err)
  }
})
