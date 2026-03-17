interface MenuItemCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  onAdd: (menuItemId: string) => void;
}

export default function MenuItemCard({ id, name, description, price, category, onAdd }: MenuItemCardProps) {
  return (
    <article className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="mt-1 text-sm text-slate-700">{description}</p>
        </div>
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase text-brand-800">{category}</span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-base font-semibold">${price.toFixed(2)}</p>
        <button
          onClick={() => onAdd(id)}
          className="rounded-md border border-brand-300 px-3 py-1.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          type="button"
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}
