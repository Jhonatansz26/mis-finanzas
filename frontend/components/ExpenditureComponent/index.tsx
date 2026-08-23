import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { AntDesign, MaterialIcons, Feather } from "@expo/vector-icons";
import api from "../../api/apiConfig";
import useBusinessStore from "../../hooks/useBusinessStore";
import { useRouter } from "expo-router";
import EgressModal from "../EgressModal";
import { Transaction } from "../../utils/types/transaction";
import TransactionExpenditureCard from "../TransactionExpenditureCard";
import {
  formatDateForMySQL,
  formatInputNumber,
  formatPriceToColombianPrice,
} from "../../utils/formatFunctions";

type ExpenseData = {
  category: string;
  amount: string;
  concept: string;
};

type CategoryType = {
  activo: number;
  descripcion: string;
  fecha_creacion: string;
  id: number;
  negocio_id: number;
  nombre: string;
  tipo_costo: string;
  ultima_actualizacion: string;
};

function ExpenditureComponent({ fecha, sucursal }: any) {
  const { activeBusiness } = useBusinessStore();
  const router = useRouter();
  const today = new Date();

  const getTodayFormatted = () => {
    const options: any = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return today.toLocaleDateString("es-ES", options);
  };

  const [isCreatingNewExpense, setIsCreatingNewExpense] =
    useState<boolean>(false);

  const [expenseData, setExpenseData] = useState<ExpenseData>({
    category: "",
    amount: "",
    concept: "",
  });
  const [showCategoryPicker, setShowCategoryPicker] = useState<boolean>(false);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingExpenses, setLoadingExpenses] = useState<boolean>(false);
  const [formattedAmount, setFormattedAmount] = useState<string>("");

  const [showTransactionModal, setShowTransactionModal] = useState<any>(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  console.log(selectedTransaction);

  useEffect(() => {
    fetchCategories();
    if (!isCreatingNewExpense) {
      fetchRecentExpenses();
    }
  }, [activeBusiness, isCreatingNewExpense]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `transactions/business/${activeBusiness?.id}/expense-categories?tipo_costo=variable`
      );
      setCategories(response.data || []);
    } catch (error: any) {
      console.error("Error al obtener categorías:", error.message);
      Alert.alert("Error", "No se pudieron cargar las categorías de gastos");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchRecentExpenses = async () => {
    try {
      setLoadingExpenses(true);
      const response = await api.get(
        `transactions/dailytransaction/${activeBusiness?.id}?fecha=${
          today.toISOString().split("T")[0]
        }&tipo=egreso`
      );
      setRecentExpenses(response.data || []);
    } catch (error: any) {
      console.error("Error al obtener gastos recientes:", error.message);
    } finally {
      setLoadingExpenses(false);
    }
  };

  const handleInputChange = (field: keyof ExpenseData, value: string) => {
    if (field === "amount") {
      const numericValue = value.replace(/\D/g, "");
      setFormattedAmount(formatInputNumber(value));
      setExpenseData({
        ...expenseData,
        [field]: numericValue,
      });
    } else {
      setExpenseData({
        ...expenseData,
        [field]: value,
      });
    }
  };

  const handleSaveExpense = async () => {
    if (!expenseData.category || !expenseData.amount || !expenseData.concept) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    const amountValue = parseFloat(expenseData.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert("Error", "El monto debe ser un número válido mayor a cero");
      return;
    }

    const dataTransaction = {
      punto_venta_id: parseInt(sucursal),
      tipo: "egreso",
      fecha: formatDateForMySQL(fecha),
      monto_total: expenseData.amount,
      categoria_id: expenseData.category,
      concepto: expenseData.concept
    };

    try {
      setLoading(true);
      const response = await api.post("transactions", dataTransaction);

      Alert.alert(
        "Gasto Registrado",
        `Se ha registrado un gasto de $${formatPriceToColombianPrice(
          amountValue.toString()
        )} en la categoría "${getCategoryName(expenseData.category)}"`
      );

      setExpenseData({ category: "", amount: "", concept: "" });
      setFormattedAmount("");
      setIsCreatingNewExpense(false);

      await fetchRecentExpenses();
    } catch (error: any) {
      console.error("Error al guardar la transacción:", error);
      const errorMessage =
        error.response?.data?.message ||
        "No se pudo guardar la transacción. Intente nuevamente.";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((cat) => cat.id.toString() === categoryId);
    return category ? category.nombre : "Sin categoría";
  };

  const calculateTotalExpenses = () => {
    const total = recentExpenses.reduce(
      (sum, expense) => sum + parseFloat(expense.monto_total),
      0
    );
    return formatPriceToColombianPrice(total.toString());
  };

  const hasCategories = categories.length > 0;

  const handleCloseModal = () => {
    setShowTransactionModal(false);
    setSelectedTransaction(null);
  };

  console.log(
    selectedTransaction ? selectedTransaction.categoria_nombre : null
  );

  const handleTransactionPress = (transaction: Transaction) => {
    // Modificar la transacción antes de seleccionarla
    const modifiedTransaction = {
      ...transaction,
      categoria_nombre: getCategoryName(
        transaction.categoria_id?.toString() || ""
      ),
    };
    setSelectedTransaction(modifiedTransaction);
    setShowTransactionModal(true);
  };

  // ✅ Función para manejar cuando se elimina una transacción
  const handleTransactionDeleted = () => {
    if (!selectedTransaction) return;

    // ✅ Eliminar la transacción del estado local (sin llamada a API)
    setRecentExpenses((prevExpenses) =>
      prevExpenses.filter((expense) => expense.id !== selectedTransaction.id)
    );

    // Limpiar estado del modal
    setSelectedTransaction(null);
    setShowTransactionModal(false);
  };

  // ✅ Preparar datos para el modal
  const modalData = selectedTransaction
    ? {
        id: selectedTransaction.id, // ✅ Incluir ID de la transacción
        fecha: selectedTransaction.fecha || "",
        categoria: selectedTransaction.categoria_nombre || "",
        descripcion: selectedTransaction.concepto || "",
        monto_total: selectedTransaction.monto_total || "",
      }
    : null;

  // Componente para mostrar cuando no hay gastos
  const renderNoExpensesMessage = () => {
    return (
      <View style={styles.noExpensesContainer}>
        <View style={styles.iconContainerShoppingBag}>
          <Feather name="shopping-bag" size={40} color="rgba(220,38,38,1)" />
        </View>
        <Text style={styles.noExpensesTextTitle}>
          No hay gastos registrados
        </Text>
        <Text style={styles.noExpensesTextSubtitle}>
          No has registrado ningún gasto para el día de hoy. ¡Comienza agregando
          tu primer gasto!
        </Text>
        <Text style={styles.noExpensesTextSubtitleDate}>
          <Feather name="calendar" size={16} color="rgba(209,213,219,1)" />
          {` ${getTodayFormatted()}`}
        </Text>
      </View>
    );
  };

  if (!hasCategories && !loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Gestión de Gastos</Text>
        <View style={styles.noCategoriesContainer}>
           <AntDesign name="inbox" size={60} color="#ddd" />
          <Text style={styles.noCategoriesText}>
            No hay categorías de gastos disponibles
          </Text>
          <Text style={styles.noCategoriesSubText}>
            Debe crear categorías de gastos en la sección configuraciones
          </Text>
          <TouchableOpacity
            style={styles.arrowContainer}
            onPress={() => router.push("/settings/costs/new")}
          >
            <Text style={styles.arrowText}>Ir a configuraciones</Text>
            <Feather name="arrow-right" size={24} color="#781b1b" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Loading inicial
  if (loading && categories.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#781b1b" style={styles.loader} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        {isCreatingNewExpense ? "Registrar Nuevo Gasto" : "Gestión de Gastos"}
      </Text>

      {isCreatingNewExpense ? (
        // FORMULARIO DE NUEVO GASTO
        <ScrollView
          style={styles.scrollView}
        >
          {/* Selector de categoría */}
          <TouchableOpacity
            style={styles.categorySelector}
            onPress={() => setShowCategoryPicker(true)}
          >
            <Text style={styles.selectorLabel}>Categoría</Text>
            <View style={styles.selectorContent}>
              {expenseData.category ? (
                <View style={styles.selectedCategory}>
                 
                  <Text style={styles.selectedCategoryText}>
                    {getCategoryName(expenseData.category)}
                  </Text>
                </View>
              ) : (
                <Text style={styles.placeholderText}>
                  Seleccionar categoría
                </Text>
              )}
              <AntDesign name="down" size={14} color="#999" />
            </View>
          </TouchableOpacity>

          {/* Input de Monto */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Monto</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                keyboardType="numeric"
                value={formattedAmount}
                onChangeText={(value) => handleInputChange("amount", value)}
              />
            </View>
          </View>

          {/* Input de Concepto */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Concepto</Text>
            <TextInput
              style={styles.conceptInput}
              placeholder="Descripción del gasto"
              value={expenseData.concept}
              onChangeText={(value) => handleInputChange("concept", value)}
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Botones de acción */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsCreatingNewExpense(false);
                setExpenseData({ category: "", amount: "", concept: "" });
                setFormattedAmount("");
              }}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                (!expenseData.category ||
                  !expenseData.amount ||
                  !expenseData.concept) &&
                  styles.disabledButton,
              ]}
              onPress={handleSaveExpense}
              disabled={
                !expenseData.category ||
                !expenseData.amount ||
                !expenseData.concept ||
                loading
              }
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Guardar Gasto</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Total */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Monto:</Text>
            <Text style={styles.totalAmount}>
              {expenseData.amount
                ? formatPriceToColombianPrice(expenseData.amount)
                : "0.00"}
            </Text>
          </View>
        </ScrollView>
      ) : (
        // VISTA PRINCIPAL
        <>
          <ScrollView
            style={styles.scrollView}
          >
            {/* Botones principales */}
            <View style={styles.mainButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push("/settings/costs/new")}
              >
                <MaterialIcons
                                    name="attach-money"
                                    size={20}
                                    color="#781b1b"
                                  />
                <Text style={styles.actionButtonText}>Nueva Categoría</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.primaryActionButton]}
                onPress={() => setIsCreatingNewExpense(true)}
              >
                <AntDesign name="plus" size={20} color="white" />
                <Text
                  style={[
                    styles.actionButtonText,
                    styles.primaryActionButtonText,
                  ]}
                >
                  Nuevo Gasto
                </Text>
              </TouchableOpacity>
            </View>

            {/* Gastos recientes */}
            <View style={styles.recentExpensesSection}>
              <Text style={styles.recentExpensesTitle}>Gastos de Hoy</Text>

              {loadingExpenses ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#781b1b" />
                  <Text style={styles.loadingText}>Cargando gastos...</Text>
                </View>
              ) : recentExpenses.length === 0 ? (
                renderNoExpensesMessage()
              ) : (
                <View>
                  {recentExpenses.map((expense, index) => {
                    // ✅ Crear objeto modificado inline
                    const modifiedExpense = {
                      ...expense,
                      categoria_nombre: getCategoryName(
                        expense.categoria_id?.toString() || ""
                      ),
                    };

                    return (
                      <TransactionExpenditureCard
                        onPress={handleTransactionPress}
                        transactionData={modifiedExpense}
                        key={index}
                      />
                    );
                  })}
                </View>
              )}
            </View>

            {/* ✅ UN solo modal compartido al final */}
            {modalData && (
              <EgressModal
                showModal={showTransactionModal}
                setShowModal={handleCloseModal}
                transactionData={modalData}
                onTransactionDeleted={handleTransactionDeleted}
              />
            )}
          </ScrollView>

          {/* Total de gastos del día - Siempre visible en la parte inferior */}
          <View style={styles.totalContainerFixed}>
            <Text style={styles.totalLabel}>Total de Hoy:</Text>
            <Text style={styles.totalAmount}>
              {recentExpenses.length > 0 ? calculateTotalExpenses() : "$0.00"}
            </Text>
          </View>
        </>
      )}

      {/* Modal para seleccionar categoría */}
      <Modal
        visible={showCategoryPicker}
        transparent={true}
        animationType="fade"
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCategoryPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar categoría</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <AntDesign name="close" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={categories}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryOption,
                    expenseData.category === item.id.toString() &&
                      styles.selectedCategoryOption,
                  ]}
                  onPress={() => {
                    handleInputChange("category", item.id.toString());
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      expenseData.category === item.id.toString() &&
                        styles.selectedCategoryOptionText,
                    ]}
                  >
                    {item.nombre}
                  </Text>
                  {expenseData.category === item.id.toString() && (
                    <View style={styles.selectedCategoryIndicator}>
                      <Text style={styles.selectedCategoryIndicatorText}>
                        Seleccionado
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainerShoppingBag: {
    backgroundColor: "rgba(254,226,226,1)",
    height: 70,
    width: 70,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 35,
  },
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#781b1b",
    marginBottom: 16,
    textAlign: "center",
  },

  // Estado sin categorías
  noCategoriesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noCategoriesText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    textAlign: "center",
  },
  noCategoriesSubText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  arrowContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7e6e6",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  arrowText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#781b1b",
    marginRight: 8,
  },

  // Botones principales
  mainButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  primaryActionButton: {
    backgroundColor: "#781b1b",
    borderColor: "#781b1b",
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#781b1b",
  },
  primaryActionButtonText: {
    color: "white",
  },

  // Gastos recientes
  recentExpensesSection: {
    marginBottom: 16,
  },
  recentExpensesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 8,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#666",
  },
  noExpensesContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 26,
    backgroundColor: "white",
    borderRadius: 12,
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "rgba(209,213,219,1)",
  },
  noExpensesTextTitle: {
    marginTop: 12,
    fontSize: 16,
    color: "black",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 10,
  },
  noExpensesTextSubtitle: {
    color: "#999",
    textAlign: "center",
    marginBottom: 25,
  },
  noExpensesTextSubtitleDate: {
    color: "rgba(156, 163, 175,1)",
  },
  expenseCard: {
    height: "auto",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.3)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  expenseCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  expenseCategory: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  expenseCategoryText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#781b1b",
  },
  expenseConcept: {
    fontSize: 13,
    color: "#333",
    marginBottom: 4,
    lineHeight: 18,
  },
  expenseTime: {
    fontSize: 11,
    color: "#666",
    textAlign: "right",
  },

  // Formulario
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },

  // Selector de categoría
  categorySelector: {
    marginBottom: 10,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  selectorContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedCategory: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedCategoryText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
  },

  // Inputs
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 20,
    color: "#781b1b",
    marginRight: 8,
    fontWeight: "600",
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 12,
    fontWeight: "500",
  },
  conceptInput: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: 10,
  },

  // Botón guardar
  saveButton: {
    flex: 2,
    backgroundColor: "#781b1b",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#d8a0a0",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  // Total
  totalContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  // Total fijo en la parte inferior
  totalContainerFixed: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#781b1b",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#781b1b",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },

  // Opciones de categoría
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedCategoryOption: {
    backgroundColor: "#f7e6e6",
    borderColor: "#781b1b",
  },
  categoryOptionText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  selectedCategoryOptionText: {
    color: "#781b1b",
    fontWeight: "600",
  },
  selectedCategoryIndicator: {
    backgroundColor: "#781b1b",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedCategoryIndicatorText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default ExpenditureComponent;
