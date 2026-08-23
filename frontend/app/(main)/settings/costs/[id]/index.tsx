import React, { useEffect, useState } from "react";
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
import { Dropdown } from "react-native-element-dropdown";
import LayoutMain from "../../../../../components/LayoutHome";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import useBusinessStore from "../../../../../hooks/useBusinessStore";
import api from "../../../../../api/apiConfig";

export interface ExpenseCategoryData {
  id: number;
  negocio_id: number;
  nombre: string;
  descripcion: string;
  tipo_costo: string;
  activo: number;
  fecha_creacion?: string;
  updated_at?: string;
}

// Props para el componente EditCategory
export interface EditCategoryProps {
  // Si hay props específicas para el componente EditCategory, se agregarían aquí
}

// Tipo para los valores del dropdown de tipo de costo
export interface DropdownItem {
  label: string;
  value: string;
}

function EditCategory() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { activeBusiness } = useBusinessStore();

  // Estados de carga
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Estados para los campos del formulario
  const [categoryName, setCategoryName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [categoryType, setCategoryType] = useState<string>("");
  const [isFocusType, setIsFocusType] = useState<boolean>(false);

  // Fechas e información adicional
  const [creationDate, setCreationDate] = useState<string>("");
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");

  // Opciones para el dropdown de tipo de categoría
  const tiposCategoria: DropdownItem[] = [
    { label: "Fijo", value: "fijo" },
    { label: "Variable", value: "variable" },
  ];

  useEffect(() => {
    fetchCategoryInfo();
  }, [id, activeBusiness?.id]);

  const fetchCategoryInfo = async (): Promise<void> => {
    if (!id || !activeBusiness?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Aquí iría la llamada a la API para obtener la información de la categoría
      const response = await api.get(`transactions/expense-categories/${id}`);

      const category: ExpenseCategoryData = response.data;

      // Actualizar estados con los datos recibidos
      setCategoryName(category.nombre || "");
      setDescription(category.descripcion || "");
      setCategoryType(category.tipo_costo || "");
      setIsActive(category.activo === 1);
      setCategoryId(category.id.toString());

      // Formatear fechas para mostrar si están disponibles
      if (category.fecha_creacion) {
        const date = new Date(category.fecha_creacion);
        setCreationDate(date.toLocaleDateString("es-ES"));
      }

      if (category.updated_at) {
        const date = new Date(category.updated_at);
        setLastUpdate(date.toLocaleDateString("es-ES"));
      }

      console.log("Categoría cargada:", category);
    } catch (error) {
      console.error("Error al obtener datos de la categoría:", error);
      Alert.alert("Error", "No se pudieron cargar los datos de la categoría");
    } finally {
      setLoading(false);
    }
  };

  // Función para validar el formulario
  const validateForm = (): boolean => {
    if (!categoryName.trim()) {
      Alert.alert("Error", "El nombre de la categoría es obligatorio");
      return false;
    }

    if (!categoryType) {
      Alert.alert("Error", "El tipo de costo es obligatorio");
      return false;
    }

    return true;
  };

  // Función para guardar los cambios
  const handleSave = async (): Promise<void> => {
    if (!validateForm() || !activeBusiness?.id) return;

    try {
      setSaving(true);

      const categoryData = {
        negocio_id: activeBusiness.id,
        nombre: categoryName,
        descripcion: description || "",
        tipo_costo: categoryType,
        activo: isActive ? 1 : 0,
      };

      // Aquí iría la llamada a la API para actualizar la categoría
      const response = await api.put(
        `transactions/expense-categories/${id}`,
        categoryData
      );

      console.log("Categoría actualizada:", response.data);
      Alert.alert("Éxito", "Categoría actualizada con éxito");
      router.replace("/settings/costs");
    } catch (error) {
      console.error("Error al actualizar la categoría:", error);
      Alert.alert("Error", "No se pudo actualizar la categoría");
    } finally {
      setSaving(false);
    }
  };

  // Función para eliminar la categoría
  const handleDelete = (): void => {
    Alert.alert(
      "Eliminar categoría",
      "¿Está seguro que desea eliminar esta categoría? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`transactions/expense-categories/${id}`);
              Alert.alert("Éxito", "Categoría eliminada con éxito");
              router.replace("/settings/costs");
            } catch (error) {
              console.error("Error al eliminar la categoría:", error);
              Alert.alert("Error", "No se pudo eliminar la categoría");
            }
          },
        },
      ]
    );
  };

  // Loading state
  if (loading) {
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
            <Text style={styles.titleHeader}>Editar Categoría</Text>
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
            onPress={() => router.replace("/settings/costs")}
          >
            <Feather name="arrow-left" size={19} color="black" />
          </Pressable>
          <Text style={styles.titleHeader}>Editar Categoría</Text>
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
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleContainer}>
            <MaterialIcons name="info-outline" size={20} color="#16a34a" />
            <Text style={styles.sectionTitle}>Información básica</Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Nombre de la categoría</Text>
            <TextInput
              style={styles.textInput}
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="Ingrese el nombre de la categoría"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Descripción</Text>
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              value={description}
              onChangeText={setDescription}
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
              value={categoryType}
              onFocus={() => setIsFocusType(true)}
              onBlur={() => setIsFocusType(false)}
              onChange={(item) => {
                setCategoryType(item.value);
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
            <Text style={styles.fieldLabel}>Estado de la categoría</Text>
            <View style={styles.switchRow}>
              <Text
                style={[
                  styles.switchLabel,
                  isActive ? styles.activeText : styles.inactiveText,
                ]}
              >
                {isActive ? "Activa" : "Inactiva"}
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

        {(creationDate || lastUpdate || categoryId) && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionTitleContainer}>
              <Feather name="info" size={20} color="#16a34a" />
              <Text style={styles.sectionTitle}>Información adicional</Text>
            </View>

            <View style={styles.infoRow}>
              {creationDate && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Fecha de creación</Text>
                  <View style={styles.infoValue}>
                    <Feather
                      name="calendar"
                      size={14}
                      color="#9ca3af"
                      style={styles.infoIcon}
                    />
                    <Text style={styles.infoText}>{creationDate}</Text>
                  </View>
                </View>
              )}

              {lastUpdate && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Última actualización</Text>
                  <View style={styles.infoValue}>
                    <Feather
                      name="calendar"
                      size={14}
                      color="#9ca3af"
                      style={styles.infoIcon}
                    />
                    <Text style={styles.infoText}>{lastUpdate}</Text>
                  </View>
                </View>
              )}
            </View>

            {categoryId && (
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>ID de la categoría</Text>
                  <View style={styles.infoValue}>
                    <Feather
                      name="hash"
                      size={14}
                      color="#9ca3af"
                      style={styles.infoIcon}
                    />
                    <Text style={styles.infoText}>{categoryId}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

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
          <Text style={styles.deleteButtonText}>Eliminar categoría</Text>
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

export default EditCategory;
