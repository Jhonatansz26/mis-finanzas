import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import React, { Dispatch, SetStateAction, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import api from "../../api/apiConfig"; // ✅ Agregar import de api
import { Detalle } from "../../utils/types/transaction";
import { formatDatetimeToTime, formatPriceToColombianPrice } from "../../utils/formatFunctions";

interface IncomeModalProps {
  isModalVisible: boolean;
  setIsModalVisible: Dispatch<SetStateAction<boolean>>;
  transactionData: ModalObject;
  onTransactionDeleted?: () => void; // ✅ Callback cuando se elimina
}

interface ModalObject {
  id?: string | number; // ✅ Agregar ID de la transacción
  fecha: string;
  monto_total: string;
  detalles: Detalle[];
}

function IncomeModal({
  isModalVisible,
  setIsModalVisible,
  transactionData,
  onTransactionDeleted,
}: IncomeModalProps) {
  const [loading, setLoading] = useState(false);

  const formatQuantity = (quantity: any) => {
    const num = parseFloat(quantity);
    return num % 1 === 0
      ? num.toString()
      : num.toFixed(3).replace(/\.?0+$/, "");
  };

  // ✅ Función para eliminar transacción
  const handleDeleteTransaction = async () => {
    if (!transactionData.id) {
      Alert.alert("Error", "No se puede eliminar: ID de transacción no encontrado");
      return;
    }

    // Confirmar eliminación
    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de que deseas eliminar esta transacción de ${formatPriceToColombianPrice(transactionData.monto_total)}?`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              
              // ✅ Usando api config
              await api.delete(`transactions/${transactionData.id}`);

              // ✅ Éxito
              Alert.alert(
                "Transacción eliminada",
                "La transacción se eliminó correctamente",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      setIsModalVisible(false);
                      // ✅ Notificar al componente padre para actualizar lista
                      onTransactionDeleted?.();
                    }
                  }
                ]
              );

            } catch (error: any) {
              console.error("Error al eliminar transacción:", error);
              const errorMessage = error.response?.data?.message || 
                                 error.message || 
                                 "No se pudo eliminar la transacción. Intente nuevamente.";
              Alert.alert("Error", errorMessage);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <Modal visible={isModalVisible} transparent={true} animationType="fade">
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setIsModalVisible(false)}
      >
        <Pressable
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalles de Transacción</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <AntDesign name="close" size={20} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.transactionHeader}>
            <Text style={styles.transactionTime}>
              <Ionicons name="time-outline" size={14} color="#666" />{" "}
              {formatDatetimeToTime(transactionData.fecha)}
            </Text>
            <Text style={styles.productsCount}>
              {transactionData.detalles.length} productos vendidos
            </Text>
          </View>

          {/* ScrollView para la lista de productos */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.productsList}>
              {transactionData.detalles.map((producto: any, index: any) => (
                <View key={producto.id} style={styles.productDetailRow}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{producto.nombre}</Text>
                    <Text style={styles.productQuantityPrice}>
                      {formatQuantity(producto.cantidad)} x{" "}
                      {formatPriceToColombianPrice(producto.precio_unitario)}
                    </Text>
                  </View>
                  <Text style={styles.productSubtotal}>
                    {formatPriceToColombianPrice(producto.subtotal)}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total de la transacción</Text>
            <Text style={styles.totalAmount}>
              {formatPriceToColombianPrice(transactionData.monto_total)}
            </Text>
          </View>
          
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={[styles.buttonModal, styles.cancelButton]}
              onPress={() => setIsModalVisible(false)}
              disabled={loading}
            >
              <Text>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.buttonModal, 
                styles.deleteButton,
                loading && styles.disabledButton
              ]}
              onPress={handleDeleteTransaction}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Feather name="trash-2" size={18} color="white" />
                  <Text style={styles.deleteText}>Eliminar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  cancelButton: {
    borderWidth: 1,
    borderColor: "#ddd",
  },
  deleteText: { 
    color: "white" 
  },
  deleteButton: {
    backgroundColor: "rgba(220,38,38,1)",
  },
  disabledButton: {
    backgroundColor: "rgba(220,38,38,0.5)",
  },
  buttonModal: {
    flex: 1,
    maxWidth: "45%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 6,
    flexDirection: "row",
    gap: 8,
  },
  buttonSection: {
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 1,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  transactionDetails: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
    paddingLeft: 12,
    paddingTop: 12,
    borderRadius: 8,
    paddingBottom: 4,
  },
  transactionTime: {
    fontSize: 14,
    color: "#666",
  },
  transactionTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "rgba(22,163,74,1)",
  },
  productsCount: {
    fontSize: 12,
    color: "#999",
    paddingLeft: 12,
    textAlign: "right",
  },
  productsList: {
    flex: 1,
  },
  productDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  productQuantityPrice: {
    fontSize: 13,
    color: "#666",
  },
  productSubtotal: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(22,163,74,1)",
  },
  totalSection: {
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "rgba(22,163,74,1)",
  },
});

export default IncomeModal;