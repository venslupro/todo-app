// scripts/seed.ts
import {SupabaseClient} from '../src/core/supabase/client';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Database seed script
 */
async function runSeed() {
  console.log('Starting database seeding...');

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
    // Read seed data file
    const seedDir = path.join(__dirname, '../database/seed');
    const seedFile = path.join(seedDir, 'initial_data.sql');

    if (!fs.existsSync(seedFile)) {
      console.log('No seed file found, skipping seeding');
      process.exit(0);
    }

    console.log('Running seed script...');

    // Read SQL file
    const sql = fs.readFileSync(seedFile, 'utf-8');

    // Execute SQL - use rpc method to execute raw SQL
    const {error} = await (supabase as any).rpc('exec_sql', {sql});

    if (error) {
      console.error('Seeding failed:', error);
      throw error;
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

// Run seed script
if (require.main === module) {
  runSeed();
}

export {runSeed};
