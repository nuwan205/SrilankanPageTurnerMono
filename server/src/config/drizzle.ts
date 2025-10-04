import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';

// Cache for database instances
const dbCache = new Map<string, ReturnType<typeof drizzle>>();

/**
 * Get database instance with connection string
 * Standard Cloudflare Workers pattern: pass env variables explicitly
 */
export function getDb(databaseUrl: string) {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  // Return cached instance if available
  if (dbCache.has(databaseUrl)) {
    return dbCache.get(databaseUrl)!;
  }

  // Create new HTTP-based connection (works in Cloudflare Workers)
  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema });

  // Cache it
  dbCache.set(databaseUrl, db);

  return db;
}

// Legacy export for backwards compatibility (will be deprecated)
// This tries to use process.env which doesn't work in Workers
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    console.warn('Using legacy db export. Please use getDb(databaseUrl) instead.');
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    const instance = getDb(databaseUrl);
    return instance[prop as keyof typeof instance];
  }
});