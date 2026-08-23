// TransactionExpenditureCard.tsx - SIN modal interno
import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { formatPriceToColombianPrice } from "../../utils/formatFunctions";
import { Transaction } from "../../utils/types/transaction";

interface TransactionCardProps {
  transactionData: Transaction;
  onPress: (transaction: Transaction) => void; 
}

function TransactionExpenditureCard({ transactionData, onPress }: TransactionCardProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress(transactionData)}
      style={styles.expenseCard}
    >
      <View style={styles.expenseCardHeader}>
        <View style={styles.expenseCategory}>
          <AntDesign name="tags" size={16} color="#781b1b" />
          <Text style={styles.expenseCategoryText}>
            {transactionData.categoria_nombre || "Sin categoría"}
          </Text>
        </View>
        <Text style={styles.expenseAmount}>
          {formatPriceToColombianPrice(transactionData.monto_total)}
        </Text>
      </View>
      <Text style={styles.expenseConcept} numberOfLines={2}>
        {transactionData.concepto}
      </Text>
      <Text style={styles.expenseTime}>
        {new Date(transactionData.fecha).toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
});

export default TransactionExpenditureCard;