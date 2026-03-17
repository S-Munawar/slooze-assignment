import { Country, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user) {
          return null;
        }

        const passwordMatched = await bcrypt.compare(parsed.data.password, user.password);
        if (!passwordMatched) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          country: user.country,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as Role;
        token.country = (user.country as Country | null) ?? null;
      }

      return token;
    },
    async session({ session, token }) {
      const sessionToken = token as typeof token & {
        id: string;
        role: Role;
        country: Country | null;
      };

      if (session.user) {
        session.user.id = sessionToken.id;
        session.user.name = sessionToken.name ?? session.user.name ?? "";
        session.user.email = sessionToken.email ?? session.user.email ?? "";
        session.user.role = sessionToken.role;
        session.user.country = sessionToken.country;
      }

      return session;
    },
    authorized({ auth: authSession, request }) {
      const isAuthenticated = Boolean(authSession?.user);
      const { pathname } = request.nextUrl;

      if (pathname.startsWith("/api/auth")) {
        return true;
      }

      if (!isAuthenticated && pathname.startsWith("/api/")) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      if (!isAuthenticated && pathname.startsWith("/dashboard")) {
        return Response.redirect(new URL("/login", request.nextUrl));
      }

      return true;
    },
  },
});
