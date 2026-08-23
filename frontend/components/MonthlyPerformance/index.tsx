import { Feather, FontAwesome5 } from "@expo/vector-icons";
import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
} from "react-native";

interface MonthlyDataItem {
  es_semana_actual: string;
  fecha_fin_formateada: string;
  fecha_fin_semana: string;
  fecha_inicio_formateada: string;
  fecha_inicio_semana: string;
  semana_label: string;
  semana_numero: number;
  total_egresos: string;
  total_ingresos: string;
}

interface ProcessedMonthlyData {
  week: string;
  dateRange: string;
  value: string;
  progress: number;
  hasData: boolean;
  ganancia: string;
  esSemanaActual: boolean;
  ingresos: string;
  egresos: string;
  fechaInicioFormateada: string;
  fechaFinFormateada: string;
}

interface MonthlyPerformanceProps {
  data: MonthlyDataItem[];
  loading: boolean;
}

const MonthlyPerformance = ({ data, loading }: MonthlyPerformanceProps) => {
  const [showIngresos, setShowIngresos] = useState(true);
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [loading]);

  const shimmerOpacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const formatCurrency = (value: string): string => {
    const num = parseFloat(value);
    if (num === 0) return "-";

    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    } else {
      return `${num.toFixed(1)}`;
    }
  };

  // Función para formatear el rango de fechas
  const formatDateRange = (fechaInicio: string, fechaFin: string): string => {
    // fechaInicio y fechaFin vienen en formato "DD/MM/YYYY"
    const formatShortDate = (dateStr: string): string => {
      const [day, month] = dateStr.split("/");
      const months = [
        "ene",
        "feb",
        "mar",
        "abr",
        "may",
        "jun",
        "jul",
        "ago",
        "sep",
        "oct",
        "nov",
        "dic",
      ];
      return `${parseInt(day)} ${months[parseInt(month) - 1]}`;
    };

    return `${formatShortDate(fechaInicio)} - ${formatShortDate(fechaFin)}`;
  };

  const SkeletonBox = ({ width, height, style }: any) => (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: "#E1E9EE",
          borderRadius: 6,
          opacity: shimmerOpacity,
        },
        style,
      ]}
    />
  );

  const calculateProgress = (value: string, maxValue: number): number => {
    if (maxValue === 0) return 0;
    return parseFloat(value) / maxValue;
  };

  const hasData = (item: MonthlyDataItem): boolean => {
    return (
      parseFloat(item.total_ingresos) > 0 || parseFloat(item.total_egresos) > 0
    );
  };

  const renderProgressBar = (progress: number, hasData: boolean) => {
    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground} />
        {hasData && (
          <View
            style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
          />
        )}
      </View>
    );
  };

  const ProgressRowSkeleton = () => (
    <View style={styles.progressRow}>
      <View style={styles.weekContainer}>
        <SkeletonBox width={80} height={16} />
      </View>
      <View style={styles.progressBarWrapper}>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground} />
          <SkeletonBox width="60%" height={6} style={{ borderRadius: 2 }} />
        </View>
      </View>
      <View style={styles.valueContainer}>
        <SkeletonBox width={50} height={16} />
      </View>
    </View>
  );

  const toggleView = () => {
    setShowIngresos(!showIngresos);
  };

  if (loading) {
    return (
      <View style={styles.monthlyPerformance}>
        {/* Header Skeleton */}
        <View style={styles.header}>
          <SkeletonBox width={160} height={20} />
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <SkeletonBox width={100} height={30} style={{ borderRadius: 5 }} />
            <SkeletonBox width={20} height={20} style={{ borderRadius: 10 }} />
          </View>
        </View>

        {/* Progress Bars Skeleton */}
        <View style={styles.progressContainer}>
          {Array.from({ length: 5 }).map((_, index) => (
            <ProgressRowSkeleton key={index} />
          ))}
        </View>

        {/* Footer Skeleton */}
        <View style={styles.footer}>
          <SkeletonBox
            width={8}
            height={8}
            style={{ borderRadius: 4, marginRight: 8 }}
          />
          <SkeletonBox width={200} height={14} />
        </View>
      </View>
    );
  }

  // Si no hay datos, mostrar esqueleto básico
  if (!data || data.length === 0) {
    return (
      <View style={styles.monthlyPerformance}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Rendimiento Mensual</Text>
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <TouchableOpacity style={styles.toggleButton} onPress={toggleView}>
              <Feather
                name={showIngresos ? "trending-up" : "trending-down"}
                size={20}
                color={showIngresos ? "#16a34a" : "#dc2626"}
              />
              <Text
                style={[
                  styles.toggleButtonText,
                  { color: showIngresos ? "#16a34a" : "#dc2626" },
                ]}
              >
                {showIngresos ? "Ingresos" : "Egresos"}
              </Text>
            </TouchableOpacity>
            <FontAwesome5 name="eye" size={20} color="rgba(0, 0, 0, 0.51)" />
          </View>
        </View>

        {/* Mensaje de no datos */}
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No hay datos disponibles</Text>
        </View>

        {/* Footer con datos vacíos */}
        <View style={styles.footer}>
          <View style={styles.dotIndicator} />
          <Text style={styles.footerText}>
            Datos parciales: 0 de 0 semanas transcurridas
          </Text>
        </View>
      </View>
    );
  }

  // Calcular el máximo de valores para el cálculo del progreso
  const maxIngresos = Math.max(
    ...data.map((item: MonthlyDataItem) => parseFloat(item.total_ingresos))
  );

  const maxEgresos = Math.max(
    ...data.map((item: MonthlyDataItem) => parseFloat(item.total_egresos))
  );

  const maxValue = showIngresos ? maxIngresos : maxEgresos;

  // Mapear los datos recibidos al formato necesario
  const monthlyData: ProcessedMonthlyData[] = data.map(
    (item: MonthlyDataItem) => {
      const currentValue = showIngresos
        ? item.total_ingresos
        : item.total_egresos;
      const formattedValue = formatCurrency(currentValue);
      const ganancia =
        parseFloat(item.total_ingresos) - parseFloat(item.total_egresos);

      return {
        week: item.semana_label,
        dateRange: formatDateRange(
          item.fecha_inicio_formateada,
          item.fecha_fin_formateada
        ),
        value: hasData(item) ? formattedValue : "-",
        progress: calculateProgress(currentValue, maxValue),
        hasData: hasData(item),
        ganancia: formatCurrency(ganancia.toString()),
        esSemanaActual: item.es_semana_actual === "SÍ",
        ingresos: formatCurrency(item.total_ingresos),
        egresos: formatCurrency(item.total_egresos),
        fechaInicioFormateada: item.fecha_inicio_formateada,
        fechaFinFormateada: item.fecha_fin_formateada,
      };
    }
  );

  // Contar semanas con datos
  const semanasConDatos = monthlyData.filter(
    (item: ProcessedMonthlyData) => item.hasData
  ).length;
  const totalSemanas = monthlyData.length;

  // Contar días transcurridos en la semana actual
  const semanaActual = data.find((item) => item.es_semana_actual === "SÍ");
  const diasTranscurridos = semanaActual
    ? Math.floor(
        (new Date().getTime() -
          new Date(semanaActual.fecha_inicio_semana).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    : 0;

  return (
    <View style={styles.monthlyPerformance}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Rendimiento Mensual</Text>
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              {
                backgroundColor: showIngresos
                  ? "rgba(240,253,244,1)"
                  : "rgba(254,242,242,1)",
              },
            ]}
            onPress={toggleView}
          >
            <Feather
              name={showIngresos ? "trending-up" : "trending-down"}
              size={20}
              color={showIngresos ? "#16a34a" : "#dc2626"}
            />
            <Text
              style={[
                styles.toggleButtonText,
                { color: showIngresos ? "#16a34a" : "#dc2626" },
              ]}
            >
              {showIngresos ? "Ingresos" : "Egresos"}
            </Text>
          </TouchableOpacity>
          <FontAwesome5 name="eye" size={20} color="rgba(0, 0, 0, 0.51)" />
        </View>
      </View>

      {/* Progress Bars */}
      <View style={styles.progressContainer}>
        {monthlyData.map((item: ProcessedMonthlyData, index: number) => (
          <View key={index} style={styles.progressRow}>
            <View style={styles.weekContainer}>
              <Text
                style={[
                  styles.weekText,
                  !item.hasData && styles.inactiveText,
                  item.esSemanaActual && styles.currentWeekText,
                ]}
              >
                {item.dateRange}
              </Text>
            </View>

            <View style={styles.progressBarWrapper}>
              {renderProgressBar(item.progress, item.hasData)}
              {item.esSemanaActual && diasTranscurridos > 0 && (
                <Text style={styles.progressSideText}>
                  {diasTranscurridos}/7 días
                </Text>
              )}
            </View>

            <View style={styles.valueContainer}>
              <Text
                style={[
                  styles.valueText,
                  !item.hasData && styles.inactiveText,
                  item.esSemanaActual && styles.currentWeekText,
                ]}
              >
                {item.value}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.dotIndicator} />
        <Text style={styles.footerText}>
          Datos parciales: {semanasConDatos} semanas completas
          {semanaActual &&
            diasTranscurridos > 0 &&
            ` + ${diasTranscurridos} días actuales`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  monthlyPerformance: {
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 5,
    padding: 16,
    backgroundColor: "white",
    marginBottom: 20,
    minHeight: 300,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  toggleButton: {
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  progressContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingRight: 20,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  weekContainer: {
    width: 85, // Incrementado para acomodar el rango de fechas
    alignItems: "flex-start",
  },
  weekText: {
    fontSize: 12, // Reducido ligeramente para que quepa mejor
    color: "#000",
    fontWeight: "500",
  },
  inactiveText: {
    color: "#999",
  },
  currentWeekText: {
    color: "#4285F4",
    fontWeight: "600",
  },
  progressBarWrapper: {
    flex: 1,
    marginHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  progressBarContainer: {
    height: 7,
    position: "relative",
    justifyContent: "center",
    flex: 1,
  },
  progressBarBackground: {
    height: 7,
    width: "100%",
    backgroundColor: "#E5E5E5",
    borderRadius: 1,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: "#000",
    borderRadius: 2,
    position: "absolute",
    top: 0.5,
    left: 0,
  },
  progressSideText: {
    fontSize: 12,
    color: "rgba(0, 0, 0, 0.4)",
    fontWeight: "500",
    marginLeft: 8,
  },
  valueContainer: {
    width: 70,
    alignItems: "flex-end",
  },
  valueText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    height: 37,
    backgroundColor: "rgba(239,246,255,1)",
    paddingLeft: 10,
    borderRadius: 10,
    marginTop: 15,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4285F4",
    marginRight: 8,
  },
  footerText: {
    fontSize: 12,
    color: "#4285F4",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
});
export default MonthlyPerformance;
