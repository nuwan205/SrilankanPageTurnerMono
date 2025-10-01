import type { Context, Next } from "hono";
import type { BlankEnv } from "hono/types";

interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date | null;
}

interface AuthMiddlewareContext extends Context<BlankEnv> {
  set: (key: string, value: any) => void;
  get: (key: string) => any;
}

/**
 * Middleware to validate user authentication for admin routes
 * Requires the user to be authenticated via Better Auth session
 */
export const requireAuth = async (c: AuthMiddlewareContext, next: Next) => {
  const user = c.get("user") as AuthenticatedUser | null;
  const session = c.get("session");

  if (!user || !session) {
    return c.json(
      {
        success: false,
        error: "Authentication required",
        message: "You must be logged in to access this resource",
      },
      401
    );
  }

  // User is authenticated, proceed to the next middleware/handler
  await next();
};

/**
 * Middleware to validate admin privileges (can be extended later)
 * Currently just checks if user is authenticated
 */
export const requireAdmin = async (c: AuthMiddlewareContext, next: Next) => {
  const user = c.get("user") as AuthenticatedUser | null;
  
  if (!user) {
    return c.json(
      {
        success: false,
        error: "Admin access required",
        message: "You must have admin privileges to access this resource",
      },
      403
    );
  }

  // TODO: Add role-based access control here if needed
  // For now, any authenticated user is considered admin
  
  await next();
};
