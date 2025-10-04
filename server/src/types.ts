export type Bindings = {
  DATABASE_URL: string
  JWT_SECRET: string
  API_KEY: string

  NODE_ENV: 'development' | 'production'
  APP_PORT?: string
  BASE_URL: string
  SESSION_EXPIRY:  number

  CLOUDFLARE_TOKEN: string
  CLOUDFLARE_ACCOUNT_ID: string
  BUCKET_NAME: string
  PUBLIC_BUCKET_URL: string
}