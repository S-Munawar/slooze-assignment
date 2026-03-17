import type { Country, Role } from "@prisma/client";
import type { Session } from "next-auth";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export async function requireRole(req: Request, ...roles: Role[]): Promise<Session["user"]> {
  void req;
  const session = await auth();

  if (!session?.user) {
    throw NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!roles.includes(session.user.role)) {
    throw NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  return session.user;
}

export async function getCountryScope(user: Session["user"]): Promise<Country | undefined> {
  if (user.role === "ADMIN") {
    return undefined;
  }

  return user.country ?? undefined;
}
