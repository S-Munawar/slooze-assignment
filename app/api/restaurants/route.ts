import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCountryScope, requireRole } from "@/lib/rbac";

export async function GET(req: Request) {
  try {
    const user = await requireRole(req, "ADMIN", "MANAGER", "MEMBER");
    const countryFilter = await getCountryScope(user);

    const restaurants = await prisma.restaurant.findMany({
      where: countryFilter ? { country: countryFilter } : undefined,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: restaurants });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json({ success: false, error: "Failed to fetch restaurants" }, { status: 500 });
  }
}
