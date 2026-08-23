import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import IncomeComponent from "../IncomeComponent";
import ExpenditureComponent from "../ExpenditureComponent";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import ToggleTransaction from "../ToggleTransaction";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import api from "../../api/apiConfig";
import useBusinessStore from "../../hooks/useBusinessStore";

type PointOfSale = {
  id: number;
  nombre: string;
  direccion?: string;
};

function DiaryBook() {
  const [loading, setLoading] = useState<boolean>(false);
  const { activeBusiness } = useBusinessStore();

  // Estados para controlar los modales y selecciones
  const [fecha, setFecha] = useState(new Date());
  const [pointsOfSale, setPointsOfSale] = useState<PointOfSale[]>([]);
  const [sucursal, setSucursal] = useState<string>("");
  const [selectedToggle, setSelectedToggle] = useState("Ingresos");
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isBranchModalVisible, setBranchModalVisible] = useState(false);

  // Función para obtener el color según el modo actual
  const getIconColor = () => {
    return selectedToggle === "Ingresos" ? "#16a34a" : "#781b1b";
  };

  useEffect(() => {
    const fetchPointsOfSale = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          `point-sale/business/${activeBusiness?.id}/active`
        );

        // Según el log, la respuesta ya viene como un array directamente
        const pointsData = Array.isArray(response.data) ? response.data : [];
        setPointsOfSale(pointsData);

        // Establecer la primera sucursal como predeterminada si hay datos disponibles
        if (pointsData.length > 0) {
          setSucursal(pointsData[0].id.toString());
        }

        console.log("Puntos de venta:", response.data);
      } catch (error: any) {
        console.error("Error al obtener puntos de venta:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPointsOfSale();
  }, [activeBusiness]);

  // Gestión de fechas
  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirm = (selectedDate: any) => {
    setFecha(selectedDate);
    hideDatePicker();
  };

  const formattedDate = format(fecha, "EEEE, dd 'de' MMMM yyyy", {
    locale: es,
  });
  const displayDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  // Obtener el nombre de la sucursal seleccionada
  const getSelectedBranchName = () => {
    if (!sucursal || pointsOfSale.length === 0) return "Seleccionar sucursal";
    const selected = pointsOfSale.find(
      (point) => point.id.toString() === sucursal
    );
    return selected ? selected.nombre : "Seleccionar sucursal";
  };

  return (
    <ScrollView 
      style={styles.containerMainHome}
      contentContainerStyle={styles.scrollContentContainer}
    >
      {/* ToggleTransaction actualiza el estado selectedToggle */}
      <ToggleTransaction onSelectChange={setSelectedToggle} />

      {/* Header compacto con fecha y sucursal */}
      <View style={styles.compactHeader}>
        {/* Selector de fecha compacto */}
        <TouchableOpacity style={styles.dateSelector} onPress={showDatePicker}>
          <MaterialIcons name="date-range" size={18} color={getIconColor()} />
          <Text
            style={styles.dateSelectorText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {displayDate}
          </Text>
        </TouchableOpacity>

        {/* Separador */}
        <View style={styles.headerSeparator} />

        {/* Selector de sucursal compacto */}
        <TouchableOpacity
          style={styles.branchSelector}
          onPress={() => setBranchModalVisible(true)}
        >
          <AntDesign name="home" size={18} color={getIconColor()} />
          <Text
            style={styles.branchSelectorText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {loading ? "Cargando sucursales..." : getSelectedBranchName()}
          </Text>
          <AntDesign name="down" size={14} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        locale="es-ES"
      />

      {/* Modal para seleccionar sucursal */}
      <Modal
        visible={isBranchModalVisible}
        transparent={true}
        animationType="fade"
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setBranchModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar sucursal</Text>
              <TouchableOpacity onPress={() => setBranchModalVisible(false)}>
                <AntDesign name="close" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={getIconColor()} />
                <Text style={styles.loadingText}>Cargando sucursales...</Text>
              </View>
            ) : pointsOfSale.length === 0 ? (
              <Text style={styles.noDataText}>
                No hay sucursales disponibles
              </Text>
            ) : (
              pointsOfSale.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.branchOption,
                    sucursal === item.id.toString() &&
                      (selectedToggle === "Ingresos"
                        ? styles.selectedBranchOptionIncome
                        : styles.selectedBranchOptionExpense),
                  ]}
                  onPress={() => {
                    setSucursal(item.id.toString());
                    setBranchModalVisible(false);
                  }}
                >
                  <AntDesign
                    name="home"
                    size={16}
                    color={
                      sucursal === item.id.toString() ? getIconColor() : "#666"
                    }
                  />
                  <Text
                    style={[
                      styles.branchOptionText,
                      sucursal === item.id.toString() &&
                        (selectedToggle === "Ingresos"
                          ? styles.selectedBranchOptionTextIncome
                          : styles.selectedBranchOptionTextExpense),
                    ]}
                  >
                    {item.nombre}
                  </Text>
                  {sucursal === item.id.toString() && (
                    <View
                      style={[
                        styles.selectedBranchIndicator,
                        { backgroundColor: getIconColor() },
                      ]}
                    >
                      <Text style={styles.selectedBranchIndicatorText}>
                        Actual
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Contenedor principal para el componente activo */}
      <View
        style={[
          styles.transactionContainer,
          selectedToggle === "Ingresos"
            ? styles.incomesContainer
            : styles.expensesContainer,
        ]}
      >
        {/* Renderizar condicionalmente el componente según el toggle seleccionado y 
            pasar fecha y sucursal como props */}
        {selectedToggle === "Ingresos" ? (
          <IncomeComponent fecha={fecha} sucursal={sucursal} />
        ) : (
          <ExpenditureComponent fecha={fecha} sucursal={sucursal} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  containerMainHome: {
    flex: 1, 
    paddingHorizontal: 16,
    backgroundColor: "#f5f5f5",
  },

  scrollContentContainer: {
    flexGrow: 1, 
    paddingBottom: 16,
  },
  compactHeader: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 10,
    marginVertical: 12,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: "center",
  },
  dateSelector: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  dateSelectorText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  headerSeparator: {
    width: 1,
    height: 20,
    backgroundColor: "#ddd",
    marginHorizontal: 6,
  },
  branchSelector: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  branchSelectorText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "100%",
    maxHeight: "70%",
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  noDataText: {
    padding: 20,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  branchOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  selectedBranchOptionIncome: {
    backgroundColor: "#e6f7f0",
  },
  selectedBranchOptionExpense: {
    backgroundColor: "#f7e6e6",
  },
  branchOptionText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  selectedBranchOptionTextIncome: {
    color: "#16a34a",
    fontWeight: "500",
  },
  selectedBranchOptionTextExpense: {
    color: "#781b1b",
    fontWeight: "500",
  },
  selectedBranchIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedBranchIndicatorText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },

  transactionContainer: {
    flex: 1, 
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    backgroundColor: "white",
  },
  incomesContainer: {
    backgroundColor: "#e6f7f0", 
  },
  expensesContainer: {
    backgroundColor: "#f7e6e6", 
  },
});

export default DiaryBook;