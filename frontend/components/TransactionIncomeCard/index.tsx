import { Ionicons, AntDesign } from "@expo/vector-icons";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { TransactionWithDetails } from "../../utils/types/transaction";

interface TransactionCardProps {
  transactionData: TransactionWithDetails;
  onPress: (transaction: TransactionWithDetails) => void; // ✅ Callback para manejar el clic
}

const TransactionCard = ({ transactionData, onPress }: TransactionCardProps) => {
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

  const formatQuantity = (quantity: any) => {
    const num = parseFloat(quantity);
    return num % 1 === 0
      ? num.toString()
      : num.toFixed(3).replace(/\.?0+$/, "");
  };

  const { detalles: Detalle, monto_total, fecha } = transactionData;
  const visibleProducts = transactionData.detalles.slice(0, 2);
  const hasMoreProducts = transactionData.detalles.length > 2;

  return (
    <TouchableOpacity
      style={styles.transactionCard}
      onPress={() => onPress(transactionData)} // ✅ Delega al padre
    >
      <View style={styles.headerSection}>
        <Text style={styles.dateTime}>
          <Ionicons name="time-outline" size={12} color="black" />{" "}
          {formatTime(fecha)}
        </Text>
        <Text style={styles.mainAmount}>{formatPrice(monto_total)}</Text>
      </View>

      <Text style={styles.transactions}>
        {transactionData.detalles.length} productos
      </Text>

      {visibleProducts.map((producto: any, index: any) => (
        <View key={producto.id} style={styles.productRow}>
          <Text style={styles.details}>{producto.nombre}</Text>
          <Text style={styles.subAmount}>
            {formatQuantity(producto.cantidad)}x{" "}
            {formatPrice(producto.precio_unitario)}
          </Text>
        </View>
      ))}

      {hasMoreProducts && (
        <View style={styles.moreItemsContainer}>
          <Text style={styles.moreItems}>
            +{transactionData.detalles.length - 2} más...
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  transactionCard: {
    height: "auto",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "rgba(187,247,208,1)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dateTime: {
    fontSize: 12,
    color: "#666",
    alignItems: "center",
  },
  transactions: {
    fontSize: 11,
    color: "#999",
    marginBottom: 8,
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  details: {
    fontSize: 13,
    color: "#333",
    flex: 1,
  },
  subAmount: {
    fontSize: 11,
    color: "#666",
    textAlign: "right",
  },
  moreItemsContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  moreItems: {
    fontSize: 12,
    color: "#999",
  },
  mainAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "rgba(22,163,74,1)",
  },
});

export default TransactionCard;