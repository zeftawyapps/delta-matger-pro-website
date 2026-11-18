"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "@/types";
import { getCartLineKey } from "@/utils/productPriceOptions";

interface CartState {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (cartLineKey: string) => void;
  updateCartQuantity: (cartLineKey: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      setCart: (cart) => set({ cart }),

      addToCart: (product, quantity = 1) => {
        const currentCart = get().cart;
        const lineKey = getCartLineKey(product);
        const existingIndex = currentCart.findIndex(
          (item) => getCartLineKey(item.product) === lineKey
        );

        if (existingIndex > -1) {
          const updatedCart = [...currentCart];
          updatedCart[existingIndex] = {
            ...updatedCart[existingIndex],
            quantity: updatedCart[existingIndex].quantity + quantity,
          };
          set({ cart: updatedCart });
        } else {
          set({ cart: [...currentCart, { product, quantity }] });
        }
      },

      removeFromCart: (cartLineKey) => {
        set({
          cart: get().cart.filter(
            (item) => getCartLineKey(item.product) !== cartLineKey
          ),
        });
      },

      updateCartQuantity: (cartLineKey, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(cartLineKey);
          return;
        }
        set({
          cart: get().cart.map((item) =>
            getCartLineKey(item.product) === cartLineKey
              ? { ...item, quantity }
              : item
          ),
        });
      },

      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "domancy_cart_store",
      onRehydrateStorage: () => (state) => {
        // Migrate legacy "domancy_cart" array if store is empty on first load
        if (typeof window !== "undefined" && state && state.cart.length === 0) {
          const legacyRaw = localStorage.getItem("domancy_cart");
          if (legacyRaw) {
            try {
              const parsed = JSON.parse(legacyRaw);
              if (Array.isArray(parsed) && parsed.length > 0) {
                state.setCart(parsed);
              }
            } catch {
              // ignore corrupt legacy data
            }
          }
        }
      },
    }
  )
);

