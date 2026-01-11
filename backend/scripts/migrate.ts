// scripts/migrate.ts
import {SupabaseClient, type Env} from '../src/shared/supabase/client';
import * as fs from 'fs';
import * as path from 'path';

// Types for better type safety
interface MigrationRecord {
  id?: string;
  name: string;
  executed_at?: string;
  created_at?: string;
}

// Safe type for Supabase operations to avoid any
interface SupabaseMigrationClient {
  rpc: (name: string, args: Record<string, unknown>) => Promise<{error?: Error}>;
  from: (table: string) => {
    select: (columns: string) => {
      order: (column: string, options: {ascending: boolean}) => Promise<{data?: MigrationRecord[]}>;
    };
    insert: (data: Record<string, unknown>) => Promise<{error?: Error}>;
  };
}

// Custom logger to replace console statements
class MigrationLogger {
  static log(message: string): void {
    process.stdout.write(`[INFO] ${message}\n`);
  }

  static error(message: string, error?: unknown): void {
    process.stderr.write(`[ERROR] ${message}${error ? `: ${error}` : ''}\n`);
  }

  static info(message: string): void {
    process.stdout.write(`[INFO] ${message}\n`);
  }
}

/**
 * Database migration script
 */
async function runMigrations(): Promise<void> {
  MigrationLogger.info('Starting database migrations...');

  // Get configuration from environment variables
  const env: Env = {
    SUPABASE_URL: process.env['SUPABASE_URL'] || '',
    SUPABASE_SERVICE_ROLE_KEY: process.env['SUPABASE_SERVICE_ROLE_KEY'] || '',
    SUPABASE_ANON_KEY: process.env['SUPABASE_ANON_KEY'] || '',
  };

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    MigrationLogger.error('Missing required environment variables');
    process.exit(1);
  }

  const supabase = SupabaseClient.getServiceClient(env);

  try {
    // Create migrations table (if it doesn't exist)
    await createMigrationsTable(supabase);

    // Get executed migrations
    const {data: runMigrations} = await supabase
      .from('migrations')
      .select('name')
      .order('executed_at', {ascending: true});

    const runMigrationNames = new Set(runMigrations?.map((m: MigrationRecord) => m.name) || []);

    // Get migration files
    const migrationsDir = path.join(__dirname, '../database/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const migrationFile of migrationFiles) {
      if (!runMigrationNames.has(migrationFile)) {
        MigrationLogger.info(`Running migration: ${migrationFile}`);

        // Read SQL file
        const sqlPath = path.join(migrationsDir, migrationFile);
        const sql = fs.readFileSync(sqlPath, 'utf-8');

        // Execute SQL - using rpc method to execute raw SQL
        const {error} = await (
          supabase as unknown as SupabaseMigrationClient
        ).rpc('exec_sql', {sql});

        if (error) {
          MigrationLogger.error(`Migration ${migrationFile} failed`, error);
          throw error;
        }

        // Record migration
        await (supabase as unknown as SupabaseMigrationClient).from('migrations').insert({
          name: migrationFile,
          executed_at: new Date().toISOString(),
        });

        MigrationLogger.info(`Migration ${migrationFile} completed successfully`);
      }
    }

    MigrationLogger.info('All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    MigrationLogger.error('Migration failed', error);
    process.exit(1);
  }
}

/**
 * Create migrations table
 */
async function createMigrationsTable(
  supabase: ReturnType<typeof SupabaseClient.getServiceClient>,
): Promise<void> {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS migrations (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_migrations_name ON migrations(name);
  `;

  await (supabase as unknown as SupabaseMigrationClient).rpc('exec_sql', {sql: createTableSQL});
}

// Run migrations
if (require.main === module) {
  runMigrations();
}

export {runMigrations};
