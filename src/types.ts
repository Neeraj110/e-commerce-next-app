interface Address {
  _id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  addresses: Address[];
}

interface ProductImage {
  url: string;
  public_id: string;
}

interface ProductData {
  _id: string;
  title: string;
  description: string;
  price: number;
  categories: string[];
  images: ProductImage[];
  stock: number;
}

interface CartItem {
  _id: string;
  product: ProductData;
  quantity: number;
}

interface CartData {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

interface PaymentMethodOption {
  id: string;
  name: string;
  icon: ComponentType<{ className?: string }>;
}

export type {
  Address,
  UserData,
  ProductImage,
  ProductData,
  CartItem,
  CartData,
  PaymentMethodOption,
};
import type { ComponentType } from "react";
