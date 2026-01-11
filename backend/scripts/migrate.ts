// scripts/migrate.ts
import {SupabaseClient} from '../src/shared/supabase/client';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Database migration script
 */
async function runMigrations() {
  console.log('Starting database migrations...');

  // Get configuration from environment variables
  const env = {
    SUPABASE_URL: process.env['SUPABASE_URL'],
    SUPABASE_SERVICE_ROLE_KEY: process.env['SUPABASE_SERVICE_ROLE_KEY'],
    SUPABASE_ANON_KEY: process.env['SUPABASE_ANON_KEY'],
  };

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing required environment variables');
    process.exit(1);
  }

  const supabase = SupabaseClient.getServiceClient(env as any);

  try {
    // Create migrations table (if it doesn't exist)
    await createMigrationsTable(supabase);

    // Get executed migrations
    const {data: runMigrations} = await (supabase as any)
      .from('migrations')
      .select('name')
      .order('executed_at', {ascending: true});

    const runMigrationNames = new Set(runMigrations?.map((m: any) => m.name) || []);

    // 获取迁移文件
    const migrationsDir = path.join(__dirname, '../database/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const migrationFile of migrationFiles) {
      if (!runMigrationNames.has(migrationFile)) {
        console.log(`Running migration: ${migrationFile}`);

        // 读取SQL文件
        const sqlPath = path.join(migrationsDir, migrationFile);
        const sql = fs.readFileSync(sqlPath, 'utf-8');

        // 执行SQL - 使用rpc方法执行原始SQL
        const {error} = await (supabase as any).rpc('exec_sql', {sql});

        if (error) {
          console.error(`Migration ${migrationFile} failed:`, error);
          throw error;
        }

        // 记录迁移
        await (supabase as any).from('migrations').insert({
          name: migrationFile,
          executed_at: new Date().toISOString(),
        });

        console.log(`Migration ${migrationFile} completed successfully`);
      }
    }

    console.log('All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

/**
 * 创建迁移记录表
 */
async function createMigrationsTable(supabase: any): Promise<void> {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS migrations (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_migrations_name ON migrations(name);
  `;

  await (supabase as any).rpc('exec_sql', {sql: createTableSQL});
}

// 运行迁移
if (require.main === module) {
  runMigrations();
}

export {runMigrations};
