import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import LayoutMain from "../../../../components/LayoutHome";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { PaperProvider } from "react-native-paper";
import PointSaleCard from "../../../../components/PointSaleCard";
import useBusinessStore from "../../../../hooks/useBusinessStore";
import api from "../../../../api/apiConfig";

interface PointSaleApiResponse {
  id: number;
  nombre: string;
  ubicacion: string;
  activo: number;
  responsable: string;
  telefono: string;
  fecha_creacion: string;
  negocio_id: number;
  latitud: number | null;
  longitud: number | null;
}

interface PointSaleCardProps {
  id: number;
  name: string;
  address: string;
  isActive: boolean;
  responsable: string;
  telefono: string;
}

function PointSale() {
  const router = useRouter();
  const { activeBusiness } = useBusinessStore();

  const [pointSales, setPointSales] = useState<PointSaleApiResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPointOfSale = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          `point-sale/business/${activeBusiness?.id}/active`
        );
        setPointSales(response.data);
      } catch (error) {
        console.error("Error fetching point of sales:", error);
        Alert.alert("Error", "No se pudieron cargar los puntos de venta");
      } finally {
        setLoading(false);
      }
    };

    if (activeBusiness?.id) {
      fetchPointOfSale();
    }
  }, [activeBusiness?.id]);

  const toggleLocationStatus = async (locationId: number): Promise<void> => {
    try {
      const currentLocation = pointSales.find(
        (location) => location.id === locationId
      );
      if (!currentLocation) return;

      setPointSales(
        pointSales.map((location) =>
          location.id === locationId
            ? { ...location, activo: location.activo === 1 ? 0 : 1 }
            : location
        )
      );

      await api.patch(`point-sale/${locationId}/status`, {
        activo: currentLocation.activo === 1 ? false : true,
      });
    } catch (error) {
      console.error("Error toggling location status:", error);
      Alert.alert(
        "Error",
        "No se pudo actualizar el estado del punto de venta"
      );

      setPointSales((pointSales) => [...pointSales]);
    }
  };

  const handleEdit = (location: PointSaleApiResponse): void => {
    console.log(`Editing ${location.nombre}`);
    router.replace(`/settings/pointsale/${location.id}`);
  };

  const handleDelete = (location: PointSaleApiResponse): void => {
    Alert.alert(
      "Eliminar punto de venta",
      `¿Estás seguro que deseas eliminar ${location.nombre}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              setPointSales(
                pointSales.filter((item) => item.id !== location.id)
              );

              await api.patch(`point-sale/${location.id}/status`, {
                activo: false,
              });
            } catch (error) {
              console.error(`Error deleting ${location.nombre}:`, error);
              Alert.alert("Error", "No se pudo eliminar el punto de venta");

              console.log("error =>", error);

              const response = await api.get(
                `point-sale/business/${activeBusiness?.id}`
              );
              setPointSales(response.data);
            }
          },
          style: "destructive",
        },
      ]
    );
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
            <Text style={styles.titleHeader}>Puntos de Venta</Text>
          </View>
          <Pressable
            style={styles.addButton}
            onPress={() => {
              router.replace("/settings/pointsale/new");
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
        ) : (
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
          >
            {pointSales.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No hay puntos de venta registrados
                </Text>
              </View>
            ) : (
              pointSales.map((location: PointSaleApiResponse) => (
                <PointSaleCard
                  key={location.id}
                  location={{
                    id: location.id,
                    name: location.nombre,
                    address: location.ubicacion,
                    isActive: location.activo === 1,
                    responsable: location.responsable,
                    telefono: location.telefono,
                  }}
                  onToggle={() => toggleLocationStatus(location.id)}
                  onEdit={() => handleEdit(location)}
                  onDelete={() => handleDelete(location)}
                />
              ))
            )}
          </ScrollView>
        )}
      </LayoutMain>
    </PaperProvider>
  );
}

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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
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
  leftNavbar: {
    position: "relative",
    justifyContent: "center",
        flexDirection: "row",
    alignItems: "center",
   // Espaciado entre el botón y el título
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
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
});

export default PointSale;
