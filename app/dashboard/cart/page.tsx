"use client";

import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { useCartStore } from "@/store/cart";
import type { ApiResponse } from "@/types";

interface CreatedOrder {
  id: string;
}

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);

  const items = useCartStore((state) => state.items);
  const restaurantId = useCartStore((state) => state.restaurantId);
  const total = useCartStore((state) => state.total());
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    if (session?.user.role === "MEMBER") {
      router.replace("/dashboard/restaurants");
    }
  }, [router, session?.user.role]);

  const placeOrder = useMutation({
    mutationFn: async () => {
      if (!restaurantId || !items.length) {
        throw new Error("Cart is empty");
      }

      const createResponse = (await api.orders.create({
        restaurantId,
        items: items.map((item) => ({ menuItemId: item.menuItemId, quantity: item.quantity })),
      })) as ApiResponse<CreatedOrder>;

      if (!createResponse.success) {
        throw new Error(createResponse.error);
      }

      const checkoutResponse = (await api.orders.checkout(createResponse.data.id)) as ApiResponse<CreatedOrder>;
      if (!checkoutResponse.success) {
        throw new Error(checkoutResponse.error);
      }

      return checkoutResponse;
    },
    onSuccess: () => {
      clearCart();
      router.push("/dashboard/orders");
    },
    onError: (mutationError) => {
      if (mutationError instanceof Error) {
        setError(mutationError.message);
        return;
      }

      setError("Failed to place order");
    },
  });

  if (session?.user.role === "MEMBER") {
    return null;
  }

  return (
    <section>
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold">Cart</h1>
      {!items.length ? <p className="mt-4 text-slate-700">Your cart is empty.</p> : null}
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.menuItemId} className="rounded-xl border border-[var(--border)] bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-slate-600">${item.price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                  className="rounded border px-2"
                  type="button"
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                  className="rounded border px-2"
                  type="button"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-brand-300 bg-brand-50 p-4">
        <p className="text-lg font-semibold">Total: ${total.toFixed(2)}</p>
        <button
          onClick={() => placeOrder.mutate()}
          disabled={!items.length || placeOrder.isPending}
          className="mt-3 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
        >
          {placeOrder.isPending ? "Placing Order..." : "Place Order"}
        </button>
        {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
      </div>
    </section>
  );
}
