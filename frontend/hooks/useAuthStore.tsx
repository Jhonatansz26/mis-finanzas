import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../api/apiConfig";
import { storage, secureStorage } from "../utils/storage";

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string | null;
    email: string | null;
    role: string | null;
    nombres: string | null;
    apellidos: string | null;
    telefono: string | null;
    documento: string | null;
    fecha_nacimiento: string | null;
  } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: any) => void;
  updateUser: (userData: any) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,

      login: async (email: string, password: string) => {
        const requestUrl = `${api.defaults.baseURL}/auth/login`;

        try {
          const response = await api.post("/auth/login", { email, password });
          const { access_token, user } = response.data;

          await storage.setItemAsync("auth-token", access_token);

          set({
            isAuthenticated: true,
            user: user,
          });
        } catch (error: any) {
          const enhancedError = {
            ...error,
            message: `Error en login - URL: ${requestUrl} - ${
              error.message || "Error desconocido"
            }`,
            requestUrl: requestUrl,
            originalError: error,
          };

          console.error("Error de login:", {
            url: requestUrl,
            error: error.response?.data || error.message,
            status: error.response?.status,
          });

          throw enhancedError;
        }
      },

      logout: async () => {
        try {
          await storage.deleteItemAsync("auth-token");

          set({
            isAuthenticated: false,
            user: null,
          });
        } catch (error) {
          console.error("Error en el proceso de logout:", error);
        }
      },

      setUser: (user) => {
        set({ user });
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        
        if (!currentUser) {
          console.warn("No hay usuario actual para actualizar");
          return;
        }

        // Actualizar el usuario con los nuevos datos
        const updatedUser = {
          ...currentUser,
          ...userData,
        };

        console.log("✅ Usuario actualizado en el store:", updatedUser);

        set({ user: updatedUser });
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);