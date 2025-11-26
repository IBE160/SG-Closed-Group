import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      // NextAuth v5 convention with fallback to legacy names
      clientId: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      // Skip DB checks during build
      if (process.env.NEXT_PHASE === "phase-production-build") {
        return true;
      }

      if (!user.email) return false;

      try {
        // Check if user exists and is whitelisted
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!dbUser) {
          // Create user but not whitelisted by default
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || "Unknown User",
              whitelisted: false,
            },
          });

          return false; // Deny access for non-whitelisted users
        }

        if (!dbUser.whitelisted) {
          return false;
        }


        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      // Store user info in JWT token
      if (user) {
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      // Skip DB checks during build
      if (process.env.NEXT_PHASE === "phase-production-build") {
        return session;
      }

      if (session.user && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
          });

          if (dbUser) {
            session.user.id = dbUser.id;
            session.user.role = dbUser.role;
            session.user.whitelisted = dbUser.whitelisted;
          }
        } catch (error) {
          console.error("Error in session callback:", error);
        }
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/access-denied",
  },

  session: {
    strategy: "jwt",
    maxAge: 16 * 60 * 60, // 16 hours (12-hour shifts + 4-hour buffer)
    updateAge: 2 * 60 * 60, // Refresh token every 2 hours
  },
});
