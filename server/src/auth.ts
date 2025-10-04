import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from './config/drizzle';
import type { Bindings } from './types';

// Cache for auth instances
const authCache = new Map<string, ReturnType<typeof betterAuth>>();

/**
 * Create or get cached auth instance with environment variables
 */
export function getAuth(env: Bindings) {
  const cacheKey = env.DATABASE_URL;
  
  if (authCache.has(cacheKey)) {
    return authCache.get(cacheKey)!;
  }

  const db = getDb(env.DATABASE_URL);

  const authInstance = betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    emailAndPassword: {
      enabled: true,
    },
    baseURL: env.BASE_URL,
    trustedOrigins: [
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
      "http://localhost:5173",
      "http://localhost:3000",
      "http://192.168.8.137:8081",
      env.BASE_URL,
    ],
    session: {
      expiresIn: env.SESSION_EXPIRY / 1000, // Convert ms to seconds
      updateAge: 60 * 60 * 24, // 1 day
      cookieCache: {
        enabled: true,
        maxAge: env.SESSION_EXPIRY / 1000,
      },
    },
    cookies: {
      sessionToken: {
        name: "better-auth.session-token",
        attributes: {
          httpOnly: true,
          sameSite: "lax",
          secure: env.NODE_ENV === "production",
          path: "/",
        },
      },
    },
    advanced: {
      crossSubDomainCookies: {
        enabled: false,
      },
      defaultCookieAttributes: {
        sameSite: "lax",
        secure: env.NODE_ENV === "production",
        httpOnly: true,
        path: "/",
      },
    }
  });

  authCache.set(cacheKey, authInstance);
  return authInstance;
}
