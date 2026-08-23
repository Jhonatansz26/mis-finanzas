import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BusinessData } from "./BusinessInfoStep";
import { SalesPoint } from "./SalesPointsStep";




interface ReviewStepProps {
  businessData: BusinessData;
  salesPoints: SalesPoint[];
  onBack: () => void;
  onSubmit: () => void;
}

export function ReviewStep({
  businessData,
  salesPoints,
  onBack,
  onSubmit,
}: ReviewStepProps) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Feather name="check-circle" size={24} color="#16a34a" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Revisión Final</Text>
          <Text style={styles.subtitle}>Verifica que todo esté correcto</Text>
        </View>
      </View>

      {/* Business Info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="briefcase" size={20} color="#16a34a" />
          <Text style={styles.cardTitle}>Información del Negocio</Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Nombre:</Text>
            <Text style={styles.infoValue}>{businessData.nombre}</Text>
          </View>

          {businessData.nit && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>NIT:</Text>
              <Text style={styles.infoValue}>{businessData.nit}</Text>
            </View>
          )}

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Teléfono:</Text>
            <Text style={styles.infoValue}>{businessData.telefono}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{businessData.email}</Text>
          </View>

          <View style={[styles.infoItem, styles.fullWidth]}>
            <Text style={styles.infoLabel}>Dirección:</Text>
            <Text style={styles.infoValue}>{businessData.direccion}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Departamento:</Text>
            <Text style={styles.infoValue}>{businessData.departamento}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Municipio:</Text>
            <Text style={styles.infoValue}>{businessData.municipio}</Text>
          </View>
        </View>
      </View>

      {/* Sales Points */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="map-pin" size={20} color="#16a34a" />
          <Text style={styles.cardTitle}>
            Puntos de Venta ({salesPoints.length})
          </Text>
        </View>

        <View style={styles.pointsList}>
          {salesPoints.map((point, index) => (
            <View key={point.id} style={styles.pointCard}>
              <View style={styles.pointHeader}>
                <View style={styles.pointNumber}>
                  <Text style={styles.pointNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.pointName}>{point.nombre}</Text>
              </View>

              <View style={styles.pointDetails}>
                <Text style={styles.pointLocation}>{point.ubicacion}</Text>

                {point.responsable && (
                  <Text style={styles.pointInfo}>
                    <Text style={styles.pointInfoLabel}>Responsable: </Text>
                    {point.responsable}
                  </Text>
                )}

                {point.telefono && (
                  <Text style={styles.pointInfo}>
                    <Text style={styles.pointInfoLabel}>Tel: </Text>
                    {point.telefono}
                  </Text>
                )}

                {point.nota && (
                  <Text style={styles.pointNote}>{point.nota}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <Feather name="arrow-left" size={20} color="#374151" />
          <Text style={styles.backButtonText}>Atrás</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={onSubmit}
          activeOpacity={0.8}
        >
          <Feather name="check-circle" size={20} color="#fff" />
          <Text style={styles.submitButtonText}>Registrar Negocio</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  infoItem: {
    width: "48%",
    marginBottom: 0,
  },
  fullWidth: {
    width: "100%",
  },
  infoLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
  },
  pointsList: {
    gap: 12,
  },
  pointCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  pointHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  pointNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
  },
  pointNumberText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  pointName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
  },
  pointDetails: {
    paddingLeft: 32,
    gap: 4,
  },
  pointLocation: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  pointInfo: {
    fontSize: 14,
    color: "#000",
  },
  pointInfoLabel: {
    color: "#6b7280",
  },
  pointNote: {
    fontSize: 13,
    color: "#6b7280",
    fontStyle: "italic",
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
    marginTop: 8,
  },
  backButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    height: 56,
    borderRadius: 8,
    gap: 8,
  },
  backButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16a34a",
    height: 56,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});