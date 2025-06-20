import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authManager } from '../utils/authManager';

const useCartStore = create(
  persist(
    (set) => ({
      items: [],
      loading: false,
      error: null,
      
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
        addItem: (item) => {
        const user = authManager.getUser();
        const userEmail = user?.email;
        const uid = user?.uid;
        
        if (!userEmail && !uid) {
          throw new Error('Debes iniciar sesión para añadir productos al carrito');
        }

        // Verificar si el usuario actual es el vendedor
        if (item.usuario_email === userEmail) {
          throw new Error('No puedes comprar tus propios productos');
        }

        set((state) => {
          // Verificar si el item ya existe en el carrito
          const existingItem = state.items.find(i => i.id === item.id);
          if (existingItem) {
            // Si ya existe, lanzar error
            throw new Error('Este producto ya está en tu carrito');
          }
          // Si no existe, añadir nuevo item
          return {
            items: [...state.items, { ...item, quantity: 1 }]
          };
        });
      },
      
      removeItem: (itemId) => set((state) => ({
        items: state.items.filter(item => item.id !== itemId)
      })),
      
      updateQuantity: (itemId, quantity) => set((state) => ({
        items: state.items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      })),
        clearCart: () => set({ items: [] }),

      // Función para verificar si un producto ya está en el carrito
      isInCart: (productId) => {
        const state = useCartStore.getState();
        return state.items.some(item => item.id === productId);
      },

      // Función para limpiar el carrito cuando el usuario cierra sesión
      clearCartOnLogout: () => {
        localStorage.removeItem('cart-storage');
        set({ items: [] });
      }
    }),
    {
      name: 'cart-storage',
      getStorage: () => localStorage
    }
  )
);

export default useCartStore;