import { Feather, FontAwesome5 } from "@expo/vector-icons";
import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
} from "react-native";

interface WeeklyDataItem {
  dia_numero: number;
  es_fecha_consultada: string;
  fecha_dia: string;
  fecha_formateada: string;
  ganancia_neta: string;
  nombre_dia: string;
  nombre_dia_db: string;
  total_egresos: string;
  total_ingresos: string;
}

interface ProcessedWeeklyData {
  day: string;
  value: string;
  progress: number;
  hasData: boolean;
  ganancia: string;
  esFechaConsultada: boolean;
  ingresos: string;
  egresos: string;
}

interface WeeklyPerformanceProps {
  data: WeeklyDataItem[];
  loading: boolean;
}

const WeeklyPerformance = ({ data, loading }: WeeklyPerformanceProps) => {
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

  // Componente Skeleton
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

  // Función para calcular el progreso basado en los valores actuales
  const calculateProgress = (value: string, maxValue: number): number => {
    if (maxValue === 0) return 0;
    return parseFloat(value) / maxValue;
  };

  // Función para determinar si el día tiene datos
  const hasData = (item: WeeklyDataItem): boolean => {
    return (
      item.es_fecha_consultada === "SÍ" || 
      parseFloat(item.total_ingresos) > 0 || 
      parseFloat(item.total_egresos) > 0
    );
  };

  const renderProgressBar = (progress: number, hasData: boolean, isNegative: boolean = false) => {
    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground} />
        {hasData && (
          <View
            style={[
              styles.progressBarFill, 
              { width: `${progress * 100}%` }
            ]}
          />
        )}
      </View>
    );
  };

  // Skeleton para las filas de progreso
  const ProgressRowSkeleton = () => (
    <View style={styles.progressRow}>
      <View style={styles.dayContainer}>
        <SkeletonBox width={25} height={16} />
      </View>
      <View style={styles.progressBarWrapper}>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground} />
          <SkeletonBox width="60%" height={6} style={{ borderRadius: 2 }} />
        </View>
      </View>
      <View style={styles.valueContainer}>
        <SkeletonBox width={40} height={16} />
      </View>
    </View>
  );

  const toggleView = () => {
    setShowIngresos(!showIngresos);
  };

  if (loading) {
    return (
      <View style={styles.weeklyPerformance}>
        {/* Header Skeleton */}
        <View style={styles.header}>
          <SkeletonBox width={140} height={20} />
          <View style={{ flexDirection: "row", gap: 10, alignItems: 'center' }}>
            <SkeletonBox width={100} height={30} style={{ borderRadius: 5 }} />
            <SkeletonBox width={20} height={20} style={{ borderRadius: 10 }} />
          </View>
        </View>

        {/* Progress Bars Skeleton */}
        <View style={styles.progressContainer}>
          {Array.from({ length: 7 }).map((_, index) => (
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
          <SkeletonBox width={180} height={14} />
        </View>
      </View>
    );
  }

  // Si no hay datos, mostrar esqueleto básico
  if (!data || data.length === 0) {
    return (
      <View style={styles.weeklyPerformance}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Rendimiento Semanal</Text>
          <View style={{ flexDirection: "row", gap: 10, alignItems:'center' }}>
            <TouchableOpacity 
              style={styles.toggleButton}
              onPress={toggleView}
            >
              <Feather 
                name={showIngresos ? "trending-up" : "trending-down"} 
                size={20} 
                color={showIngresos ? "#16a34a" : "#dc2626"} 
              />
              <Text style={[styles.toggleButtonText, { color: showIngresos ? "#16a34a" : "#dc2626" }]}>
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
            Datos parciales: 0 de 7 días transcurridos
          </Text>
        </View>
      </View>
    );
  }

  // Calcular el máximo de valores para el cálculo del progreso
  const maxIngresos = Math.max(
    ...data.map((item: WeeklyDataItem) => parseFloat(item.total_ingresos))
  );
  
  const maxEgresos = Math.max(
    ...data.map((item: WeeklyDataItem) => parseFloat(item.total_egresos))
  );

  const maxValue = showIngresos ? maxIngresos : maxEgresos;

  // Mapear los datos recibidos al formato necesario
  const weeklyData: ProcessedWeeklyData[] = data.map(
    (item: WeeklyDataItem) => {
      const currentValue = showIngresos ? item.total_ingresos : item.total_egresos;
      const formattedValue = formatCurrency(currentValue);
      
      return {
        day: item.nombre_dia,
        value: hasData(item) ? formattedValue : "-",
        progress: calculateProgress(currentValue, maxValue),
        hasData: hasData(item),
        ganancia: formatCurrency(item.ganancia_neta),
        esFechaConsultada: item.es_fecha_consultada === "SÍ",
        ingresos: formatCurrency(item.total_ingresos),
        egresos: formatCurrency(item.total_egresos),
      };
    }
  );

  // Contar días con datos
  const diasConDatos = weeklyData.filter(
    (item: ProcessedWeeklyData) => item.hasData
  ).length;
  const totalDias = weeklyData.length;

  return (
    <View style={styles.weeklyPerformance}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Rendimiento Semanal</Text>
        <View style={{ flexDirection: "row", gap: 10, alignItems:'center' }}>
          <TouchableOpacity 
            style={[
              styles.toggleButton,
              { backgroundColor: showIngresos ? 'rgba(240,253,244,1)' : 'rgba(254,242,242,1)' }
            ]}
            onPress={toggleView}
          >
            <Feather 
              name={showIngresos ? "trending-up" : "trending-down"} 
              size={20} 
              color={showIngresos ? "#16a34a" : "#dc2626"} 
            />
            <Text style={[styles.toggleButtonText, { color: showIngresos ? "#16a34a" : "#dc2626" }]}>
              {showIngresos ? "Ingresos" : "Egresos"}
            </Text>
          </TouchableOpacity>
          <FontAwesome5 name="eye" size={20} color="rgba(0, 0, 0, 0.51)" />
        </View>
      </View>

      {/* Progress Bars */}
      <View style={styles.progressContainer}>
        {weeklyData.map((item: ProcessedWeeklyData, index: number) => (
          <View key={index} style={styles.progressRow}>
            <View style={styles.dayContainer}>
              <Text
                style={[
                  styles.dayText,
                  !item.hasData && styles.inactiveText,
                  item.esFechaConsultada && styles.currentDayText,
                ]}
              >
                {item.day}
              </Text>
            </View>

            <View style={styles.progressBarWrapper}>
              {renderProgressBar(item.progress, item.hasData, !showIngresos)}
            </View>

            <View style={styles.valueContainer}>
              <Text
                style={[
                  styles.valueText,
                  !item.hasData && styles.inactiveText,
                  item.esFechaConsultada && styles.currentDayText,
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
          Datos parciales: {diasConDatos} de {totalDias} días transcurridos
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  weeklyPerformance: {
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 5,
    padding: 16,
    backgroundColor: "white",
    minHeight: 300,
    marginBottom: 20,
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
  dayContainer: {
    width: 35,
    alignItems: "flex-start",
  },
  dayText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  inactiveText: {
    color: "#999",
  },
  currentDayText: {
    color: "#4285F4",
    fontWeight: "600",
  },
  progressBarWrapper: {
    flex: 1,
    marginHorizontal: 12,
  },
  progressBarContainer: {
    height: 4,
    position: "relative",
    justifyContent: "center",
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
    top: -1,
  },
  progressBarNegative: {
    backgroundColor: "#dc2626",
  },
  valueContainer: {
    width: 60,
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
    marginTop: 5,
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

export default WeeklyPerformance;