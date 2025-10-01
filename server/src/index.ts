import { Hono } from "hono";
import { cors } from "hono/cors";
import type { ApiResponse } from "shared/dist";
// import { auth } from "./auth";
// import { config } from "./config";
// import { apiRouter } from "./routes";

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
}>().basePath("/api");;

// CORS configuration - must be before auth routes
app.use(
  "/api/auth/*",
  cors({
    origin: ["http://192.168.8.137:8081", "http://localhost:5173"], // Vite default port
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
    origin: ["http://192.168.8.137:8081", "http://localhost:5173"],
    credentials: true,
  })
);

// API Routes - Mount all API routes under /api
// app.route("/api", apiRouter);

// Auth middleware
// app.use("*", async (c, next) => {
//   const session = await auth.api.getSession({ headers: c.req.raw.headers });

//   if (!session) {
//     c.set("user", null);
//     c.set("session", null);
//     return next();
//   }

//   c.set("user", session.user);
//   c.set("session", session.session);
//   return next();
// });

// Mount Better Auth handler
// app.on(["POST", "GET"], "/api/auth/*", (c) => {
//   return auth.handler(c.req.raw);
// });

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

// Existing routes
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/hello", async (c) => {
  const data: ApiResponse = {
    message: "Hello EcoBin! Server is running successfully.",
    success: true,
  };

  return c.json(data, { status: 200 });
});

// Start server for development
// if (config.NODE_ENV === "development") {
//   console.log(`Development mode - Bun will serve on default port`);
//   console.log(`Server configuration port: ${config.port}`);
// }

// For Cloudflare Workers deployment
export default app;

// Start HTTP server explicitly for local development
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  import("@hono/node-server").then(({ serve }) => {
    const port = 3000;
    serve({ fetch: app.fetch, port });
    console.log(`HTTP server listening on http://localhost:${port}`);
  });
}
