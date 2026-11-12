
import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Add the `id` field to the session
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string | null; // Add the `role` field
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string; // Add `id` to the JWT token
    role?: string; // Add `role` to the JWT token
  }
}
