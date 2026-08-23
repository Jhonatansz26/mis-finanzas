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
  ActivityIndicator,
} from "react-native";
import LayoutMain from "../../../../../components/LayoutHome";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Dropdown } from "react-native-element-dropdown";
import useBusinessStore from "../../../../../hooks/useBusinessStore";
import api from "../../../../../api/apiConfig";

function NewCategory() {
  const router = useRouter();
  const { activeBusiness } = useBusinessStore();

  const [saving, setSaving] = useState(false);
  const [isFocusType, setIsFocusType] = useState(false);

  // Usar un solo estado para todos los valores del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tipo_costo: "",
    activo: true,
  });

  // Función para actualizar un solo campo del estado
  const updateField = (field: string, value: string | boolean) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const tiposCategoria = [
    { label: "Fijo", value: "fijo" },
    { label: "Variable", value: "variable" },
  ];

  const validateForm = (): boolean => {
    if (!formData.nombre.trim()) {
      Alert.alert("Error", "El nombre la categoria de gasto es obligatorio");
      return false;
    }

    if (!formData.tipo_costo.trim()) {
      Alert.alert("Error", "El tipo de gasto es obligatorio");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!activeBusiness?.id) {
      console.error("No hay negocio activo");
      return;
    }
    if (!validateForm()) return;
    try {
      setSaving(true);

      const costCategoryData = {
        negocio_id: activeBusiness?.id,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        tipo_costo: formData.tipo_costo,
        activo: formData.activo,
      };

      const response = await api.post(
        "transactions/expense-categories",
        costCategoryData
      );

      if (response.status === 201 || response.status === 200) {
        alert("Punto de venta creado con éxito");
        router.replace("/settings/costs");
      } else {
        throw new Error("Error al crear el punto de venta");
      }
    } catch (error) {
      console.error("Error al crear el producto:", error);
      Alert.alert("Error", "No se pudo crear el producto");
    } finally {
      setSaving(false);
    }
  };

  return (
    <LayoutMain>
      <View style={styles.headerHome}>
        <View style={styles.leftNavbar}>
          <Pressable 
            style={styles.iconBackButton}
            onPress={() => router.replace("/settings/costs")}
          >
            <Feather name="arrow-left" size={19} color="black" />
          </Pressable>
          <Text style={styles.titleHeader}>Nueva Categoría</Text>
        </View>
      </View>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleContainer}>
            <MaterialIcons name="info-outline" size={20} color="#16a34a" />
            <Text style={styles.sectionTitle}>Información básica</Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Nombre de la categoría</Text>
            <TextInput
              style={styles.textInput}
              value={formData.nombre}
              onChangeText={(text) => updateField("nombre", text)}
              placeholder="Ingrese el nombre de la categoría"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Descripción</Text>
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              value={formData.descripcion}
              onChangeText={(text) => updateField("descripcion", text)}
              placeholder="Ingrese una descripción de la categoría"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Tipo</Text>
            <Dropdown
              style={[
                styles.dropdown,
                isFocusType && { borderColor: "#16a34a" },
              ]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              data={tiposCategoria}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Seleccionar tipo"
              value={formData.tipo_costo}
              onFocus={() => setIsFocusType(true)}
              onBlur={() => setIsFocusType(false)}
              onChange={(item) => {
                updateField("tipo_costo", item.value);
                setIsFocusType(false);
              }}
              renderLeftIcon={() => (
                <View style={styles.iconContainer}>
                  <Feather name="tag" size={16} color="#9ca3af" />
                </View>
              )}
            />
          </View>
          <View style={styles.switchContainer}>
            <Text style={styles.fieldLabel}>Estado del punto de venta</Text>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>
                {formData.activo ? "Activo" : "Inactivo"}
              </Text>
              <Switch
                value={formData.activo}
                onValueChange={(value) => updateField("activo", value)}
                trackColor={{ false: "#e5e7eb", true: "#16a34a" }}
                thumbColor={"#ffffff"}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Crear categoría</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </LayoutMain>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: "white",
  },
  iconContainer: {
    marginRight: 8,
  },
  placeholderStyle: {
    fontSize: 14,
    color: "#9ca3af",
  },
  selectedTextStyle: {
    fontSize: 14,
    color: "#1f2937",
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 14,
    borderColor: "#e5e7eb",
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
    color: "#4b5563",
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

export default NewCategory;
