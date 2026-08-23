import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import React, { Dispatch, SetStateAction, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import api from "../../api/apiConfig";

interface EgressModalProps {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  transactionData: {
    id?: string | number; // ✅ Agregar ID de la transacción
    fecha: string;
    categoria: string;
    descripcion: string;
    monto_total: string;
  };
  onTransactionDeleted?: () => void; // ✅ Callback cuando se elimina
}

function EgressModal({ 
  showModal, 
  setShowModal, 
  transactionData,
  onTransactionDeleted 
}: EgressModalProps) {
  const [loading, setLoading] = useState(false);

  const formatTime = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: any) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(price);
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
      `¿Estás seguro de que deseas eliminar esta transacción de ${formatPrice(transactionData.monto_total)}?`,
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
              
              // ✅ Usando api config (ajusta según tu configuración)
              await api.delete(`transactions/${transactionData.id}`);

              // ✅ Éxito
              Alert.alert(
                "Transacción eliminada",
                "La transacción se eliminó correctamente",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      setShowModal(false);
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
    <Modal visible={showModal} transparent={true} animationType="fade">
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setShowModal(false)}
      >
        <Pressable
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalles de Transacción</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <AntDesign name="close" size={20} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionTime}>
              <Ionicons name="time-outline" size={14} color="#666" />{" "}
              {formatTime(transactionData.fecha)}
            </Text>
          </View>
          
          <View>
            <View style={styles.containerInfo}>
              <Text style={styles.subtitleCard}>Categoria</Text>
              <Text style={styles.categoryText}>
                {transactionData.categoria}
              </Text>
              <Text style={styles.subtitleCard}>Descripcion :</Text>
              <Text style={styles.descriptionText}>
                {transactionData.descripcion}
              </Text>
            </View>
          </View>
          
          <View style={styles.separator}></View>
          
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total de la transacción</Text>
            <Text style={styles.totalAmount}>
              {formatPrice(transactionData.monto_total)}
            </Text>
          </View>

          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={[styles.buttonModal, styles.cancelButton]}
              onPress={() => setShowModal(false)}
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
    color: "rgba(220,38,38,1)",
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginTop: 20,
  },
  descriptionText: {
    color: "rgba(55,65,81,1)",
  },
  categoryText: {
    marginBottom: 8,
    fontWeight: 500,
    fontSize: 18,
  },
  subtitleCard: {
    color: "rgba(107,114,128,1)",
    fontWeight: 500,
    marginBottom: 4,
    fontSize: 14,
  },
  containerInfo: {
    backgroundColor: "rgba(249,250,251,1)",
    padding: 20,
    borderRadius: 9,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 1,
    padding: 12,
    borderRadius: 8,
  },
  transactionTime: {
    fontSize: 14,
    color: "#666",
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
});

export default EgressModal;