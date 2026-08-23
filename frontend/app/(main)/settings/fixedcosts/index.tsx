import React, { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert,
  FlatList,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { PaperProvider } from "react-native-paper";
import useBusinessStore from "../../../../hooks/useBusinessStore";
import FixedCostCard from "../../../../components/FixedCostCard";
import {
  FixedCostsData,
  FormDataFixedCosts,
} from "../../../../utils/types/settingsTypes";
import api from "../../../../api/apiConfig";
import LayoutMain from "../../../../components/LayoutHome";

function FixedCosts() {
  const { activeBusiness } = useBusinessStore();

  const router = useRouter();

  const [modalVisible, setModalVisible] = useState<any>(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState<any>(false);

  const [formData, setFormData] = useState<FormDataFixedCosts>({
    amount: "",
    description: "",
    selectedCategory: null,
  });

  const [fixedCosts, setFixedCosts] = useState<FixedCostsData[] | []>([]);

  const [fixedCostCategories, setFixedCostCategories] = useState<any>([]);

  const [loading, setLoading] = useState<any>(false);
  const [editingCost, setEditingCost] = useState<any>(null);

  // Nuevo estado para controlar la carga del botón guardar/actualizar
  const [savingCost, setSavingCost] = useState<boolean>(false);

  useEffect(() => {
    fetchFixedCosts();
    fetchFixedCostsCategories();
  }, []);

  const fetchFixedCosts = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/financial-analysis/fixedCost/${activeBusiness?.id}`
      );
      console.log("✅ costos fijos traidos =>>>:", response.data);

      if (response.data && Array.isArray(response.data)) {
        setFixedCosts(response.data);
      }
    } catch (error) {
      console.error("Error fetching fixed costs:", error);
      Alert.alert("Error", "No se pudieron cargar los costos fijos");
    } finally {
      setLoading(false);
    }
  };

  const fetchFixedCostsCategories = async () => {
    try {
      const response = await api.get(
        `transactions/business/${activeBusiness?.id}/expense-categories?tipo_costo=fijo`
      );
      console.log("costos fijos categorias:", response.data);
      console.log("cantidad de categorias:", response.data?.length || 0);
      setFixedCostCategories(response.data || []);
    } catch (error) {
      console.log("Error fetching categories:", error);
      Alert.alert(
        "Error",
        "No se pudieron cargar las categorías de costos fijos"
      );
    }
  };

  // Función para actualizar el estado del formulario
  const updateFormData = (field: keyof FormDataFixedCosts, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Manejar edición
  const handleEdit = (cost: any) => {
    setEditingCost(cost);
    setFormData({
      selectedCategory: fixedCostCategories.find(
        (cat: any) => cat.id === cost.categoria_egreso_id
      ),
      amount: cost.monto_mensual.toString(),
      description: cost.descripcion || "",
    });
    setModalVisible(true);
  };

  // Manejar eliminación
  const handleDelete = (cost: any) => {
    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de que deseas eliminar el costo fijo "${cost.categoria_nombre}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => deleteFixedCost(cost.id),
        },
      ]
    );
  };

  // Eliminar costo fijo
  const deleteFixedCost = async (costId: number) => {
    try {
      await api.delete(`/financial-analysis/fixedCost/${costId}`);

      setFixedCosts((prevCosts: any) =>
        prevCosts.filter((cost: any) => cost.id !== costId)
      );
      Alert.alert("Éxito", "Costo fijo eliminado correctamente");
    } catch (error: any) {
      console.error("Error deleting fixed cost:", error);
      const errorMessage =
        error.response?.data?.message || "Error al eliminar el costo fijo";
      Alert.alert("Error", errorMessage);
    }
  };

  // Actualizar costo fijo
  const updateFixedCost = async () => {
    if (!formData.selectedCategory) {
      Alert.alert("Error", "Debe seleccionar una categoría");
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Alert.alert("Error", "Debe ingresar un monto válido");
      return;
    }

    const requestBody: any = {};

    // Solo incluir campos que han cambiado
    if (formData.selectedCategory.id !== editingCost.categoria_egreso_id) {
      requestBody.categoria_egreso_id = formData.selectedCategory.id;
    }
    if (parseFloat(formData.amount) !== parseFloat(editingCost.monto_mensual)) {
      requestBody.monto_mensual = parseFloat(formData.amount);
    }
    if (formData.description !== (editingCost.descripcion || "")) {
      requestBody.descripcion = formData.description;
    }

    // Si no hay cambios, cerrar modal
    if (Object.keys(requestBody).length === 0) {
      Alert.alert("Info", "No se detectaron cambios");
      setModalVisible(false);
      clearForm();
      return;
    }

    console.log(
      "📤 Enviando petición PUT a /financial-analysis/fixedCost/" +
        editingCost.id
    );
    console.log("📋 Body:", requestBody);

    setSavingCost(true); // Activar estado de carga

    try {
      const response = await api.put(
        `/financial-analysis/fixedCost/${editingCost.id}`,
        requestBody
      );

      console.log("✅ Respuesta exitosa:", response.data);

      if (response.data?.success) {
        // Actualizar la lista local
        setFixedCosts((prevCosts: any) =>
          prevCosts.map((cost: any) =>
            cost.id === editingCost.id
              ? {
                  ...cost,
                  categoria_egreso_id:
                    requestBody.categoria_egreso_id || cost.categoria_egreso_id,
                  categoria_nombre: formData.selectedCategory.nombre,
                  monto_mensual:
                    requestBody.monto_mensual || cost.monto_mensual,
                  descripcion:
                    requestBody.descripcion !== undefined
                      ? requestBody.descripcion
                      : cost.descripcion,
                  ultima_actualizacion: new Date().toISOString(),
                }
              : cost
          )
        );

        Alert.alert("Éxito", "Costo fijo actualizado correctamente");
        setModalVisible(false);
        clearForm();
      }
    } catch (error: any) {
      console.error("❌ Error:", error);
      const errorMessage =
        error.response?.data?.message || "Error al actualizar";
      Alert.alert("Error", errorMessage);
    } finally {
      setSavingCost(false); // Desactivar estado de carga
    }
  };

  // Calcular total mensual
  const totalMensual = fixedCosts
    .filter((cost: any) => cost.activo === 1)
    .reduce(
      (sum: any, cost: any) => sum + parseFloat(cost.monto_mensual || 0),
      0
    );

  // Formatear moneda
  const formatCurrency = (amount: any) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Manejar selección de categoría
  const handleCategorySelect = (category: any) => {
    console.log("Categoría seleccionada:", category);
    updateFormData("selectedCategory", category);
    setShowCategoryDropdown(false);
  };

  // Limpiar formulario
  const clearForm = () => {
    setFormData({
      amount: "",
      description: "",
      selectedCategory: null,
    });
    setShowCategoryDropdown(false);
    setEditingCost(null);
  };

  // Guardar costo fijo (crear o actualizar)
  const handleSaveFixedCost = async () => {
    // Prevenir múltiples clics
    if (savingCost) return;

    if (editingCost) {
      await updateFixedCost();
    } else {
      await createFixedCost();
    }
  };

  // Crear costo fijo
  const createFixedCost = async () => {
    if (!formData.selectedCategory) {
      Alert.alert("Error", "Debe seleccionar una categoría");
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Alert.alert("Error", "Debe ingresar un monto válido");
      return;
    }

    const requestBody = {
      negocio_id: activeBusiness?.id,
      categoria_egreso_id: formData.selectedCategory.id,
      descripcion: formData.description,
      monto_mensual: parseFloat(formData.amount),
    };

    console.log("📤 Enviando petición POST a /financial-analysis/fixedCost");
    console.log("📋 Body:", requestBody);

    setSavingCost(true); // Activar estado de carga

    try {
      const response = await api.post(
        "/financial-analysis/fixedCost",
        requestBody
      );

      console.log("✅ Respuesta exitosa:", response.data);

      if (response.data) {
        const newFixedCost = {
          id: response.data.data?.id || Date.now(),
          categoria_egreso_id: formData.selectedCategory.id,
          categoria_nombre: formData.selectedCategory.nombre,
          monto_mensual: parseFloat(formData.amount),
          descripcion: formData.description,
          activo: 1,
          fecha_creacion: new Date().toISOString(),
        };

        setFixedCosts((prevCosts: any) => [newFixedCost, ...prevCosts]);

        Alert.alert("Éxito", "Costo fijo guardado correctamente");
        setModalVisible(false);
        clearForm();
      }
    } catch (error: any) {
      console.error("❌ Error:", error);
      const errorMessage = error.response?.data?.message || "Error al guardar";
      Alert.alert("Error", errorMessage);
    } finally {
      setSavingCost(false); // Desactivar estado de carga
    }
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
            <Text style={styles.titleHeader}>Costos fijos</Text>
          </View>
        </View>

        <ScrollView style={styles.containerContent}>
          {/* Card con el total */}
          <View style={styles.cardTotal}>
            <Text style={styles.totalLabel}>Total Costos Fijos Mensuales</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(totalMensual)}
            </Text>
            <Text style={styles.totalSubtext}>
              {fixedCosts.filter((c: any) => c.activo).length} costos activos
            </Text>
          </View>

          {/* Botón Agregar Costo Fijo */}
          <Pressable
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <View style={styles.buttonContent}>
              <Feather name="plus" size={16} color="white" />
              <Text style={styles.buttonText}>Agregar Costo Fijo</Text>
            </View>
          </Pressable>

          {/* Lista de costos fijos o estado vacío */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Cargando costos fijos...</Text>
            </View>
          ) : fixedCosts.length > 0 ? (
            <View style={styles.costsContainer}>
              <Text style={styles.sectionTitle}>Costos Fijos Configurados</Text>
              {fixedCosts.map((cost: any) => (
                <FixedCostCard
                  key={cost.id}
                  cost={cost}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </View>
          ) : (
            /* Estado vacío */
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.dollarIcon}>$</Text>
              </View>
              <Text style={styles.emptyTitle}>
                No hay costos fijos configurados
              </Text>
              <Text style={styles.emptySubtitle}>
                Los costos fijos son gastos recurrentes que tu negocio debe
                pagar independientemente de su actividad o ventas.
              </Text>

              {/* Botón Configurar mi primer costo fijo */}
              <Pressable
                style={styles.configureButton}
                onPress={() => setModalVisible(true)}
              >
                <View style={styles.buttonContent}>
                  <Feather name="plus" size={16} color="#3b82f6" />
                  <Text style={styles.configureButtonText}>
                    Configurar mi primer costo fijo
                  </Text>
                </View>
              </Pressable>
            </View>
          )}
        </ScrollView>

        {/* Modal para agregar/editar costo fijo */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContent}>
                  {/* Header del modal */}
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      {editingCost ? "Editar Costo Fijo" : "Nuevo Costo Fijo"}
                    </Text>
                    <Pressable
                      style={styles.closeButton}
                      onPress={() => {
                        setModalVisible(false);
                        clearForm();
                      }}
                    >
                      <Feather name="x" size={20} color="#6b7280" />
                    </Pressable>
                  </View>

                  <Text style={styles.modalSubtitle}>
                    {editingCost
                      ? "Modifica los datos del costo fijo"
                      : "Agrega un nuevo costo fijo mensual"}
                  </Text>

                  {/* Formulario */}
                  <View style={styles.formContainer}>
                    {/* Categoría */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Categoría</Text>
                      <View style={styles.dropdownContainer}>
                        <Pressable
                          style={[
                            styles.selectInput,
                            showCategoryDropdown && styles.selectInputActive,
                          ]}
                          onPress={() => {
                            console.log("Presionando selector de categoría");
                            setShowCategoryDropdown(!showCategoryDropdown);
                          }}
                        >
                          <Text
                            style={[
                              styles.selectPlaceholder,
                              formData.selectedCategory && styles.selectedText,
                            ]}
                          >
                            {formData.selectedCategory
                              ? formData.selectedCategory.nombre
                              : "Selecciona una categoría"}
                          </Text>
                          <Feather
                            name={
                              showCategoryDropdown
                                ? "chevron-up"
                                : "chevron-down"
                            }
                            size={16}
                            color="#6b7280"
                          />
                        </Pressable>

                        {showCategoryDropdown && (
                          <View style={styles.dropdownList}>
                            <ScrollView
                              style={styles.dropdownScroll}
                              nestedScrollEnabled={true}
                            >
                              {fixedCostCategories.map((item: any) => (
                                <Pressable
                                  key={item.id}
                                  style={[
                                    styles.dropdownItem,
                                    formData.selectedCategory?.id === item.id &&
                                      styles.selectedDropdownItem,
                                  ]}
                                  onPress={() => handleCategorySelect(item)}
                                >
                                  <View style={styles.dropdownItemContent}>
                                    <View style={styles.dropdownItemLeft}>
                                      <Text
                                        style={[
                                          styles.dropdownItemText,
                                          formData.selectedCategory?.id ===
                                            item.id &&
                                            styles.selectedDropdownItemText,
                                        ]}
                                      >
                                        {item.nombre}
                                      </Text>
                                      {item.descripcion && (
                                        <Text
                                          style={styles.dropdownItemDescription}
                                        >
                                          {item.descripcion}
                                        </Text>
                                      )}
                                    </View>
                                    {formData.selectedCategory?.id ===
                                      item.id && (
                                      <Feather
                                        name="check"
                                        size={16}
                                        color="#3b82f6"
                                      />
                                    )}
                                  </View>
                                </Pressable>
                              ))}
                            </ScrollView>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Monto Mensual */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Monto Mensual</Text>
                      <View style={styles.amountInputContainer}>
                        <Text style={styles.currencySymbol}>$</Text>
                        <TextInput
                          style={styles.amountInput}
                          placeholder="0"
                          value={formData.amount}
                          onChangeText={(value) =>
                            updateFormData("amount", value)
                          }
                          keyboardType="numeric"
                          placeholderTextColor="#9ca3af"
                        />
                      </View>
                    </View>

                    {/* Descripción */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Descripción</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Describe los detalles de este costo fijo..."
                        value={formData.description}
                        onChangeText={(value) =>
                          updateFormData("description", value)
                        }
                        multiline
                        numberOfLines={3}
                        placeholderTextColor="#9ca3af"
                      />
                    </View>
                  </View>

                  {/* Botones */}
                  <View style={styles.modalButtons}>
                    <Pressable
                      style={[
                        styles.saveButton,
                        savingCost && styles.saveButtonDisabled,
                      ]}
                      onPress={handleSaveFixedCost}
                      disabled={savingCost}
                    >
                      <View style={styles.saveButtonContent}>
                        {savingCost && (
                          <View style={styles.loadingSpinner}>
                            <Text style={styles.loadingDot}>●</Text>
                          </View>
                        )}
                        <Text
                          style={[
                            styles.saveButtonText,
                            savingCost && styles.saveButtonTextDisabled,
                          ]}
                        >
                          {savingCost
                            ? editingCost
                              ? "Actualizando..."
                              : "Guardando..."
                            : editingCost
                            ? "Actualizar"
                            : "Guardar"}
                        </Text>
                      </View>
                    </Pressable>

                    <Pressable
                      style={styles.cancelButton}
                      onPress={() => {
                        setModalVisible(false);
                        clearForm();
                      }}
                      disabled={savingCost}
                    >
                      <Text
                        style={[
                          styles.cancelButtonText,
                          savingCost && styles.cancelButtonTextDisabled,
                        ]}
                      >
                        Cancelar
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </LayoutMain>
    </PaperProvider>
  );
}
const styles = StyleSheet.create({
  // Header mejorado
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

  // Container principal mejorado
  containerContent: {
    padding: 24,
    backgroundColor: "#f8fafc",
    flex: 1,
  },

  // Card total rediseñado
  cardTotal: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.1)",
  },
  totalLabel: {
    fontSize: 15,
    color: "#64748b",
    marginBottom: 8,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#16a34a",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  totalSubtext: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 6,
    fontWeight: "500",
  },

  // Botón agregar mejorado
  addButton: {
    backgroundColor: "#16a34a",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 28,
    alignItems: "center",
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.4,
  },

  // Estados de carga mejorados
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 60,
    backgroundColor: "white",
    borderRadius: 16,
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },

  // Container de costos mejorado
  costsContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 20,
    letterSpacing: 0.3,
  },

  // Estado vacío rediseñado
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: "white",
    borderRadius: 20,
    marginTop: 20,
    paddingHorizontal: 30,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    backgroundColor: "#f0fdf4",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    borderWidth: 3,
    borderColor: "#bbf7d0",
  },
  dollarIcon: {
    fontSize: 40,
    color: "#16a34a",
    fontWeight: "900",
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 10,
    marginBottom: 40,
    fontWeight: "400",
  },
  configureButton: {
    borderWidth: 2,
    borderColor: "#16a34a",
    backgroundColor: "white",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  configureButtonText: {
    color: "#16a34a",
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // Modal rediseñado
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 28,
    width: "100%",
    maxWidth: 420,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    letterSpacing: 0.3,
  },
  closeButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: "#f1f5f9",
  },
  modalSubtitle: {
    fontSize: 15,
    color: "#64748b",
    marginBottom: 32,
    lineHeight: 22,
    fontWeight: "500",
  },

  // Formulario mejorado
  formContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    letterSpacing: 0.2,
  },

  // Dropdown mejorado
  dropdownContainer: {
    position: "relative",
    zIndex: 1000,
  },
  selectInput: {
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    minHeight: 56,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectInputActive: {
    borderColor: "#16a34a",
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    shadowOpacity: 0.1,
  },
  dropdownList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#16a34a",
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    maxHeight: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 1001,
  },
  dropdownScroll: {
    maxHeight: 220,
  },
  dropdownItem: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  selectedDropdownItem: {
    backgroundColor: "#f0fdf4",
  },
  dropdownItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownItemLeft: {
    flex: 1,
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  selectedDropdownItemText: {
    color: "#16a34a",
    fontWeight: "600",
  },
  dropdownItemDescription: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    fontWeight: "400",
  },
  selectPlaceholder: {
    color: "#94a3b8",
    fontSize: 16,
    fontWeight: "400",
  },
  selectedText: {
    color: "#1e293b",
    fontWeight: "500",
  },

  // Input de monto mejorado
  amountInputContainer: {
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    minHeight: 56,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  currencySymbol: {
    paddingLeft: 18,
    fontSize: 18,
    color: "#16a34a",
    fontWeight: "700",
  },
  amountInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 17,
    color: "#1e293b",
    fontWeight: "500",
  },

  // Input de texto mejorado
  textInput: {
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: "#1e293b",
    textAlignVertical: "top",
    minHeight: 120,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    fontWeight: "400",
    lineHeight: 24,
  },

  // Botones del modal mejorados
  modalButtons: {
    gap: 16,
  },
  saveButton: {
    backgroundColor: "#16a34a",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#94a3b8",
    opacity: 0.8,
    shadowOpacity: 0.1,
  },
  saveButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  saveButtonTextDisabled: {
    color: "#f1f5f9",
  },
  loadingSpinner: {
    marginRight: 10,
  },
  loadingDot: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cancelButtonText: {
    color: "#64748b",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  cancelButtonTextDisabled: {
    color: "#cbd5e1",
  },
});

export default FixedCosts;
