import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_SERVER_URL || "",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [],
});

export const { useSession, signIn, signOut } = authClient;
