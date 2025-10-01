import 'dotenv/config'; // Make sure your .env variables are loaded for Drizzle Kit CLI
import { defineConfig } from 'drizzle-kit';
import { config } from "./src/config";

export default defineConfig({
  schema: './src/db/schema/index.ts', 
  out: './migrations',              
  dialect: 'postgresql',             
  dbCredentials: {
    url: config.databaseUrl,  
  }
});