import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      setIsAuthenticated: (status) => set({ isAuthenticated: status }),
      setUser: (userData) => set({ user: userData }),
      logout: () => {
        set({ isAuthenticated: false, user: null });
        // Optional: clear localStorage manually if needed
        localStorage.removeItem("user-storage");
      },
    }),
    {
      name: "user-storage", // nama untuk key di localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useUserStore;
