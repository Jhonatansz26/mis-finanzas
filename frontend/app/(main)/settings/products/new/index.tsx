import React, { useState } from "react";
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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import LayoutMain from "../../../../../components/LayoutHome";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import useBusinessStore from "../../../../../hooks/useBusinessStore";
import api from "../../../../../api/apiConfig";

// Define interface based on the DTO
interface ProductData {
  negocio_id: number;
  nombre: string;
  descripcion?: string;
  codigo_interno?: string;
  activo: boolean;
  precio_unitario: number;
  costo_unitario: number;
  unidad_medida?: string;
}

function NewProduct() {
  const router = useRouter();
  const { activeBusiness } = useBusinessStore();

  // Estados para los campos del formulario
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [unit, setUnit] = useState("");

  // Estados para los valores numéricos (sin formato)
  const [salePrice, setSalePrice] = useState("");
  const [costPrice, setCostPrice] = useState("");

  // Estados para los valores formateados (con separadores de miles)
  const [formattedSalePrice, setFormattedSalePrice] = useState("");
  const [formattedCostPrice, setFormattedCostPrice] = useState("");

  // Función para formatear números al estilo colombiano (con puntos como separadores de miles)
  const formatNumberToColombian = (value: string): string => {
    // Eliminar caracteres no numéricos
    const numericValue = value.replace(/\D/g, "");
    
    if (!numericValue) return "";
    
    // Formatear con separadores de miles
    return new Intl.NumberFormat('es-CO').format(parseInt(numericValue));
  };

  // Función específica para manejar los cambios en los campos de precio
  const handlePriceChange = (field: 'sale' | 'cost', formattedValue: string) => {
    // Verificar si excede el límite de 9 dígitos
    const numericValue = formattedValue.replace(/\D/g, "");
    
    if (numericValue.length > 9) return;
    
    // Actualizar el valor formateado en la UI
    if (field === 'sale') {
      setFormattedSalePrice(formatNumberToColombian(numericValue));
      setSalePrice(numericValue);
    } else {
      setFormattedCostPrice(formatNumberToColombian(numericValue));
      setCostPrice(numericValue);
    }
  };

  const validateForm = () => {
    if (!productName.trim()) {
      alert("El nombre del producto es obligatorio");
      return false;
    }

    if (!salePrice.trim()) {
      alert("El precio de venta es obligatorio");
      return false;
    }

    if (!costPrice.trim()) {
      alert("El precio de compra es obligatorio");
      return false;
    }

    if (!unit.trim()) {
      alert("El unidad de medida es obligatorio");
      return false;
    }

    return true;
  };

  // Función para guardar el producto
  const handleSave = async () => {
    if (!activeBusiness?.id) {
      console.error("No hay negocio activo");
      return;
    }
    if (!validateForm()) return;

    // Crear objeto de datos según el DTO
    const productData: ProductData = {
      negocio_id: activeBusiness.id,
      nombre: productName,
      descripcion: description || undefined,
      codigo_interno: sku || undefined,
      activo: isActive,
      precio_unitario: parseInt(salePrice),
      costo_unitario: parseInt(costPrice),
      unidad_medida: unit || undefined,
    };

    console.log("Guardando producto:", productData);

    // Aquí iría la llamada a la API
    try {
      const response = await api.post("products", productData);
      if (response.status === 201 || response.status === 200) {
        alert("Punto de venta creado con éxito");
        router.replace("/settings/products");
      } else {
        throw new Error("Error al crear el punto de venta");
      }
    } catch (error) {
      console.error("Error al crear el producto:", error);
      Alert.alert("Error", "No se pudo crear el producto");
    }
  };

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
          <Text style={styles.titleHeader}>Nuevo Producto</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
          keyboardShouldPersistTaps="handled"
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
                value={productName}
                onChangeText={setProductName}
                placeholder="Ingrese el nombre del producto"
              />
            </View>

            {/* Descripción */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Descripción</Text>
              <TextInput
                style={[styles.textInput, styles.textAreaInput]}
                value={description}
                onChangeText={setDescription}
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
                value={sku}
                onChangeText={setSku}
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
                    isActive ? styles.activeText : styles.inactiveText,
                  ]}
                >
                  {isActive ? "Activo" : "Inactivo"}
                </Text>
                <Switch
                  value={isActive}
                  onValueChange={setIsActive}
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
                    onChangeText={(value) => handlePriceChange('sale', value)}
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
                    onChangeText={(value) => handlePriceChange('cost', value)}
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
                value={unit}
                onChangeText={setUnit}
                placeholder="Ejemplo: unidad, kg, litro"
              />
            </View>
          </View>

          {/* Botón de guardar cambios */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Crear producto</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LayoutMain>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
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
  saveButton: {
    backgroundColor: "#16a34a",
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default NewProduct;