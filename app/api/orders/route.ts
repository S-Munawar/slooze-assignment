import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getCountryScope, requireRole } from "@/lib/rbac";

const createOrderSchema = z.object({
  restaurantId: z.string().cuid(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().cuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

export async function GET(req: Request) {
  try {
    const user = await requireRole(req, "ADMIN", "MANAGER", "MEMBER");
    const countryFilter = await getCountryScope(user);

    const whereClause = {
      ...(user.role === Role.ADMIN ? {} : { userId: user.id }),
      ...(countryFilter ? { restaurant: { country: countryFilter } } : {}),
    };

    const orders = await prisma.order.findMany({
      where: whereClause,
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireRole(req, "ADMIN", "MANAGER", "MEMBER");
    const countryFilter = await getCountryScope(user);

    const payload = await req.json();
    const parsed = createOrderSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid request payload" }, { status: 400 });
    }

    const { restaurantId, items } = parsed.data;

    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });

    if (!restaurant) {
      return NextResponse.json({ success: false, error: "Restaurant not found" }, { status: 404 });
    }

    if (countryFilter && restaurant.country !== countryFilter) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const menuItemIds = items.map((item) => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        restaurantId,
      },
    });

    if (menuItems.length !== menuItemIds.length) {
      return NextResponse.json({ success: false, error: "One or more menu items are invalid" }, { status: 400 });
    }

    const menuItemMap = new Map(menuItems.map((item) => [item.id, item]));
    const totalAmount = items.reduce((total, current) => {
      const menuItem = menuItemMap.get(current.menuItemId);
      if (!menuItem) {
        return total;
      }
      return total + menuItem.price * current.quantity;
    }, 0);

    const createdOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: user.id,
          restaurantId,
          totalAmount,
        },
      });

      await tx.orderItem.createMany({
        data: items.map((item) => ({
          orderId: order.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: menuItemMap.get(item.menuItemId)?.price ?? 0,
        })),
      });

      return tx.order.findUnique({
        where: { id: order.id },
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
    });

    return NextResponse.json({ success: true, data: createdOrder }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 });
  }
}
