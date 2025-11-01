import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      // Check if user exists and is whitelisted
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!dbUser) {
        // Create user but not whitelisted by default
        await prisma.user.create({
          data: {
            email: user.email,
            fullName: user.name || "Unknown User",
            whitelisted: false,
          },
        });

        return "/unauthorized"; // Redirect to unauthorized page
      }

      if (!dbUser.whitelisted) {
        return "/unauthorized";
      }

      // Update last login
      await prisma.user.update({
        where: { email: user.email },
        data: { lastLogin: new Date() },
      });

      return true;
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email! },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.role;
          session.user.whitelisted = dbUser.whitelisted;
        }
      }

      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
};
