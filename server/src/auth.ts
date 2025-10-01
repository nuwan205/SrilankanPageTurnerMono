import { config } from "./config";
import { db } from "./config/drizzle"; 
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export function createAuthInstance(): any {
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    emailAndPassword: {
      enabled: true,
    },
    baseURL: config.BASE_URL,
    trustedOrigins: [
      "http://127.0.0.1:5173", // Vite frontend
      "http://127.0.0.1:3000",
      "http://localhost:5173",
      "http://localhost:3000"
    ],
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60 * 24 * 7, // 7 days (same as session)
      },
    },
    cookies: {
      sessionToken: {
        name: "better-auth.session-token",
        attributes: {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
        },
      },
    },
    advanced: {
      crossSubDomainCookies: {
        enabled: false, // Disable for localhost development
      },
      defaultCookieAttributes: {
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        path: "/",
      },
    }
  });
}

export const auth = createAuthInstance();
