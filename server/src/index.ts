import { Hono } from "hono";
import { cors } from "hono/cors";
import type { ApiResponse } from "shared/dist";
import { getAuth } from "./auth";
import { setConfig } from './config'
import type { Bindings } from './types'

const app = new Hono<{
  Variables: {
    user: {
      id: string;
      name: string;
      email: string;
      createdAt: Date | null;
    } | null;
    session: {
      id: string;
      [key: string]: any;
    } | null;
  };
  Bindings: Bindings;
}>();

// Middleware to set config from env
app.use('*', async (c, next) => {
  setConfig(c.env);
  await next();
});

// CORS configuration - must be before auth routes
app.use(
  "/api/auth/*",
  cors({
    origin: ["http://192.168.8.137:8081", "http://127.0.0.1:5173", "http://localhost:5173"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

// General CORS for other routes
app.use(
  "*",
  cors({
    origin: ["https://sri-lankan-page-tuner.sri-lankan-page-tuner.workers.dev", "http://127.0.0.1:5173", "http://localhost:5173"],
    credentials: true,
  })
);

// Auth middleware - create auth instance from c.env
app.use("*", async (c, next) => {
  try {
    const auth = getAuth(c.env); // Pass c.env to get auth instance
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
      c.set("user", null);
      c.set("session", null);
      return next();
    }

    c.set("user", session.user);
    c.set("session", session.session);
  } catch (error) {
    console.error("Auth middleware error:", error);
    c.set("user", null);
    c.set("session", null);
  }
  
  return next();
});

// Mount Better Auth handler - create auth instance from c.env
app.all("/api/auth/*", async (c) => {
  try {
    const auth = getAuth(c.env); // Pass c.env to get auth instance
    const response = await auth.handler(c.req.raw);
    return response;
  } catch (error) {
    console.error("Auth handler error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});

// Protected session endpoint
app.get("/api/session", (c) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!user) return c.body(null, 401);

  return c.json({
    session,
    user,
  });
});

// Mount API routes
import { apiRoutes } from "./routes";
app.route("/api", apiRoutes);

// Existing routes
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/hello", async (c) => {
  const data: ApiResponse = {
    message: "Hello Sri Lankan Page Turner! Server is running successfully.",
    success: true,
  };

  return c.json(data, { status: 200 });
});

// For Cloudflare Workers deployment
export default app;
