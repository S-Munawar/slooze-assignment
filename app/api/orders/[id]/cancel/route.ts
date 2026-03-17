import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCountryScope, requireRole } from "@/lib/rbac";

interface Params {
  params: {
    id: string;
  };
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const user = await requireRole(req, "ADMIN", "MANAGER");
    const countryFilter = await getCountryScope(user);

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { restaurant: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    if (countryFilter && order.restaurant.country !== countryFilter) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (order.status !== "PENDING" && order.status !== "CONFIRMED") {
      return NextResponse.json(
        { success: false, error: "Order can only be cancelled from PENDING or CONFIRMED" },
        { status: 400 },
      );
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: { status: "CANCELLED" },
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

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json({ success: false, error: "Failed to cancel order" }, { status: 500 });
  }
}
