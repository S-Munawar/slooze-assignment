import Link from "next/link";

interface RestaurantCardProps {
  id: string;
  name: string;
  cuisine: string;
  country: string;
}

export default function RestaurantCard({ id, name, cuisine, country }: RestaurantCardProps) {
  return (
    <article className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">{country}</p>
      <h3 className="mt-2 font-[family-name:var(--font-playfair)] text-2xl font-semibold">{name}</h3>
      <p className="mt-2 text-sm text-slate-700">{cuisine}</p>
      <Link
        href={`/dashboard/restaurants/${id}`}
        className="mt-4 inline-flex rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        View Menu
      </Link>
    </article>
  );
}
