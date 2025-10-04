import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema'; // Import your schemas
import { getConfig } from '../config'; // Import your application configuration


async function runMigrations() {

  const config = {
    DATABASE_URL: "postgresql://neondb_owner:npg_ZEnATlmUg1R6@ep-ancient-voice-a1z1uyd8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  };

  if (!config.DATABASE_URL) {
    console.error('DATABASE_URL is not set in environment variables. Please check your .env file.');
    process.exit(1);
  }

  // Establish a new Drizzle instance specifically for migrations
  // It's good practice to ensure this is separate from your main app's 'db' instance
  // if you might have different configurations or connection pooling for migrations.
  const sql = neon(config.DATABASE_URL);
  const dbForMigrations = drizzle(sql, { schema });

  try {
    console.log('🚀 Running database migrations...');

    // The `migrate` function takes your Drizzle instance and the migrations folder path.
    await migrate(dbForMigrations, { migrationsFolder: './migrations' });

    console.log('✅ Migrations completed successfully!');
    process.exit(0); // Exit successfully
  } catch (error) {
    console.error('❌ Error during migrations:', error);
    process.exit(1); // Exit with an error code
  }
}

// Execute the migration function
runMigrations();