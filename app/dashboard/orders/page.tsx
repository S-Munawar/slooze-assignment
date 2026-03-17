"use client";

import type { PaymentMethod } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import OrderCard from "@/components/OrderCard";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";

interface Order {
  id: string;
  status: string;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  createdAt: string;
  restaurant: {
    name: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    menuItem: {
      name: string;
    };
  }>;
}

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const canCancel = session?.user.role === "ADMIN" || session?.user.role === "MANAGER";
  const canUpdatePayment = session?.user.role === "ADMIN";

  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => api.orders.list() as Promise<ApiResponse<Order[]>>,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.orders.cancel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });

  const paymentMutation = useMutation({
    mutationFn: ({ id, paymentMethod }: { id: string; paymentMethod: PaymentMethod }) =>
      api.orders.updatePayment(id, paymentMethod),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });

  if (isLoading) {
    return <p>Loading orders...</p>;
  }

  if (!data?.success) {
    return <p className="text-red-700">Unable to load orders.</p>;
  }

  return (
    <section>
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold">Orders</h1>
      <div className="mt-5 space-y-4">
        {data.data.map((order) => (
          <OrderCard
            key={order.id}
            id={order.id}
            restaurant={order.restaurant.name}
            status={order.status}
            totalAmount={order.totalAmount}
            createdAt={order.createdAt}
            paymentMethod={order.paymentMethod}
            items={order.items}
            canCancel={Boolean(canCancel)}
            canUpdatePayment={Boolean(canUpdatePayment)}
            onCancel={(orderId) => cancelMutation.mutate(orderId)}
            onUpdatePayment={(orderId, paymentMethod) =>
              paymentMutation.mutate({ id: orderId, paymentMethod })
            }
          />
        ))}
      </div>
    </section>
  );
}
