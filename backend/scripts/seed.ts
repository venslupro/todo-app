// scripts/seed.ts
import { SupabaseDriver } from '../src/drivers/supabase';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Database seed script
 */
async function runSeed() {
  console.log('Starting database seeding...');

  // Get configuration from environment variables
  const env = {
    SUPABASE_URL: process.env['supabase_url'],
    SUPABASE_SERVICE_ROLE_KEY: process.env['supabase_service_role_key'],
    SUPABASE_ANON_KEY: process.env['supabase_anon_key'],
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
    // Read seed data file
    const seedDir = path.join(__dirname, '../src/database/seed');
    const seedFile = path.join(seedDir, 'initial_data.sql');

    if (!fs.existsSync(seedFile)) {
      console.error('Seed file not found:', seedFile);
      process.exit(1);
    }

    const sql = fs.readFileSync(seedFile, 'utf8');

    console.log('Executing seed data...');

    // Execute seed SQL
    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error('Seed execution failed:', error);
      process.exit(1);
    }

    console.log('✓ Database seeded successfully!');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

// Run seed if this script is executed directly
if (require.main === module) {
  runSeed().catch(console.error);
}

export { runSeed };
