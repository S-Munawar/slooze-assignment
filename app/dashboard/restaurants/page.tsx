"use client";

import { useQuery } from "@tanstack/react-query";

import RestaurantCard from "@/components/RestaurantCard";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  country: string;
}

export default function RestaurantsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["restaurants"],
    queryFn: () => api.restaurants.list() as Promise<ApiResponse<Restaurant[]>>,
  });

  if (isLoading) {
    return <p>Loading restaurants...</p>;
  }

  if (isError || !data || !data.success) {
    return <p className="text-red-700">Unable to load restaurants.</p>;
  }

  return (
    <section>
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold">Restaurants</h1>
      <p className="mt-1 text-slate-700">Discover places available for your access scope.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data.data.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            id={restaurant.id}
            name={restaurant.name}
            cuisine={restaurant.cuisine}
            country={restaurant.country}
          />
        ))}
      </div>
    </section>
  );
}
