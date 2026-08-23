import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Transaction } from "../../utils/types/transaction";

type TransactionItemProps = {
  item: Transaction;
  onPress: (transaction: Transaction, transformedData: any) => void; // ✅ Callback para manejar el clic
};

function TransactionItem({ item, onPress }: TransactionItemProps) {
  const transactionDate = new Date(item.fecha);
  const formattedTransactionDate = `${transactionDate
    .getDate()
    .toString()
    .padStart(2, "0")}/${(transactionDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${transactionDate.getFullYear()}`;

  // Descripción basada en concepto o detalles de productos
  let descripcion = item.concepto || "";

  if (!descripcion && item.detalles && item.detalles.length > 0) {
    descripcion = item.detalles
      .map((detalle) => `${detalle.producto_nombre} (${detalle.cantidad})`)
      .join(", ");
  }

  const transformedTransaction = {
    id: item.id,
    fecha: formattedTransactionDate,
    tipo: item.tipo === "ingreso" ? "Ingreso" : "Egreso",
    descripcion: descripcion || item.categoria_nombre || "Sin concepto",
    monto_total: parseFloat(item.monto_total),
    categoria: item.categoria_nombre,
    detalles: item.detalles,
  };

  const formatMonto = (monto: number) => {
    return monto.toLocaleString("es-CO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formattedAmount = `${
    transformedTransaction.tipo === "Ingreso" ? "+" : "-"
  }$${formatMonto(transformedTransaction.monto_total)}`;

  // ✅ Preparar datos para el modal según el tipo
  const modalData = transformedTransaction.tipo === "Ingreso" 
    ? {
        id: item.id,
        fecha: item.fecha,
        monto_total: item.monto_total,
        detalles: transformedTransaction.detalles || [],
      }
    : {
        id: item.id,
        fecha: item.fecha,
        monto_total: item.monto_total,
        descripcion: transformedTransaction.descripcion,
        categoria: transformedTransaction.categoria || "",
      };

  return (
    <TouchableOpacity
      style={[
        styles.transaccionItem,
        transformedTransaction.tipo === "Ingreso"
          ? styles.ingresoContainer
          : styles.egresoContainer,
      ]}
      onPress={() => onPress(item, { transformedTransaction, modalData })} 
    >
      <View style={styles.transaccionRow}>
        <Text style={styles.fechaText}>{transformedTransaction.fecha}</Text>
        <Text
          style={[
            styles.montoText,
            transformedTransaction.tipo === "Ingreso"
              ? styles.ingresoText
              : styles.egresoText,
          ]}
        >
          {formattedAmount}
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <View
          style={[
            styles.iconContainer,
            transformedTransaction.tipo === "Ingreso"
              ? styles.ingresoIconBg
              : styles.egresoIconBg,
          ]}
        >
          <MaterialIcons
            name={
              transformedTransaction.tipo === "Ingreso"
                ? "arrow-upward"
                : "arrow-downward"
            }
            size={16}
            color={
              transformedTransaction.tipo === "Ingreso"
                ? "#16a34a"
                : "#b91c1c"
            }
          />
        </View>

        <View style={styles.descripcionContainer}>
          <View style={styles.tipoRow}>
            <Text
              style={[
                styles.tipoText,
                transformedTransaction.tipo === "Ingreso"
                  ? styles.ingresoText
                  : styles.egresoText,
              ]}
            >
              {transformedTransaction.tipo}
            </Text>
            {transformedTransaction.categoria && (
              <View
                style={[
                  styles.categoriaContainer,
                  transformedTransaction.tipo === "Egreso"
                    ? styles.categoriaBgEgreso
                    : styles.categoriaBgIngreso,
                ]}
              >
                <Text
                  style={[
                    styles.categoriaText,
                    transformedTransaction.tipo === "Egreso"
                      ? styles.categoriaTextEgreso
                      : {},
                  ]}
                >
                  {transformedTransaction.categoria}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.descripcionText} numberOfLines={2}>
            {transformedTransaction.descripcion || "Sin descripción"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  transaccionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  ingresoContainer: {
    backgroundColor: "#f0fdf4",
  },
  egresoContainer: {
    backgroundColor: "#fee2e2",
  },
  transaccionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  fechaText: {
    fontSize: 13,
    color: "#666",
  },
  montoText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  ingresoText: {
    color: "#16a34a",
  },
  egresoText: {
    color: "#b91c1c",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    padding: 8,
    borderRadius: 50,
    marginRight: 12,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  ingresoIconBg: {
    backgroundColor: "#dcfce7",
  },
  egresoIconBg: {
    backgroundColor: "#fee2e2",
  },
  descripcionContainer: {
    flex: 1,
  },
  tipoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  tipoText: {
    fontSize: 15,
    fontWeight: "600",
    marginRight: 8,
  },
  categoriaContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoriaBgIngreso: {
    backgroundColor: "#dcfce7",
  },
  categoriaBgEgreso: {
    backgroundColor: "rgba(255, 0, 0, 0.31)",
  },
  categoriaText: {
    fontSize: 12,
    fontWeight: "500",
  },
  categoriaTextEgreso: {
    color: "#b91c1c",
  },
  descripcionText: {
    fontSize: 14,
    color: "#64748b",
  },
});

export default TransactionItem;