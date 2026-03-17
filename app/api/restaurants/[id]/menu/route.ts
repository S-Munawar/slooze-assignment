import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCountryScope, requireRole } from "@/lib/rbac";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: Request, { params }: Params) {
  try {
    const user = await requireRole(req, "ADMIN", "MANAGER", "MEMBER");
    const countryFilter = await getCountryScope(user);

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
      include: {
        items: {
          orderBy: { name: "asc" },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json({ success: false, error: "Restaurant not found" }, { status: 404 });
    }

    if (countryFilter && restaurant.country !== countryFilter) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: restaurant.items });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json({ success: false, error: "Failed to fetch menu" }, { status: 500 });
  }
}
