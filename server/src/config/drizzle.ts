import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '../db/schema';
import { config } from './index'; 

const pool = new Pool({ connectionString: config.databaseUrl });
export const db = drizzle(pool, { schema });