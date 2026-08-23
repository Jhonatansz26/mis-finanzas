import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface producto {
  cantidad_vendida: string;
  costo_unitario: number;
  ganancia_total: string;
  ganancia_unitaria: number;
  margen_ganancia_porcentaje: string;
  precio_unitario: number;
  producto_id: number;
  producto_nombre: string;
}

interface ProductProfitProps {
  data: producto 
}

function UrgentActions({ data }: ProductProfitProps) {
  return (
    <View style={styles.container}>
      <View style={styles.alertBox}>
        <View style={styles.iconContainer}>
          <Text style={styles.warningIcon}>⚠️</Text>
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Acción Urgente Requerida</Text>
          <Text style={styles.description}>
            Producto "{data.producto_nombre}" genera pérdidas de $
            {data.ganancia_unitaria} por venta. Corregir precio inmediatamente o
            suspender ventas.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 16,
    marginBottom: 10,
  },
  alertBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  warningIcon: {
    fontSize: 20,
    color: "#DC2626",
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#7F1D1D",
    lineHeight: 20,
  },
});

export default UrgentActions;
