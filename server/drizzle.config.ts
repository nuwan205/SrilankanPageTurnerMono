import 'dotenv/config'; // Make sure your .env variables are loaded for Drizzle Kit CLI
import { defineConfig } from 'drizzle-kit';

 const config = {
    DATABASE_URL: "postgresql://neondb_owner:npg_ZEnATlmUg1R6@ep-ancient-voice-a1z1uyd8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  };

export default defineConfig({
  schema: './src/db/schema/index.ts', 
  out: './migrations',              
  dialect: 'postgresql',             
  dbCredentials: {
    url: config.DATABASE_URL,  
  }
});