import React, { useState, useEffect } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import LayoutMain from "../../../../../components/LayoutHome";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import useBusinessStore from "../../../../../hooks/useBusinessStore";
import api from "../../../../../api/apiConfig";

// Definición del tipo de producto con todos los campos necesarios
interface ProductData {
  id: number;
  nombre: string;
  descripcion: string | null;
  codigo_interno: string | null;
  costo_unitario: string;
  precio_unitario: string;
  unidad_medida: string;
  negocio_id: number;
  activo: boolean;
  fecha_creacion: string;
  updated_at: string;
}

function EditProduct() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { activeBusiness } = useBusinessStore();

  // Estados para manejo de carga y guardado
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estado único para todo el producto
  const [product, setProduct] = useState<ProductData>({
    id: 0,
    nombre: "",
    descripcion: "",
    codigo_interno: "",
    costo_unitario: "",
    precio_unitario: "",
    unidad_medida: "",
    negocio_id: 0,
    activo: true,
    fecha_creacion: "",
    updated_at: "",
  });

  // Estados separados para los precios formateados que se muestran en la UI
  const [formattedSalePrice, setFormattedSalePrice] = useState("");
  const [formattedCostPrice, setFormattedCostPrice] = useState("");

  // Cargar datos del producto al iniciar
  useEffect(() => {
    const fetchProductData = async () => {
      if (!id || !activeBusiness?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(
          `products/business/${activeBusiness.id}/product/${id}`
        );
        const productData = response.data;

        // Preparar el producto con los datos recibidos
        const formattedProduct = {
          id: productData.id,
          nombre: productData.nombre || "",
          descripcion: productData.descripcion || "",
          codigo_interno: productData.codigo_interno || "",
          costo_unitario: String(productData.costo_unitario || ""),
          precio_unitario: String(productData.precio_unitario || ""),
          unidad_medida: productData.unidad_medida || "",
          negocio_id: productData.negocio_id,
          activo: productData.activo === 1,
          fecha_creacion: productData.fecha_creacion || "",
          updated_at: productData.updated_at || "",
        };

        // Actualizar el estado del producto
        setProduct(formattedProduct);

        // Formatear los precios para la UI
        setFormattedSalePrice(formatNumberToColombian(formattedProduct.precio_unitario));
        setFormattedCostPrice(formatNumberToColombian(formattedProduct.costo_unitario));
      } catch (error) {
        console.error("Error al obtener datos del producto:", error);
        Alert.alert("Error", "No se pudieron cargar los datos del producto");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, activeBusiness?.id]);

  // Función para formatear números al estilo colombiano (con puntos como separadores de miles)
  const formatNumberToColombian = (value: string): string => {
    // Eliminar caracteres no numéricos
    const numericValue = value.replace(/\D/g, "");
    
    if (!numericValue) return "";
    
    // Formatear con separadores de miles
    return new Intl.NumberFormat('es-CO').format(parseInt(numericValue));
  };

  // Función para manejar los cambios en los campos del formulario
  const handleChange = (field: keyof ProductData, value: string | boolean) => {
    setProduct(prevProduct => ({
      ...prevProduct,
      [field]: value
    }));
  };

  // Función específica para manejar los cambios en los campos de precio
  const handlePriceChange = (field: 'precio_unitario' | 'costo_unitario', formattedValue: string) => {
    // Verificar si excede el límite de 9 dígitos
    const numericValue = formattedValue.replace(/\D/g, "");
    
    if (numericValue.length > 9) return;
    
    // Actualizar el valor formateado en la UI
    if (field === 'precio_unitario') {
      setFormattedSalePrice(formatNumberToColombian(numericValue));
    } else {
      setFormattedCostPrice(formatNumberToColombian(numericValue));
    }
    
    // Actualizar el valor numérico en el estado del producto
    handleChange(field, numericValue);
  };

  // Función para validar el formulario
  const validateForm = (): boolean => {
    if (!product.nombre.trim()) {
      Alert.alert("Error", "El nombre del producto es obligatorio");
      return false;
    }

    if (!product.precio_unitario.trim()) {
      Alert.alert("Error", "El precio de venta es obligatorio");
      return false;
    }

    if (!product.costo_unitario.trim()) {
      Alert.alert("Error", "El precio de compra es obligatorio");
      return false;
    }

    return true;
  };
  const handleSave = async () => {
    if (!validateForm() || !activeBusiness?.id) return;

    try {
      setSaving(true);

      const productData = {
        negocio_id: activeBusiness.id,
        nombre: product.nombre,
        descripcion: product.descripcion || null,
        codigo_interno: product.codigo_interno || null,
        activo: product.activo,
        precio_unitario: parseInt(product.precio_unitario),
        costo_unitario: parseInt(product.costo_unitario),
        unidad_medida: product.unidad_medida || null,
      };

      // Llamada a la API para actualizar el producto
      const response = await api.put(`products/${id}`, productData);
      console.log("Producto actualizado:", response.data);

      Alert.alert("Éxito", "Producto actualizado con éxito");
      router.replace("/settings/products");
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      Alert.alert("Error", "No se pudo actualizar el producto");
    } finally {
      setSaving(false);
    }
  };

  // Función para eliminar el producto
  const handleDelete = () => {
    Alert.alert(
      "Eliminar producto",
      "¿Está seguro que desea eliminar este producto? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`products/${id}`);
              Alert.alert("Éxito", "Producto eliminado con éxito");
              router.replace("/settings/products");
            } catch (error) {
              console.error("Error al eliminar el producto:", error);
              Alert.alert("Error", "No se pudo eliminar el producto");
            }
          },
        },
      ]
    );
  };

  // Formatear la fecha para mostrar
  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES");
  };

  // Loading state
  if (loading) {
    return (
      <LayoutMain>
        <View style={styles.headerHome}>
  <View style={styles.leftNavbar}>
    <Pressable
      style={styles.iconBackButton}
      onPress={() => router.replace("/settings/products")}
    >
      <Feather name="arrow-left" size={19} color="black" />
    </Pressable>
    <Text style={styles.titleHeader}>Editar Producto</Text>
  </View>
  <Pressable
    style={styles.saveButton}
    onPress={handleSave}
    disabled={saving}
  >
    <View style={styles.buttonContent}>
      {saving ? (
        <ActivityIndicator size="small" color="#16a34a" />
      ) : (
        <>
          <Feather name="save" size={20} color="#16a34a" />
          <Text style={styles.buttonText}>Guardar</Text>
        </>
      )}
    </View>
  </Pressable>
</View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Cargando datos...</Text>
        </View>
      </LayoutMain>
    );
  }

  return (
    <LayoutMain>
      <View style={styles.headerHome}>
  <View style={styles.leftNavbar}>
    <Pressable
      style={styles.iconBackButton}
      onPress={() => router.replace("/settings/products")}
    >
      <Feather name="arrow-left" size={19} color="black" />
    </Pressable>
    <Text style={styles.titleHeader}>Editar Producto</Text>
  </View>
  <Pressable
    style={styles.saveButton}
    onPress={handleSave}
    disabled={saving}
  >
    <View style={styles.buttonContent}>
      {saving ? (
        <ActivityIndicator size="small" color="#16a34a" />
      ) : (
        <>
          <Feather name="save" size={20} color="#16a34a" />
          <Text style={styles.buttonText}>Guardar</Text>
        </>
      )}
    </View>
  </Pressable>
</View>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* Sección de información básica */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleContainer}>
            <MaterialIcons name="info-outline" size={20} color="#16a34a" />
            <Text style={styles.sectionTitle}>Información básica</Text>
          </View>

          {/* Nombre del producto */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Nombre del producto</Text>
            <TextInput
              style={styles.textInput}
              value={product.nombre}
              onChangeText={(value) => handleChange('nombre', value)}
              placeholder="Ingrese el nombre del producto"
            />
          </View>

          {/* Descripción */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Descripción</Text>
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              value={product.descripcion || ""}
              onChangeText={(value) => handleChange('descripcion', value)}
              placeholder="Ingrese una descripción del producto"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Código interno */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Código interno</Text>
            <TextInput
              style={styles.textInput}
              value={product.codigo_interno || ""}
              onChangeText={(value) => handleChange('codigo_interno', value)}
              placeholder="Ejemplo: PROD-001"
            />
          </View>

          {/* Estado del producto */}
          <View style={styles.switchContainer}>
            <Text style={styles.fieldLabel}>Estado del producto</Text>
            <View style={styles.switchRow}>
              <Text
                style={[
                  styles.switchLabel,
                  product.activo ? styles.activeText : styles.inactiveText,
                ]}
              >
                {product.activo ? "Activo" : "Inactivo"}
              </Text>
              <Switch
                value={product.activo}
                onValueChange={(value) => handleChange('activo', value)}
                trackColor={{ false: "#e5e7eb", true: "#16a34a" }}
                thumbColor={"#ffffff"}
              />
            </View>
          </View>
        </View>

        {/* Sección de Precios */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleContainer}>
            <Feather name="dollar-sign" size={20} color="#16a34a" />
            <Text style={styles.sectionTitle}>Precios</Text>
          </View>

          {/* Precio de venta */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Precio de venta</Text>
            <View style={styles.textInput}>
              <View style={styles.inputWithIcon}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.textInputInner}
                  value={formattedSalePrice}
                  onChangeText={(value) => handlePriceChange('precio_unitario', value)}
                  placeholder="0"
                  keyboardType="numeric"
                  maxLength={13} // Para permitir 9 dígitos con separadores
                />
              </View>
            </View>
          </View>

          {/* Precio de compra */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Precio de compra</Text>
            <View style={styles.textInput}>
              <View style={styles.inputWithIcon}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.textInputInner}
                  value={formattedCostPrice}
                  onChangeText={(value) => handlePriceChange('costo_unitario', value)}
                  placeholder="0"
                  keyboardType="numeric"
                  maxLength={13} // Para permitir 9 dígitos con separadores
                />
              </View>
            </View>
          </View>

          {/* Unidad de medida */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Unidad de medida</Text>
            <TextInput
              style={styles.textInput}
              value={product.unidad_medida}
              onChangeText={(value) => handleChange('unidad_medida', value)}
              placeholder="Ejemplo: unidad, kg, litro"
            />
          </View>
        </View>

        {/* Sección de información adicional */}
        {(product.fecha_creacion || product.updated_at) && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionTitleContainer}>
              <Feather name="info" size={20} color="#16a34a" />
              <Text style={styles.sectionTitle}>Información adicional</Text>
            </View>

            <View style={styles.infoRow}>
              {product.fecha_creacion && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Fecha de creación</Text>
                  <View style={styles.infoValue}>
                    <Feather
                      name="calendar"
                      size={14}
                      color="#9ca3af"
                      style={styles.infoIcon}
                    />
                    <Text style={styles.infoText}>{formatDate(product.fecha_creacion)}</Text>
                  </View>
                </View>
              )}

              {product.updated_at && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Última actualización</Text>
                  <View style={styles.infoValue}>
                    <Feather
                      name="calendar"
                      size={14}
                      color="#9ca3af"
                      style={styles.infoIcon}
                    />
                    <Text style={styles.infoText}>{formatDate(product.updated_at)}</Text>
                  </View>
                </View>
              )}
            </View>

            {product.id > 0 && (
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>ID del producto</Text>
                  <View style={styles.infoValue}>
                    <Feather
                      name="hash"
                      size={14}
                      color="#9ca3af"
                      style={styles.infoIcon}
                    />
                    <Text style={styles.infoText}>{product.id}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Botón para eliminar producto */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Feather
            name="trash-2"
            size={18}
            color="#ef4444"
            style={styles.deleteIcon}
          />
          <Text style={styles.deleteButtonText}>Eliminar producto</Text>
        </TouchableOpacity>
      </ScrollView>
    </LayoutMain>
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
  saveButton: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
    height: 24,
  },
  buttonText: {
    color: "#16a34a",
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "500",
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
  sectionContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginLeft: 8,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4b5563",
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1f2937",
  },
  textAreaInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    fontSize: 14,
    color: "#9ca3af",
    marginRight: 4,
  },
  textInputInner: {
    flex: 1,
    fontSize: 14,
    color: "#1f2937",
    paddingVertical: 0,
  },
  switchContainer: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  activeText: {
    color: "#16a34a",
  },
  inactiveText: {
    color: "#9ca3af",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4b5563",
    marginBottom: 6,
  },
  infoValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    marginRight: 6,
  },
  infoText: {
    fontSize: 14,
    color: "#1f2937",
  },
  deleteButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "500",
  },
  deleteIcon: {
    marginRight: 8,
  },
});

export default EditProduct;