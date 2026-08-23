import React, { useEffect, useState, useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import LayoutMain from "../../../../components/LayoutHome";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import ProductCard from "../../../../components/ProductCard";
import { PaperProvider } from "react-native-paper";
import useBusinessStore from "../../../../hooks/useBusinessStore";
import Product from "../../../../utils/types/Products";
import api from "../../../../api/apiConfig";

function Products() {
  const router = useRouter();

  const { activeBusiness } = useBusinessStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          `products/business/${activeBusiness?.id}`
        );
        setProducts(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching point of sales:", error);
        Alert.alert("Error", "No se pudieron cargar los puntos de venta");
      } finally {
        setLoading(false);
      }
    };
    if (activeBusiness?.id) {
      fetchProducts();
    }
  }, [activeBusiness?.id]);

  // Filter products based on searchText
  const filteredProducts = useMemo(() => {
    if (!searchText.trim()) {
      return products; // Return all products if search text is empty
    }
    
    const searchLower = searchText.toLowerCase().trim();
    return products.filter((product) => {
      // Filter by name (assuming product has a name property)
      // Add more properties to search as needed (e.g., description, code, etc.)
      return (
        product.nombre?.toLowerCase().includes(searchLower) || 
        product.descripcion?.toLowerCase().includes(searchLower) ||
        product.codigo_interno?.toLowerCase().includes(searchLower)
      );
    });
  }, [products, searchText]);

  const handleEditProduct = (productId: number) => {
    router.replace(`/settings/products/${productId}`);
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      "Eliminar producto",
      "¿Estás seguro que deseas eliminar este producto?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              setProducts(products.filter((item) => item.id !== product.id));
              await api.delete(`products/${product.id}`);
              Alert.alert("Éxito", "Producto eliminado correctamente");
            } catch (error) {
              console.error(`Error deleting ${product.id}:`, error);
              Alert.alert("Error", "No se pudo eliminar el punto de venta");

              const response = await api.get(
                `products/business/${activeBusiness?.id}`
              );
              setProducts(response.data);
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
    <Text style={styles.titleHeader}>Catalogo de Productos</Text>
  </View>
  <Pressable
    style={styles.addButton}
    onPress={() => {
      router.replace("/settings/products/new");
    }}
  >
    <View style={styles.buttonContent}>
      <Feather name="plus" size={16} color="#16a34a" />
      <Text style={styles.buttonText}>Añadir</Text>
    </View>
  </Pressable>
</View>

        {/* Barra de búsqueda con botón de filtro */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Feather
              name="search"
              size={18}
              color="#9ca3af"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar productos..."
              placeholderTextColor="#9ca3af"
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="none"
            />
            {searchText !== "" && (
              <Pressable onPress={() => setSearchText("")}>
                <Feather name="x" size={18} color="#9ca3af" />
              </Pressable>
            )}
          </View>
          {/* <Pressable
            style={styles.filterButton}
            onPress={() => router.replace("/settings/products/231")}
          >
            <Feather name="sliders" size={20} color="#4b5563" />
          </Pressable> */}
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
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleEditProduct}
                  onDelete={() => handleDeleteProduct(product)}
                />
              ))
            ) : (
              <View style={styles.emptyResultsContainer}>
                <Feather name="search" size={50} color="#9ca3af" />
                <Text style={styles.emptyResultsText}>
                  No se encontraron productos
                </Text>
                <Text style={styles.emptyResultsSubtext}>
                  Intenta con otra búsqueda o agrega nuevos productos
                </Text>
              </View>
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
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: "#1f2937",
  },
  filterButton: {
    width: 40,
    height: 40,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
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
  emptyResultsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyResultsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4b5563",
    marginTop: 16,
  },
  emptyResultsSubtext: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 32,
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
});

export default Products;