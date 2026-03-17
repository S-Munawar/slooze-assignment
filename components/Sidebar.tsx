"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

import type { SessionUser } from "@/types";
import { useCartStore } from "@/store/cart";
import RoleBadge from "@/components/RoleBadge";

interface SidebarProps {
  user: SessionUser;
}

function CartCount() {
  const count = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  return (
    <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">{count}</span>
  );
}

export default function Sidebar({ user }: SidebarProps) {
  const links = [
    { href: "/dashboard/restaurants", label: "Restaurants", visible: true },
    { href: "/dashboard/orders", label: "My Orders", visible: true },
    { href: "/dashboard/cart", label: "Cart", visible: user.role !== "MEMBER" },
  ].filter((link) => link.visible);

  return (
    <aside className="w-full border-b border-[var(--border)] bg-white/80 p-5 backdrop-blur md:min-h-screen md:w-72 md:border-r md:border-b-0">
      <div className="space-y-1">
        <p className="text-sm uppercase tracking-[0.2em] text-brand-700">Slooze</p>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">Welcome, {user.name}</h2>
        <RoleBadge role={user.role} country={user.country} />
      </div>
      <nav className="mt-8 space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between rounded-lg border border-transparent px-3 py-2 font-medium transition hover:border-brand-300 hover:bg-brand-50"
          >
            <span>{link.label}</span>
            {link.label === "Cart" ? <CartCount /> : null}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="mt-8 w-full rounded-lg border border-slate-300 px-3 py-2 text-left font-medium text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
      >
        Logout
      </button>
    </aside>
  );
}
