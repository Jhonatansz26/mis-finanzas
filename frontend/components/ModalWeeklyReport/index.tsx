import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import WeeklyReportHeader from "../WeeklyReportHeader";
import WeeklySummaryCards from "../WeeklySummaryCards";
import DailyPerformanceChart from "../DailyPerformanceChart";
import FeaturedProductsList from "../FeaturedProductsList";
import * as XLSX from "xlsx";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import api from "../../api/apiConfig";
import useBusinessStore from "../../hooks/useBusinessStore";

function ModalWeeklyReport({ showModal, setShowModal, fecha }: any) {
  const { activeBusiness } = useBusinessStore();
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  console.log(fecha);

  useEffect(() => {
    fetchModalInfo();
    console.log("hola");
  }, [fecha]);

  const fetchModalInfo = async () => {
    try {
      const response = await api.get(
        `analytics/weekreport/${activeBusiness?.id}?fecha=${formatDateForAPI(
          fecha
        )}`
      );
      console.log(response);
    } catch (error: any) {
      console.error("Error fetching modal info:", error);
    }
  };

  const sampleData = [
    {
      id: 1,
      nombre: "Juan Pérez",
      email: "juan@email.com",
      edad: 30,
      salario: 50000,
    },
    {
      id: 2,
      nombre: "María García",
      email: "maria@email.com",
      edad: 25,
      salario: 45000,
    },
    {
      id: 3,
      nombre: "Carlos López",
      email: "carlos@email.com",
      edad: 35,
      salario: 60000,
    },
    {
      id: 4,
      nombre: "Ana Martínez",
      email: "ana@email.com",
      edad: 28,
      salario: 52000,
    },
  ];

  const exportToExcel = async () => {
    try {
      setIsExporting(true);

      // Crear un nuevo workbook
      const wb = XLSX.utils.book_new();

      // Convertir datos a worksheet
      const ws = XLSX.utils.json_to_sheet(sampleData);

      // Configurar el ancho de las columnas
      ws["!cols"] = [
        { wch: 5 },   // id
        { wch: 20 },  // nombre
        { wch: 25 },  // email
        { wch: 8 },   // edad
        { wch: 12 },  // salario
      ];

      // Agregar encabezados personalizados
      XLSX.utils.sheet_add_aoa(
        ws,
        [["ID", "Nombre Completo", "Correo Electrónico", "Edad", "Salario"]],
        { origin: "A1" }
      );

      // Agregar la hoja al workbook
      XLSX.utils.book_append_sheet(wb, ws, "Empleados");

      // Generar el archivo Excel como buffer en base64
      const wbout = XLSX.write(wb, {
        type: "base64",
        bookType: "xlsx",
      });

      // Crear archivo usando la nueva API
      const file = new File(Paths.cache, "empleados.xlsx");
      
      // Escribir el contenido base64 al archivo
      await file.write(wbout, { encoding: "base64" });

      // Verificar si el archivo existe
      if (!file.exists) {
        throw new Error("No se pudo crear el archivo");
      }

      // Compartir el archivo
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(file.uri, {
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          dialogTitle: "Compartir archivo Excel",
          UTI: "com.microsoft.excel.xlsx",
        });
        
        Alert.alert("Éxito", "Archivo Excel exportado correctamente");
      } else {
        Alert.alert("Error", "La función de compartir no está disponible");
      }
    } catch (error) {
      console.error("Error al exportar:", error);
      Alert.alert("Error", `No se pudo exportar el archivo Excel: ${error}`);
    } finally {
      setIsExporting(false);
    }
  };

  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <Modal
      visible={showModal}
      transparent={true}
      animationType="fade"
      style={styles.modal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Fixed Header */}
          <View style={styles.header}>
            <WeeklyReportHeader />
          </View>

          {/* Scrollable content */}
          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contentPadding}>
              <WeeklySummaryCards />
              <DailyPerformanceChart />
              <FeaturedProductsList />

              {/* Action buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.exportButton,
                    isExporting && styles.exportButtonDisabled,
                  ]}
                  onPress={exportToExcel}
                  disabled={isExporting}
                >
                  <MaterialIcons name="description" size={20} color="white" />
                  <Text style={styles.exportButtonText}>
                    {isExporting ? "Exportando..." : "Exportar Excel"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.shareButton}>
                  <MaterialIcons name="share" size={20} color="#10B981" />
                  <Text style={styles.shareButtonText}>Compartir</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <MaterialIcons name="close" size={20} color="#64748B" />
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {},
  modalOverlay: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  modalContent: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    width: "100%",
    height: "90%",
    flexDirection: "column",
  },
  header: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingTop: 0,
  },
  contentPadding: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  exportButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flex: 1,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  shareButton: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flex: 1,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  shareButtonText: {
    color: "#10B981",
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },
  closeButtonText: {
    color: "#64748B",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ModalWeeklyReport;