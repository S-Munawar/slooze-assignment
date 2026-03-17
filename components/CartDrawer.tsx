"use client";

import Link from "next/link";

import { useCartStore } from "@/store/cart";

export default function CartDrawer() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total());

  if (!items.length) {
    return null;
  }

  return (
    <div className="sticky bottom-4 mt-6 rounded-xl border border-brand-300 bg-white p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{items.length} item(s) in cart</p>
        <p className="text-sm font-semibold">${total.toFixed(2)}</p>
      </div>
      <Link
        href="/dashboard/cart"
        className="mt-3 inline-flex w-full justify-center rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Review Cart
      </Link>
    </div>
  );
}
