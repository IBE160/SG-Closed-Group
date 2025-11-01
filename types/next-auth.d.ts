import { UserRole } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: UserRole;
      whitelisted: boolean;
    };
  }

  interface User {
    id: string;
    role: UserRole;
    whitelisted: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    whitelisted: boolean;
  }
}
