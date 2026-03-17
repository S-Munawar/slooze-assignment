import { PaymentMethod } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getCountryScope, requireRole } from "@/lib/rbac";

const paymentSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod),
});

interface Params {
  params: {
    id: string;
  };
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const user = await requireRole(req, "ADMIN");
    const countryFilter = await getCountryScope(user);
    void countryFilter;

    const payload = await req.json();
    const parsed = paymentSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid request payload" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: params.id } });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: { paymentMethod: parsed.data.paymentMethod },
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

    return NextResponse.json({ success: false, error: "Failed to update payment" }, { status: 500 });
  }
}
