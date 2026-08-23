import {
  AntDesign,
  Feather,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, Animated } from "react-native";

interface AnalysisCardsProps {
  type: "daily" | "weekly" | "monthly";
  currentDate: Date;
  showData: boolean;
  onDataLoaded: () => void;
  // Prop para recibir los insights ya procesados
  insights?: MetricData[];
}

interface MetricData {
  icon: string;
  iconType: "FontAwesome6" | "Feather" | "MaterialIcons" | "AntDesign";
  iconColor: string;
  value: string;
  label: string;
  backgroundColor: string;
}

interface AnalysisData {
  title: string;
  subtitle: string;
  dateRange: string;
  iconName: string;
  iconColor: string;
  iconBgColor: string;
  metrics: MetricData[];
}

function AnalysisCards({
  type,
  currentDate,
  showData,
  onDataLoaded,
  insights,
}: AnalysisCardsProps) {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
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

  
  useEffect(() => {
    if (insights !== undefined) {
      processData();
    }
  }, [type, currentDate, insights]);

  const formatProductCount = (value: string | number): string => {
    const num = parseInt(value.toString());
    if (num === 0) return "0";

    if (num >= 1000000) {
      return `${Math.floor(num / 1000000)}M`;
    } else if (num >= 1000) {
      return `${Math.floor(num / 1000)}K`;
    } else {
      return num.toString();
    }
  };

  const getDateRange = (): string => {
    switch (type) {
      case "monthly":
        return currentDate.toLocaleDateString("es-ES", {
          month: "long",
          year: "numeric",
        });

      case "daily":
        return currentDate.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

      default: // weekly
        const startOfWeek = new Date(currentDate);
        const dayOfWeek = currentDate.getDay();
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startOfWeek.setDate(currentDate.getDate() - daysToSubtract);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const startDay = startOfWeek.getDate();
        const startMonth = startOfWeek.toLocaleDateString("es-ES", {
          month: "short",
        });
        const endDay = endOfWeek.getDate();
        const endMonth = endOfWeek.toLocaleDateString("es-ES", {
          month: "short",
        });

        if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
          return `${startDay} - ${endDay} ${startMonth}`;
        } else {
          return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
        }
    }
  };

  const processData = async () => {
    try {
      setLoading(true);
      
      const processedData = buildAnalysisData();
      setAnalysisData(processedData);
    } catch (error) {
      console.error("Error processing analysis data:", error);
      setAnalysisData(getDefaultAnalysisData());
    } finally {
      setLoading(false);
      onDataLoaded();
    }
  };

  const buildAnalysisData = (): AnalysisData => {
    const dateRange = getDateRange();
    
    const titles = {
      daily: "Análisis del Día",
      weekly: "Análisis Semanal",
      monthly: "Análisis Mensual",
    };

    const subtitles = {
      daily: "Rendimiento de hoy en tiempo real",
      weekly: "Insights de los últimos 7 días",
      monthly: "Tendencias del mes actual",
    };

    return {
      title: titles[type],
      subtitle: subtitles[type],
      dateRange: dateRange,
      iconName: "barchart",
      iconColor: "white",
      iconBgColor: "#16a34a",
      metrics: insights || getDefaultMetrics(),
    };
  };

  const getDefaultMetrics = (): MetricData[] => {
    const defaultMetrics = {
      daily: [
        {
          icon: "receipt",
          iconType: "MaterialIcons" as const,
          iconColor: "#6b7280",
          value: "0",
          label: "transacciones hoy",
          backgroundColor: "rgba(249,250,251,1)",
        },
        {
          icon: "shopping-bag",
          iconType: "Feather" as const,
          iconColor: "#6b7280",
          value: "0",
          label: "productos vendidos",
          backgroundColor: "rgba(249,250,251,1)",
        },
      ],
      weekly: [
        {
          icon: "star",
          iconType: "AntDesign" as const,
          iconColor: "#6b7280",
          value: "N/A",
          label: "mejor día",
          backgroundColor: "rgba(249,250,251,1)",
        },
        {
          icon: "shopping-bag",
          iconType: "Feather" as const,
          iconColor: "#6b7280",
          value: "0",
          label: "productos vendidos",
          backgroundColor: "rgba(249,250,251,1)",
        },
      ],
      monthly: [
        {
          icon: "calendar",
          iconType: "Feather" as const,
          iconColor: "#3b82f6",
          value: "0",
          label: "días transcurridos",
          backgroundColor: "rgba(239,246,255,1)",
        },
        {
          icon: "check-circle",
          iconType: "Feather" as const,
          iconColor: "#16a34a",
          value: "0",
          label: "días con ventas",
          backgroundColor: "rgba(240,253,244,1)",
        },
      ],
    };

    return defaultMetrics[type];
  };

  const getDefaultAnalysisData = (): AnalysisData => {
    const dateRange = getDateRange();

    const titles = {
      daily: "Análisis del Día",
      weekly: "Análisis Semanal",
      monthly: "Análisis Mensual",
    };

    const subtitles = {
      daily: "Rendimiento de hoy en tiempo real",
      weekly: "Insights de los últimos 7 días",
      monthly: "Tendencias del mes actual",
    };

    return {
      title: titles[type],
      subtitle: subtitles[type],
      dateRange: dateRange,
      iconName: "barchart",
      iconColor: "white",
      iconBgColor: "#16a34a",
      metrics: getDefaultMetrics(),
    };
  };

  const renderIcon = (
    iconName: string,
    iconType: string,
    size: number,
    color: string
  ) => {
    switch (iconType) {
      case "FontAwesome6":
        return (
          <FontAwesome6 name={iconName as any} size={size} color={color} />
        );
      case "Feather":
        return <Feather name={iconName as any} size={size} color={color} />;
      case "MaterialIcons":
        return (
          <MaterialIcons name={iconName as any} size={size} color={color} />
        );
      default:
        return <AntDesign name={iconName as any} size={size} color={color} />;
    }
  };

  if (loading || !showData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <SkeletonBox width={140} height={16} style={{ marginBottom: 4 }} />
            <SkeletonBox width={180} height={12} style={{ marginBottom: 2 }} />
            <SkeletonBox width={120} height={15} />
          </View>
          <SkeletonBox width={40} height={40} style={{ borderRadius: 8 }} />
        </View>

        <View style={styles.metricsContainer}>
          {[1, 2].map((index) => (
            <View
              key={index}
              style={[
                styles.metricCard,
                { backgroundColor: "rgba(249,250,251,1)" },
              ]}
            >
              <View style={styles.metricContent}>
                <SkeletonBox
                  width={16}
                  height={16}
                  style={{ marginRight: 4 }}
                />
                <SkeletonBox width={60} height={20} />
              </View>
              <SkeletonBox width={100} height={14} style={{ marginTop: 6 }} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (!analysisData) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{analysisData.title}</Text>
          <Text style={styles.subtitle}>{analysisData.subtitle}</Text>
          <Text style={styles.dateRange}>{analysisData.dateRange}</Text>
        </View>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: analysisData.iconBgColor },
          ]}
        >
          <MaterialCommunityIcons name="google-analytics" size={24} color="white" />
        </View>
      </View>
      <View style={styles.metricsContainer}>
        {analysisData.metrics.map((metric, index) => (
          <View
            key={index}
            style={[
              styles.metricCard,
              { backgroundColor: metric.backgroundColor },
            ]}
          >
            <View style={styles.metricContent}>
              {renderIcon(metric.icon, metric.iconType, 16, metric.iconColor)}
              <Text style={styles.metricValue}>{metric.value}</Text>
            </View>
            <Text style={styles.metricLabel}>{metric.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "auto",
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 5,
    padding: 16,
    justifyContent: "space-between",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 16,
  },
  dateRange: {
    fontSize: 15,
    color: "#16a34a",
    fontWeight: "500",
    marginTop: 2,
  },
  iconContainer: {
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  metricCard: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "flex-start",
  },
  metricContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  metricLabel: {
    fontSize: 11,
    color: "#6b7280",
    lineHeight: 14,
    marginTop: 2,
  },
});

export default AnalysisCards;