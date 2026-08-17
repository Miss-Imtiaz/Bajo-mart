import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const failedAttempts = new Map<string, { count: number; firstAttempt: number; lockedUntil?: number }>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toLowerCase();
        const record = failedAttempts.get(email);
        const now = Date.now();

        if (record?.lockedUntil && record.lockedUntil > now) {
          throw new Error("Too many failed attempts. Please wait about 15 minutes and try again.");
        }

        const user = await prisma.user.findUnique({ where: { email } });

        const validPassword = user
          ? await bcrypt.compare(credentials.password, user.passwordHash)
          : await bcrypt.compare(credentials.password, "$2a$10$invalidsaltinvalidsaltinvalidsalt");

        if (!user || !validPassword) {
          const withinWindow = record && now - record.firstAttempt < WINDOW_MS;
          const newCount = withinWindow ? record!.count + 1 : 1;

          failedAttempts.set(email, {
            count: newCount,
            firstAttempt: withinWindow ? record!.firstAttempt : now,
            lockedUntil: newCount >= MAX_ATTEMPTS ? now + LOCKOUT_MS : undefined,
          });

          throw new Error("Email or password is incorrect.");
        }

        failedAttempts.delete(email);

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = (user as any).id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).id = token.id;
      return session;
    },
  },
};
