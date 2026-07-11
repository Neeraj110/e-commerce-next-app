import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { CartItem as SharedCartItem } from "@/types";

type CartItem = SharedCartItem;

interface CartState {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  totalAmount: 0,
  totalItems: 0,
  isLoading: false,
  error: null,
};

// Utility function to calculate totals
const calculateTotals = (
  items: CartItem[]
): { totalItems: number; totalAmount: number } => ({
  totalItems: items.reduce((total, item) => total + item.quantity, 0),
  totalAmount: items.reduce(
    (total, item) => total + item.quantity * item.product.price,
    0
  ),
});

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item.product._id === action.payload.product._id
      );

      if (existingItem) {
        existingItem.quantity = Math.min(
          existingItem.quantity + action.payload.quantity,
          existingItem.product.stock
        );
      } else {
        state.items.push({
          ...action.payload,
          quantity: Math.min(
            action.payload.quantity,
            action.payload.product.stock
          ),
        });
      }

      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalAmount = totals.totalAmount;
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.product._id !== action.payload
      );
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalAmount = totals.totalAmount;
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const item = state.items.find(
        (item) => item.product._id === action.payload.productId
      );
      if (item) {
        item.quantity = Math.max(
          1,
          Math.min(action.payload.quantity, item.product.stock)
        );
        const totals = calculateTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalAmount = totals.totalAmount;
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      state.totalItems = 0;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setLoading,
  setError,
} = cartSlice.actions;
export type { CartItem };
export default cartSlice.reducer;
