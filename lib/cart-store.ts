import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product, CartItem } from "./types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (product: Product, quantity = 1) => {
        const { items } = get();
        const existingIndex = items.findIndex(
          (item) => item.product.id === product.id
        );

        if (existingIndex > -1) {
          const updatedItems = [...items];
          const currentQty = updatedItems[existingIndex].quantity;
          const maxStock = product.stock || 999;
          const newQty = Math.min(currentQty + quantity, maxStock);

          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: newQty,
          };
          set({ items: updatedItems, isOpen: true });
        } else {
          const initialQty = Math.min(quantity, product.stock || 999);
          set({
            items: [...items, { product, quantity: initialQty }],
            isOpen: true,
          });
        }
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) => {
            if (item.product.id === productId) {
              const maxStock = item.product.stock || 999;
              return {
                ...item,
                quantity: Math.min(quantity, maxStock),
              };
            }
            return item;
          }),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "harmonistore-cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
