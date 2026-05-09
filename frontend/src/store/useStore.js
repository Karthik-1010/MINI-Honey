import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Enterprise-grade state management for MINI Honey
 * Handles persistent cart, group orders, and session recovery.
 */
export const useStore = create(
  persist(
    (set, get) => ({
      // --- Cart State ---
      cart: [],
      subtotal: 0,
      total: 0,

      // --- Group Order State ---
      members: [], // [{ name, items: [{...item, qty}] }]
      activeMemberIndex: null,

      // --- UI State ---
      isHydrated: false,

      // --- Cart Actions ---
      addToCart: (product) => {
        const { cart } = get();
        const existing = cart.find((i) => i.id === product.id);
        let newItems;
        if (existing) {
          newItems = cart.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        } else {
          newItems = [...cart, { ...product, quantity: 1 }];
        }
        set({ cart: newItems });
        get().calculateTotals();
      },

      removeFromCart: (productId) => {
        const { cart } = get();
        const newItems = cart.filter((i) => i.id !== productId);
        set({ cart: newItems });
        get().calculateTotals();
      },

      updateQuantity: (productId, delta) => {
        const { cart } = get();
        const newItems = cart
          .map((i) => {
            if (i.id === productId) {
              const newQty = Math.max(0, i.quantity + delta);
              return { ...i, quantity: newQty };
            }
            return i;
          })
          .filter((i) => i.quantity > 0);
        set({ cart: newItems });
        get().calculateTotals();
      },

      clearCart: () => {
        set({ cart: [], subtotal: 0, total: 0 });
      },

      calculateTotals: () => {
        const { cart } = get();
        const sub = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const tot = sub;
        set({
          subtotal: sub,
          total: tot,
        });
      },

      // --- Group Order Actions ---
      addMember: (name) => {
        const { members } = get();
        if (members.find((m) => m.name.toLowerCase() === name.toLowerCase())) return false;
        const newMembers = [...members, { name, items: [] }];
        set({ 
          members: newMembers,
          activeMemberIndex: newMembers.length - 1 
        });
        return true;
      },

      removeMember: (index) => {
        const { members, activeMemberIndex } = get();
        const newMembers = members.filter((_, i) => i !== index);
        set({
          members: newMembers,
          activeMemberIndex: newMembers.length > 0 ? 0 : null
        });
      },

      setActiveMember: (index) => {
        set({ activeMemberIndex: index });
      },

      addItemToMember: (item) => {
        const { members, activeMemberIndex } = get();
        if (activeMemberIndex === null) return;
        
        const newMembers = members.map((m, i) => {
          if (i !== activeMemberIndex) return m;
          const existing = m.items.find((it) => it.id === item.id);
          const newItems = existing
            ? m.items.map((it) => it.id === item.id ? { ...it, qty: it.qty + 1 } : it)
            : [...m.items, { ...item, qty: 1 }];
          return { ...m, items: newItems };
        });
        set({ members: newMembers });
      },

      removeItemFromMember: (itemId) => {
        const { members, activeMemberIndex } = get();
        if (activeMemberIndex === null) return;

        const newMembers = members.map((m, i) => {
          if (i !== activeMemberIndex) return m;
          const newItems = m.items
            .map((it) => it.id === itemId ? { ...it, qty: it.qty - 1 } : it)
            .filter((it) => it.qty > 0);
          return { ...m, items: newItems };
        });
        set({ members: newMembers });
      },

      clearGroupOrder: () => {
        set({ members: [], activeMemberIndex: null });
      },

      setHasHydrated: (state) => {
        set({ isHydrated: state });
      }
    }),
    {
      name: 'mini-honey-persistence',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (state) => {
        return (state, error) => {
          if (error) {
            console.error('An error occurred during hydration', error);
          } else {
            state.setHasHydrated(true);
          }
        };
      },
    }
  )
);
