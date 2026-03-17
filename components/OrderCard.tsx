import type { PaymentMethod } from "@prisma/client";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  menuItem: {
    name: string;
  };
}

interface OrderCardProps {
  id: string;
  restaurant: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  canCancel: boolean;
  canUpdatePayment: boolean;
  onCancel: (orderId: string) => void;
  onUpdatePayment: (orderId: string, paymentMethod: PaymentMethod) => void;
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function OrderCard({
  id,
  restaurant,
  status,
  totalAmount,
  createdAt,
  paymentMethod,
  items,
  canCancel,
  canUpdatePayment,
  onCancel,
  onUpdatePayment,
}: OrderCardProps) {
  return (
    <article className="rounded-xl border border-[var(--border)] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">{restaurant}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status] ?? "bg-slate-100 text-slate-800"}`}>
          {status}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-600">Order #{id.slice(0, 8)} • {new Date(createdAt).toLocaleString()}</p>
      <ul className="mt-3 space-y-1 text-sm">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between">
            <span>
              {item.menuItem.name} x {item.quantity}
            </span>
            <span>${(item.quantity * item.price).toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold">Total: ${totalAmount.toFixed(2)}</p>
        <p className="text-xs text-slate-600">Payment: {paymentMethod}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {canCancel ? (
          <button
            onClick={() => onCancel(id)}
            className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
            type="button"
          >
            Cancel Order
          </button>
        ) : null}
        {canUpdatePayment ? (
          <select
            value={paymentMethod}
            onChange={(event) => onUpdatePayment(id, event.target.value as PaymentMethod)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="CARD">CARD</option>
            <option value="UPI">UPI</option>
            <option value="WALLET">WALLET</option>
          </select>
        ) : null}
      </div>
    </article>
  );
}
