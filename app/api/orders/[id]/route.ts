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

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        restaurant: true,
        user: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: {
            menuItem: {
              select: { id: true, name: true, category: true },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    if (countryFilter && order.restaurant.country !== countryFilter) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (user.role !== "ADMIN" && order.userId !== user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json({ success: false, error: "Failed to fetch order" }, { status: 500 });
  }
}
