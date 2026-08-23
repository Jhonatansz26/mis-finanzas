import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../api/apiConfig";
import { useAuthStore } from "../hooks/useAuthStore";
import { secureStorage } from "../utils/storage";

export interface Business {
  created_at: string;
  departamento_id: number;
  departamento_nombre: string;
  direccion: string;
  email: string;
  fecha_creacion: string;
  id: number;
  municipio_id: number;
  municipio_nombre: string;
  nit: string;
  nombre: string;
  propietario: string;
  telefono: string;
}

export interface CreateBusinessDTO {
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  nit: string;
}

interface BusinessState {
  businesses: Business[];
  activeBusiness: Business | null;
  isLoading: boolean;
  error: string | null;

  fetchBusinesses: () => Promise<void>;
  setActiveBusiness: (businessId: number | string) => void;
  addBusiness: (businessData: CreateBusinessDTO) => Promise<void>;
  updateBusiness: (updatedBusinessData: Business) => void;
  deleteBusiness: (businessId: number) => Promise<void>;
  clearBusinesses: () => void;
}

const useBusinessStore = create<BusinessState>()(
  persist(
    (set, get) => ({
      businesses: [],
      activeBusiness: null,
      isLoading: false,
      error: null,

      fetchBusinesses: async () => {
        if (get().isLoading) {
          console.log("⏳ Ya hay una carga en progreso, omitiendo...");
          return;
        }

        try {
          set({ isLoading: true, error: null });
          console.log("🔄 Ejecutando fetchBusinesses...");

          const response = await api.get("/business");
          const businessesData = response.data;

          console.log("✅ Negocios cargados:", businessesData);

          set({
            businesses: businessesData,
            activeBusiness:
              get().activeBusiness ||
              (businessesData.length > 0 ? businessesData[0] : null),
            isLoading: false,
          });
        } catch (error: any) {
          console.error("❌ Error al cargar los negocios:", error);
          set({
            error: error.message || "Error al cargar los negocios",
            isLoading: false,
          });
        }
      },

      setActiveBusiness: (businessId) => {
        const id =
          typeof businessId === "string"
            ? parseInt(businessId, 10)
            : businessId;

        console.log("Setting active business with ID:", id);

        const business = get().businesses.find((b) => b.id === id);
        if (business) {
          console.log("Found business:", business);
          set({ activeBusiness: business });
        } else {
          console.warn(`Negocio con ID ${id} no encontrado`);
        }
      },

      addBusiness: async (businessData) => {
        try {
          set({ isLoading: true, error: null });

          const response = await api.post("/business", businessData);
          const newBusiness = response.data;

          console.log("Created new business:", newBusiness);

          set((state) => ({
            businesses: [...state.businesses, newBusiness],
            activeBusiness:
              state.businesses.length === 0
                ? newBusiness
                : state.activeBusiness,
            isLoading: false,
          }));
        } catch (error: any) {
          console.error("Error al añadir negocio:", error);
          set({
            error: error.message || "Error al crear el negocio",
            isLoading: false,
          });
        }
      },

      updateBusiness: (updatedBusinessData) => {
        const currentActiveBusiness = get().activeBusiness;
        
        if (!currentActiveBusiness) {
          console.warn("No hay negocio activo para actualizar");
          return;
        }

        // Actualizar el negocio en la lista de negocios
        const updatedBusinesses = get().businesses.map((business) =>
          business.id === updatedBusinessData.id 
            ? { ...business, ...updatedBusinessData } 
            : business
        );

        // Si el negocio actualizado es el activo, actualizarlo también
        let newActiveBusiness = currentActiveBusiness;
        if (currentActiveBusiness.id === updatedBusinessData.id) {
          newActiveBusiness = { ...currentActiveBusiness, ...updatedBusinessData };
        }

        console.log("✅ Negocio actualizado en el store:", newActiveBusiness);

        set({
          businesses: updatedBusinesses,
          activeBusiness: newActiveBusiness,
        });
      },

      deleteBusiness: async (businessId) => {
        try {
          set({ isLoading: true, error: null });

          await api.delete(`/business/${businessId}`);

          set((state) => {
            const filteredBusinesses = state.businesses.filter(
              (b) => b.id !== businessId
            );

            let newActiveBusiness = state.activeBusiness;
            if (
              state.activeBusiness &&
              state.activeBusiness.id === businessId
            ) {
              newActiveBusiness =
                filteredBusinesses.length > 0 ? filteredBusinesses[0] : null;
            }

            return {
              businesses: filteredBusinesses,
              activeBusiness: newActiveBusiness,
              isLoading: false,
            };
          });
        } catch (error: any) {
          console.error(`Error al eliminar el negocio ${businessId}:`, error);
          set({
            error:
              error.message || `Error al eliminar el negocio ${businessId}`,
            isLoading: false,
          });
        }
      },

      clearBusinesses: () => {
        set({
          businesses: [],
          activeBusiness: null,
          error: null,
        });
      },
    }),
    {
      name: "business-store",
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        businesses: state.businesses,
        activeBusiness: state.activeBusiness,
      }),
    }
  )
);

export const initializeBusinessListeners = () => {
  const isAuthenticated = useAuthStore.getState().isAuthenticated;

  useAuthStore.subscribe((state) => {
    const currentAuthState = state.isAuthenticated;

    if (!isAuthenticated && currentAuthState) {
      useBusinessStore.getState().fetchBusinesses();
    }

    if (isAuthenticated && !currentAuthState) {
      useBusinessStore.getState().clearBusinesses();
    }
  });
};

export default useBusinessStore;