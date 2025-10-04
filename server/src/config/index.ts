
type Config = {
  DATABASE_URL: string
  JWT_SECRET: string
  API_KEY: string
  NODE_ENV: 'development' | 'production'
  APP_PORT?: string
  BASE_URL: string
  SESSION_EXPIRY: number
  CLOUDFLARE_TOKEN: string
  CLOUDFLARE_ACCOUNT_ID: string
  BUCKET_NAME: string
  PUBLIC_BUCKET_URL: string
}

let config: Config

export const setConfig = (env: Env) => {
  config = {
    DATABASE_URL: env.DATABASE_URL,
    JWT_SECRET: env.JWT_SECRET,
    API_KEY: env.API_KEY,
    NODE_ENV: env.NODE_ENV,
    APP_PORT: env.APP_PORT,
    BASE_URL: env.BASE_URL,
    SESSION_EXPIRY: env.SESSION_EXPIRY,
    CLOUDFLARE_TOKEN: env.CLOUDFLARE_TOKEN,
    CLOUDFLARE_ACCOUNT_ID: env.CLOUDFLARE_ACCOUNT_ID,
    BUCKET_NAME: env.BUCKET_NAME,
    PUBLIC_BUCKET_URL: env.PUBLIC_BUCKET_URL,
  }
}

export const getConfig = () => {
  if (!config) {
    throw new Error('Config not initialized! Call setConfig(env) first.')
  }
  return config
}

type Env = {
  DATABASE_URL: string
  JWT_SECRET: string
  API_KEY: string
  NODE_ENV: 'development' | 'production'
  APP_PORT?: string
  BASE_URL: string
  SESSION_EXPIRY: number
  CLOUDFLARE_TOKEN: string
  CLOUDFLARE_ACCOUNT_ID: string
  BUCKET_NAME: string
  PUBLIC_BUCKET_URL: string
}
