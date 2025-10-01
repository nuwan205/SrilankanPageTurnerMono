import "dotenv/config";

interface AppConfig {
  port: number;
  databaseUrl: string;
  NODE_ENV: string;
  BASE_URL: string;
  // Add other global configurations here
}

export const config: AppConfig = {
  port: parseInt(process.env.APP_PORT || "3000", 10),
  databaseUrl: process.env.DATABASE_URL!,

  NODE_ENV: process.env.NODE_ENV || "development",
  BASE_URL: process.env.BASE_URL || "http://192.168.8.137:3000",
};
