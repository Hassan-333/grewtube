import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

// The admin account is configured through ADMIN_EMAIL / ADMIN_PASSWORD in .env.
// It is not stored in MongoDB, so it gets a fixed, non-ObjectId id.
const ADMIN_ID = "admin";

// Google sign-in is optional. It is only enabled when both keys are set.
export const googleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (
          adminEmail &&
          adminPassword &&
          credentials.email === adminEmail &&
          credentials.password === adminPassword
        ) {
          return { id: ADMIN_ID, email: adminEmail, role: "admin" };
        }

        await connect();
        const user = await User.findOne({ email: credentials.email });
        // Google-only accounts have no password, so they cannot log in here.
        if (!user?.password || !(await bcrypt.compare(credentials.password, user.password))) {
          throw new Error("Invalid email or password.");
        }

        return { id: user._id.toString(), email: user.email, role: user.role };
      },
    }),
    ...(googleEnabled
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
          }),
        ]
      : []),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
  },
  callbacks: {
    // Make sure every Google user has a MongoDB record, otherwise saving
    // videos, the vote chart and account settings all fail with "User not found".
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
      if (!user.email) return false;

      await connect();
      const existing = await User.findOne({ email: user.email });
      if (!existing) {
        await User.create({
          username: user.name || user.email.split("@")[0],
          email: user.email,
          provider: "google",
        });
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google") {
          // user.id is Google's id here; swap it for the MongoDB id.
          await connect();
          const dbUser = await User.findOne({ email: user.email });
          token.id = dbUser ? dbUser._id.toString() : user.id;
          token.role = dbUser?.role ?? "user";
        } else {
          token.id = user.id;
          token.role = (user as { role?: string }).role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        email: token.email as string,
        role: token.role as string,
      };
      return session;
    },
    async redirect({ baseUrl }) {
      return baseUrl + "/dashboard";
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
