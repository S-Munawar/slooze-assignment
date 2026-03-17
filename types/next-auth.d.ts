import type { Country, Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      country: Country | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: Role;
    country: Country | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    country: Country | null;
  }
}
