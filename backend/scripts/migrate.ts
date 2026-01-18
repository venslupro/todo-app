// scripts/migrate.ts
import { SupabaseDriver } from '../src/drivers/supabase';
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

  const config = {
    environment: 'development' as any,
    supabaseUrl: env.SUPABASE_URL,
    supabaseAnonKey: env.SUPABASE_ANON_KEY || '',
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    logLevel: 'info' as any,
  };

  const supabaseDriver = new SupabaseDriver(config);
  const supabase = supabaseDriver.getServiceRoleClient();

  try {
    // Create migrations table (if it doesn't exist)
    await createMigrationsTable(supabase);

    // Get executed migrations
    const { data: executedMigrations, error: fetchError } = await supabase
      .from('migrations')
      .select('name')
      .order('executed_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching migrations:', fetchError);
      process.exit(1);
    }

    const executedMigrationNames = new Set(executedMigrations?.map((m) => m.name) || []);

    // Get migration files
    const migrationsDir = path.join(__dirname, '../src/database/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files`);

    // Execute pending migrations
    for (const migrationFile of migrationFiles) {
      if (executedMigrationNames.has(migrationFile)) {
        console.log(`Skipping already executed migration: ${migrationFile}`);
        continue;
      }

      console.log(`Executing migration: ${migrationFile}`);

      const migrationPath = path.join(migrationsDir, migrationFile);
      const sql = fs.readFileSync(migrationPath, 'utf8');

      // Execute SQL migration
      const { error: migrationError } = await supabase.rpc('exec_sql', { sql });

      if (migrationError) {
        console.error(`Migration failed: ${migrationFile}`, migrationError);
        process.exit(1);
      }

      // Record migration execution
      const { error: recordError } = await supabase
        .from('migrations')
        .insert({
          name: migrationFile,
          executed_at: new Date().toISOString(),
        });

      if (recordError) {
        console.error('Error recording migration:', recordError);
        process.exit(1);
      }

      console.log(`✓ Migration completed: ${migrationFile}`);
    }

    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

async function createMigrationsTable(supabase: any) {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });

  if (error && !error.message.includes('already exists')) {
    console.error('Error creating migrations table:', error);
    throw error;
  }
}

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations().catch(console.error);
}

export { runMigrations };
