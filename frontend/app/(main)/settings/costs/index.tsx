import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { PaperProvider } from "react-native-paper";
import LayoutMain from "../../../../components/LayoutHome";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import CategoryCard from "../../../../components/CategoryCard";
import useBusinessStore from "../../../../hooks/useBusinessStore";
import api from "../../../../api/apiConfig";
export interface ExpenseCategory {
  id: number;
  nombre: string;
  descripcion: string;
  tipo_costo: string;
  negocio_id: number;
  activo: number;
}

// Interfaz para la categoría formateada que se pasa como prop al componente CategoryCard
export interface FormattedCategory {
  id: number;
  name: string;
  type: string;
  description?: string;
  negocio_id?: number;
  activo?: number;
  [key: string]: any; // Para otras propiedades que pueda tener
}

// Props para el componente CategoryCard
export interface CategoryCardProps {
  item: FormattedCategory;
  onDelete?: (id: number) => void;
}
// Props para el componente Costs
interface CostsProps {
  // Si hay props específicas para el componente Costs, se agregarían aquí
}

const Costs: React.FC<CostsProps> = () => {
  const router = useRouter();
  const { activeBusiness } = useBusinessStore();

  const [loading, setLoading] = useState<boolean>(true);
  const [fixedCosts, setFixedCosts] = useState<ExpenseCategory[]>([]);
  const [variableCosts, setVariableCosts] = useState<ExpenseCategory[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeBusiness?.id) {
      fetchExpenseCostsCategory();
    }
  }, [activeBusiness]);

  const fetchExpenseCostsCategory = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(
        `transactions/business/${activeBusiness?.id}/expense-categories`
      );

      console.log("API Response:", response.data);

      // Verificar si la respuesta tiene datos
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("La respuesta de la API no tiene el formato esperado");
      }

      // Clasificar los costos según su tipo
      const fixed = response.data.filter(
        (category: ExpenseCategory) =>
          category.tipo_costo?.toLowerCase() === "fijo"
      );

      const variable = response.data.filter(
        (category: ExpenseCategory) =>
          category.tipo_costo?.toLowerCase() === "variable"
      );

      console.log("Costos fijos:", fixed);
      console.log("Costos variables:", variable);

      setFixedCosts(fixed);
      setVariableCosts(variable);
    } catch (error) {
      console.error("Error fetching expense categories:", error);
      setError("No se pudieron cargar las categorías de gastos");
      Alert.alert("Error", "No se pudieron cargar las categorías de gastos");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number): Promise<void> => {
    Alert.alert(
      "Eliminar categoría de gasto",
      "¿Estás seguro que deseas eliminar esta categoría de gasto?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              // Eliminar del backend
              await api.delete(`transactions/expense-categories/${id}`);

              // Eliminar del estado local
              setFixedCosts((prev) => prev.filter((item) => item.id !== id));
              setVariableCosts((prev) => prev.filter((item) => item.id !== id));

              Alert.alert("Éxito", "Categoría eliminada correctamente");
            } catch (error) {
              console.error(
                `Error eliminando la categoría con id ${id}:`,
                error
              );
              Alert.alert(
                "Error",
                "No se pudo eliminar la categoría de gasto. Inténtalo nuevamente."
              );

              // Intentar recargar los datos desde la API para mantener sincronizado el estado
              fetchExpenseCostsCategory();
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  // Función para formatear los datos de la API al formato que espera CategoryCard
  const formatCategoryData = (category: ExpenseCategory): FormattedCategory => {
    return {
      id: category.id,
      name: category.nombre || "Sin nombre",
      type: category.tipo_costo === "fijo" ? "Fijo" : "Variable",
      description: category.descripcion || "",
      negocio_id: category.negocio_id,
      activo: category.activo,
    };
  };

  return (
    <PaperProvider>
      <LayoutMain>
        <View style={styles.headerHome}>
          <View style={styles.leftNavbar}>
            <Pressable
              style={styles.iconBackButton}
              onPress={() => router.replace("/settings")}
            >
              <Feather name="arrow-left" size={19} color="black" />
            </Pressable>
            <Text style={styles.titleHeader}>Categorías de Gastos</Text>
          </View>
          <Pressable
            style={styles.addButton}
            onPress={() => {
              router.replace("/settings/costs/new");
            }}
          >
            <View style={styles.buttonContent}>
              <Feather name="plus" size={16} color="#16a34a" />
              <Text style={styles.buttonText}>Añadir</Text>
            </View>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#16a34a" />
            <Text style={styles.loadingText}>Cargando datos...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable
              style={styles.retryButton}
              onPress={fetchExpenseCostsCategory}
            >
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
          >
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Costos fijos</Text>
              <View style={styles.categoriesContainer}>
                {fixedCosts && fixedCosts.length > 0 ? (
                  fixedCosts.map((item) => (
                    <CategoryCard
                      key={item.id}
                      item={formatCategoryData(item)}
                      onDelete={handleDeleteCategory}
                    />
                  ))
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      No hay costos fijos registrados
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Costos variables</Text>
              <View style={styles.categoriesContainer}>
                {variableCosts && variableCosts.length > 0 ? (
                  variableCosts.map((item) => (
                    <CategoryCard
                      key={item.id}
                      item={formatCategoryData(item)}
                      onDelete={handleDeleteCategory}
                    />
                  ))
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      No hay costos variables registrados
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.bottomNavSpacer} />
          </ScrollView>
        )}
      </LayoutMain>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 8,
  },
  categoriesContainer: {
    borderRadius: 8,
    overflow: "hidden",
  },
  iconBackButton: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  titleHeader: {
    color: "black",
    fontSize: 24,
    fontWeight: "700",
    borderBottomWidth: 2,
    borderBottomColor: "#16a34a",
  },
  leftNavbar: {
    position: "relative",
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
  },
  headerHome: {
    height: 75,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 9,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  addButton: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#16a34a",
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "500",
  },
  bottomNavSpacer: {
    height: 70,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: "#dc2626",
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "500",
  },
  emptyContainer: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 14,
  },
});

export default Costs;
