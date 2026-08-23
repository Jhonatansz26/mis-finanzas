import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import TransactionItem from "../TransactionItem";
import IncomeModal from "../IncomeModal";
import EgressModal from "../EgressModal";
import api from "../../api/apiConfig";
import useBusinessStore from "../../hooks/useBusinessStore";
import {
  BusinessDailySummary,
  Summary,
  Transaction,
} from "../../utils/types/transaction";

function RecentTransactions() {
  const [fecha, setFecha] = useState<Date>(new Date());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { activeBusiness } = useBusinessStore();

  // ✅ Estado para modales compartidos
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showEgressModal, setShowEgressModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [modalData, setModalData] = useState<any>(null);

  // ✅ Función para formatear fecha en zona horaria colombiana
  const formatDateForAPI = (date: Date): string => {
    // Crear una nueva fecha ajustada a la zona horaria colombiana (UTC-5)
    const colombianDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    
    // Formatear como YYYY-MM-DD
    const year = colombianDate.getFullYear();
    const month = String(colombianDate.getMonth() + 1).padStart(2, '0');
    const day = String(colombianDate.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  // ✅ Función alternativa más precisa para zona horaria colombiana
  const formatDateForAPIPrecise = (date: Date): string => {
    // Convertir explícitamente a zona horaria de Colombia (America/Bogota)
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };
    
    const parts = new Intl.DateTimeFormat('en-CA', options).format(date);
    return parts; // Retorna en formato YYYY-MM-DD
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);

        // ✅ Usar la función de formateo corregida
        const formattedDate = formatDateForAPIPrecise(fecha);
        console.log("Fecha seleccionada:", fecha);
        console.log("Fecha formateada para API:", formattedDate);

        const response = await api.get<BusinessDailySummary>(
          `transactions/business/${activeBusiness?.id}?fecha=${formattedDate}`
        );

        console.log("Respuesta de API:", response.data);
        setTransactions(response.data.transactions || []);
        setSummary(response.data.summary || null);
      } catch (error) {
        console.error("Error al obtener transacciones:", error);
      } finally {
        setLoading(false);
      }
    };

    if (activeBusiness?.id) {
      fetchTransactions();
    }
  }, [activeBusiness, fecha]);

  // ✅ Función para manejar clic en transacción
  const handleTransactionPress = (transaction: Transaction, data: any) => {
    setSelectedTransaction(transaction);
    setModalData(data.modalData);
    
    if (data.transformedTransaction.tipo === "Ingreso") {
      setShowIncomeModal(true);
    } else {
      setShowEgressModal(true);
    }
  };

  // ✅ Función para manejar cuando se elimina una transacción
  const handleTransactionDeleted = () => {
    if (!selectedTransaction) return;
    
    // ✅ Eliminar la transacción del estado local
    setTransactions(prevTransactions => 
      prevTransactions.filter(transaction => transaction.id !== selectedTransaction.id)
    );
    
    // ✅ Recalcular summary si existe
    if (summary && selectedTransaction) {
      const deletedAmount = parseFloat(selectedTransaction.monto_total);
      const updatedSummary = { ...summary };
      
      if (selectedTransaction.tipo === "ingreso") {
        updatedSummary.totalIngresos -= deletedAmount;
      } else {
        updatedSummary.totalEgresos -= deletedAmount;
      }
      
      updatedSummary.balance = updatedSummary.totalIngresos - updatedSummary.totalEgresos;
      setSummary(updatedSummary);
    }
    
    // Limpiar estado
    setSelectedTransaction(null);
    setModalData(null);
    setShowIncomeModal(false);
    setShowEgressModal(false);
  };

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirm = (selectedDate: Date) => {
    console.log("Fecha seleccionada en picker:", selectedDate);
    setFecha(selectedDate);
    hideDatePicker();
  };

  // ✅ Formatear fecha para mostrar en pantalla
  const formattedDate = format(fecha, "EEEE, dd 'de' MMMM yyyy", {
    locale: es,
  });
  const displayDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // ✅ Usar la función de formateo corregida también en refresh
      const formattedDate = formatDateForAPIPrecise(fecha);
      const response = await api.get<BusinessDailySummary>(
        `transactions/business/${activeBusiness?.id}?fecha=${formattedDate}`
      );

      setTransactions(response.data.transactions || []);
      setSummary(response.data.summary || null);
    } catch (error) {
      console.error("Error al refrescar:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Función para renderizar el esqueleto cuando no hay transacciones
  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="event-busy" size={64} color="#ddd" />
        <Text style={styles.emptyTitle}>No hay transacciones</Text>
        <Text style={styles.emptySubtitle}>
          En esta fecha no se registraron transacciones
        </Text>
      </View>
    );
  };

  // Función para renderizar el componente de carga
  const renderLoading = () => {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Cargando transacciones...</Text>
      </View>
    );
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity onPress={showDatePicker} style={styles.dateSelector}>
          <Text style={styles.dateText}>{displayDate}</Text>
          <MaterialIcons name="date-range" size={24} color="#555" />
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          locale="es-ES"
          timeZoneOffsetInMinutes={-300} // ✅ UTC-5 para Colombia (300 minutos)
        />

        {loading ? (
          renderLoading()
        ) : (
          <View style={styles.contentContainer}>
            <FlatList
              data={transactions}
              renderItem={({ item }) => (
                <TransactionItem 
                  item={item} 
                  onPress={handleTransactionPress} // ✅ Callback
                />
              )}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={[
                styles.listContainer,
                transactions.length === 0 && styles.emptyListContainer,
              ]}
              style={styles.flatList}
              showsVerticalScrollIndicator={true}
              onRefresh={onRefresh}
              refreshing={refreshing}
              ListEmptyComponent={renderEmptyState}
            />

            {summary && (
              <View style={styles.summaryContainer}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Ingresos:</Text>
                  <Text style={styles.summaryIngresos}>
                    +${summary.totalIngresos.toLocaleString("es-CO")}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Egresos:</Text>
                  <Text style={styles.summaryEgresos}>
                    -${summary.totalEgresos.toLocaleString("es-CO")}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Balance:</Text>
                  <Text
                    style={[
                      styles.summaryBalance,
                      summary.balance >= 0
                        ? styles.positiveBalance
                        : styles.negativeBalance,
                    ]}
                  >
                    {summary.balance < 0 ? "-" : "+"}$
                    {Math.abs(summary.balance).toLocaleString("es-CO")}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ✅ Modales compartidos */}
        {modalData && showIncomeModal && (
          <IncomeModal
            isModalVisible={showIncomeModal}
            setIsModalVisible={setShowIncomeModal}
            transactionData={modalData}
            onTransactionDeleted={handleTransactionDeleted}
          />
        )}

        {modalData && showEgressModal && (
          <EgressModal
            showModal={showEgressModal}
            setShowModal={setShowEgressModal}
            transactionData={modalData}
            onTransactionDeleted={handleTransactionDeleted}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    overflow: "hidden",
  },
  contentContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  dateSelector: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    height: 55,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  listContainer: {
    paddingBottom: 16,
  },
  emptyListContainer: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 4,
  },
  // Estilos para el estado vacío
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  // Estilos para el estado de carga
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
  },
  // Estilos para el resumen
  summaryContainer: {
    backgroundColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    bottom: 0,
    width: "100%",
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#4b5563",
    fontWeight: "500",
  },
  summaryIngresos: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#16a34a",
  },
  summaryEgresos: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#b91c1c",
  },
  summaryBalance: {
    fontSize: 18,
    fontWeight: "bold",
  },
  positiveBalance: {
    color: "#16a34a",
  },
  negativeBalance: {
    color: "#b91c1c",
  },
});

export default RecentTransactions;