import type { Country, OrderStatus, PaymentMethod, Role } from "@prisma/client";

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface CreateOrderItemInput {
  menuItemId: string;
  quantity: number;
}

export interface CreateOrderInput {
  restaurantId: string;
  items: CreateOrderItemInput[];
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  country: Country | null;
}

export interface OrderViewItem {
  id: string;
  quantity: number;
  price: number;
  menuItem: {
    id: string;
    name: string;
    category: string;
  };
}

export interface OrderView {
  id: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  createdAt: string;
  restaurant: {
    id: string;
    name: string;
    country: Country;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: OrderViewItem[];
}
