#!/usr/bin/env tsx
/**
 * Supabase Backup Script
 * Exports all database tables to JSON files
 * Run: npx tsx scripts/backup-supabase.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY env vars required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const TABLES = [
  'pacientes',
  'citas',
  'fichas_clinicas',
  'procedimientos',
  'pagos',
  'odontograma',
  'audit_logs',
  'user_roles',
]

const backupDir = path.join(process.cwd(), 'backups')

/**
 * Create backup directory if it doesn't exist
 */
const ensureBackupDir = () => {
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
    console.log(`✅ Created backup directory: ${backupDir}`)
  }
}

/**
 * Export single table to JSON
 */
const exportTable = async (tableName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from(tableName).select('*')

    if (error) {
      console.error(`❌ Error exporting ${tableName}:`, error.message)
      return false
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = `${tableName}_${timestamp}.json`
    const filePath = path.join(backupDir, fileName)

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    console.log(`✅ Exported ${tableName}: ${data?.length || 0} records → ${fileName}`)

    return true
  } catch (error) {
    console.error(`❌ Exception exporting ${tableName}:`, error)
    return false
  }
}

/**
 * Main backup function
 */
const runBackup = async () => {
  console.log('🔄 Starting Supabase backup...\n')
  ensureBackupDir()

  const startTime = Date.now()
  let successCount = 0
  let failureCount = 0

  for (const table of TABLES) {
    const success = await exportTable(table)
    if (success) {
      successCount++
    } else {
      failureCount++
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2)

  console.log(`\n📊 Backup Summary:`)
  console.log(`   ✅ Successful: ${successCount}/${TABLES.length}`)
  console.log(`   ❌ Failed: ${failureCount}/${TABLES.length}`)
  console.log(`   ⏱️  Duration: ${duration}s`)
  console.log(`   📁 Location: ${backupDir}\n`)

  if (failureCount > 0) {
    process.exit(1)
  }
}

// Run backup
runBackup()
