import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_SERVER_URL || "http://127.0.0.1:3001",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [],
});

export const { useSession, signIn, signOut } = authClient;
