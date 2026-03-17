import type { PaymentMethod } from "@prisma/client";

import type { CreateOrderInput } from "@/types";

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  return response.json() as Promise<T>;
}

export const api = {
  restaurants: {
    list: () => request("/api/restaurants"),
    get: (id: string) => request(`/api/restaurants/${id}`),
    menu: (id: string) => request(`/api/restaurants/${id}/menu`),
  },
  orders: {
    list: () => request("/api/orders"),
    create: (body: CreateOrderInput) =>
      request("/api/orders", { method: "POST", body: JSON.stringify(body) }),
    checkout: (id: string) => request(`/api/orders/${id}/checkout`, { method: "POST" }),
    cancel: (id: string) => request(`/api/orders/${id}/cancel`, { method: "PATCH" }),
    updatePayment: (id: string, paymentMethod: PaymentMethod) =>
      request(`/api/orders/${id}/payment`, {
        method: "PATCH",
        body: JSON.stringify({ paymentMethod }),
      }),
  },
};
