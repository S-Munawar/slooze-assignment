"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import CartDrawer from "@/components/CartDrawer";
import MenuItemCard from "@/components/MenuItemCard";
import { api } from "@/lib/api";
import { useCartStore } from "@/store/cart";
import type { ApiResponse } from "@/types";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
}

export default function RestaurantMenuPage() {
  const { id } = useParams<{ id: string }>();
  const addItem = useCartStore((state) => state.addItem);
  const cartRestaurantId = useCartStore((state) => state.restaurantId);
  const clearCart = useCartStore((state) => state.clearCart);

  const restaurantQuery = useQuery({
    queryKey: ["restaurant", id],
    queryFn: () => api.restaurants.get(id) as Promise<ApiResponse<Restaurant>>,
    enabled: Boolean(id),
  });

  const menuQuery = useQuery({
    queryKey: ["menu", id],
    queryFn: () => api.restaurants.menu(id) as Promise<ApiResponse<MenuItem[]>>,
    enabled: Boolean(id),
  });

  if (restaurantQuery.isLoading || menuQuery.isLoading) {
    return <p>Loading menu...</p>;
  }

  if (!restaurantQuery.data?.success || !menuQuery.data?.success) {
    return <p className="text-red-700">Unable to load menu.</p>;
  }

  const restaurant = restaurantQuery.data.data;
  const menu = menuQuery.data.data;

  const handleAdd = (menuItemId: string) => {
    const menuItem = menu.find((item) => item.id === menuItemId);
    if (!menuItem) {
      return;
    }

    if (cartRestaurantId && cartRestaurantId !== restaurant.id) {
      const accepted = window.confirm("This will clear your current cart. Continue?");
      if (!accepted) {
        return;
      }
      clearCart();
    }

    addItem(restaurant.id, {
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: 1,
    });
  };

  return (
    <section>
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold">{restaurant.name}</h1>
      <p className="mt-1 text-slate-700">{restaurant.cuisine}</p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {menu.map((item) => (
          <MenuItemCard
            key={item.id}
            id={item.id}
            name={item.name}
            description={item.description}
            price={item.price}
            category={item.category}
            onAdd={handleAdd}
          />
        ))}
      </div>
      <CartDrawer />
    </section>
  );
}
