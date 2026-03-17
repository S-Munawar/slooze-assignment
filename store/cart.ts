import { create } from "zustand";

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  restaurantId: string | null;
  addItem: (restaurantId: string, item: CartItem) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  restaurantId: null,
  addItem: (restaurantId, item) => {
    const { items, restaurantId: activeRestaurantId } = get();

    if (activeRestaurantId && activeRestaurantId !== restaurantId) {
      set({ restaurantId, items: [{ ...item, quantity: Math.max(1, item.quantity) }] });
      return;
    }

    const existing = items.find((cartItem) => cartItem.menuItemId === item.menuItemId);

    if (!existing) {
      set({
        restaurantId,
        items: [...items, { ...item, quantity: Math.max(1, item.quantity) }],
      });
      return;
    }

    set({
      restaurantId,
      items: items.map((cartItem) =>
        cartItem.menuItemId === item.menuItemId
          ? { ...cartItem, quantity: cartItem.quantity + Math.max(1, item.quantity) }
          : cartItem,
      ),
    });
  },
  removeItem: (menuItemId) => {
    const items = get().items.filter((item) => item.menuItemId !== menuItemId);
    set({ items, restaurantId: items.length ? get().restaurantId : null });
  },
  updateQuantity: (menuItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(menuItemId);
      return;
    }

    set({
      items: get().items.map((item) =>
        item.menuItemId === menuItemId ? { ...item, quantity } : item,
      ),
    });
  },
  clearCart: () => set({ items: [], restaurantId: null }),
  total: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));

export type { CartItem, CartStore };
