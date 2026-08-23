import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
} from "react-native";
import useBusinessStore from "../../hooks/useBusinessStore";
import api from "../../api/apiConfig";

// Interface para los datos de costos fijos (estructura real)
interface FixedCostsResponse {
  total_costos_mes: string;
}

// Interface para los datos de la API
interface BalancePointData {
  cantidad_vendida: string;
  ganancia_promedio_unitaria: string;
  margen_promedio_porcentaje: string;
  total_costos_fijos: string;
  total_vendido: string;
  unidades_punto_equilibrio: number;
  ventas_punto_equilibrio_pesos: string;
}

interface BalancePointProps {
  data?: BalancePointData | null;
  loading?: boolean;
  error?: any;
  onConfigureFixedCosts?: () => void;
  // Agregar la función de callback para refrescar datos
  onRefreshData?: () => void;
  api?: any; // Instancia de API
  activeBusiness?: { id: string | number } | null; // Negocio activo
}

function BalancePoint({
  data,
  loading = false,
  error = null,
  onRefreshData, // Nueva prop
}: BalancePointProps) {
  const { activeBusiness } = useBusinessStore();
  // Estados para los costos fijos
  const [fixedCosts, setFixedCosts] = useState<FixedCostsResponse | null>(null);
  const [loadingFixedCosts, setLoadingFixedCosts] = useState(false);
  const [fixedCostsError, setFixedCostsError] = useState<string | null>(null);
  
  // Nuevo estado para manejar la generación de costos fijos
  const [generatingFixedCosts, setGeneratingFixedCosts] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Animación para el skeleton
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  const router = useRouter();

  // Función para obtener los costos fijos
  const fetchFixedCosts = async () => {
    if (!api || !activeBusiness?.id) {
      setFixedCostsError("API o negocio activo no disponible");
      return;
    }

    setLoadingFixedCosts(true);
    setFixedCostsError(null);

    try {
      const response = await api.get(
        `/financial-analysis/fixedcostshis/${activeBusiness.id}`
      );

      // Los datos vienen como un array, tomamos el primer elemento
      const dataArray = response.data;
      if (dataArray && dataArray.length > 0) {
        const fixedCostData: FixedCostsResponse = dataArray[0];
        console.log("costos fijos obtenidos:", fixedCostData);
        setFixedCosts(fixedCostData);
      } else {
        setFixedCostsError("No se encontraron datos de costos fijos");
        setFixedCosts(null);
      }
    } catch (error) {
      console.error("Error fetching fixed costs data:", error);
      setFixedCostsError("Error al cargar los costos fijos");
      setFixedCosts(null);
    } finally {
      setLoadingFixedCosts(false);
    }
  };

  // Nueva función para generar/aceptar los costos fijos
  const generateFixedCosts = async () => {
    if (!api || !activeBusiness?.id) {
      setGenerateError("API o negocio activo no disponible");
      return;
    }

    setGeneratingFixedCosts(true);
    setGenerateError(null);

    try {
      // Obtener fecha actual para año y mes
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1; // getMonth() retorna 0-11

      const response = await api.post(
        `/financial-analysis/fixedcostshis/${activeBusiness.id}?año=${currentYear}&mes=${currentMonth}`
      );

      console.log("Costos fijos generados exitosamente:", response.data);
      
      // AQUÍ ES DONDE AGREGAMOS EL CALLBACK PARA REFRESCAR LOS DATOS
      if (onRefreshData) {
        console.log("Ejecutando callback para refrescar datos del balance point...");
        onRefreshData();
      }

    } catch (error: any) {
      console.error("Error generating fixed costs:", error);
      
      // Manejar diferentes tipos de errores
      if (error.response?.data?.message) {
        setGenerateError(error.response.data.message);
      } else if (error.message) {
        setGenerateError(error.message);
      } else {
        setGenerateError("Error al generar los costos fijos");
      }
    } finally {
      setGeneratingFixedCosts(false);
    }
  };

  // Función helper para verificar si una cadena contiene un substring de forma segura
  const safeIncludes = (str: any, searchString: string): boolean => {
    if (!str) return false;
    const stringValue = typeof str === 'string' ? str : String(str);
    return stringValue.includes(searchString);
  };

  // Efecto para cargar costos fijos cuando hay error MISSING_MONTHLY_COSTS
  useEffect(() => {
    const isMonthlyCostsError = 
      safeIncludes(error?.response?.data?.error, "MISSING_MONTHLY_COSTS") ||
      safeIncludes(error?.message, "MISSING_MONTHLY_COSTS");

    if (
      isMonthlyCostsError &&
      !fixedCosts &&
      !loadingFixedCosts &&
      activeBusiness?.id
    ) {
      fetchFixedCosts();
    }
  }, [error, fixedCosts, loadingFixedCosts, activeBusiness]);

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

  const isFixedCostsConfigError =
    safeIncludes(error?.response?.data?.error, "MISSING_FIXED_COSTS_CONFIG") ||
    safeIncludes(error?.message, "MISSING_FIXED_COSTS_CONFIG");

  const isMonthlyCostsError =
    safeIncludes(error?.response?.data?.error, "MISSING_MONTHLY_COSTS") ||
    safeIncludes(error?.message, "MISSING_MONTHLY_COSTS");

  if (error != null) console.log(Object.keys(error));

  const progressData = useMemo(() => {
    if (!data) {
      return {
        currentUnits: 0,
        targetUnits: 0,
        percentage: 0,
        metaAmount: "$0",
        receivedAmount: "$0",
        isGoalExceeded: false,
      };
    }

    const currentUnits = parseFloat(data.cantidad_vendida) || 0;
    const targetUnits = data.unidades_punto_equilibrio || 0;
    const receivedAmount = parseFloat(data.total_vendido) || 0;
    const metaAmount = parseFloat(data.ventas_punto_equilibrio_pesos) || 0;

    const percentage =
      targetUnits > 0 ? Math.round((currentUnits / targetUnits) * 100) : 0;
    const isGoalExceeded = percentage >= 100;

    const formatCurrency = (amount: number) => {
      if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(1)}M`;
      } else if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(0)}K`;
      } else {
        return `$${amount.toFixed(0)}`;
      }
    };

    return {
      currentUnits: Math.round(currentUnits),
      targetUnits: targetUnits,
      percentage: percentage,
      metaAmount: formatCurrency(metaAmount),
      receivedAmount: formatCurrency(receivedAmount),
      isGoalExceeded: isGoalExceeded,
    };
  }, [data]);

  const progressPercentage = Math.min(progressData.percentage, 100);
  const displayPercentage = progressData.percentage;

  // Función para obtener el estado basado en el porcentaje
  const getProgressStatus = () => {
    if (progressData.percentage >= 100) {
      return {
        status: "superado",
        color: "#22c55e",
        backgroundColor: "#f0fdf4",
        icon: "🟢",
        label: "Superado",
        message: "¡Meta superada!",
        messageIcon: "🎉",
      };
    } else if (progressData.percentage >= 65) {
      return {
        status: "cerca",
        color: "#8b5cf6",
        backgroundColor: "#f5f3ff",
        icon: "🟡",
        label: "Cerca",
        message: "¡Casi lo logras!",
        messageIcon: "⚡",
      };
    } else {
      return {
        status: "lejos",
        color: "#3b82f6",
        backgroundColor: "#eff6ff",
        icon: "🔵",
        label: "Lejos",
        message: "¡Sigue así, puedes lograrlo!",
        messageIcon: "💪",
      };
    }
  };

  const statusConfig = getProgressStatus();

  if (loading) {
    return (
      <View style={styles.balancePointContainer}>
        {/* Header Skeleton */}
        <View style={styles.header}>
          <View style={styles.containerLeftPoint}>
            <View style={styles.iconContainer}>
              <SkeletonBox width={20} height={20} />
            </View>
            <SkeletonBox width={60} height={16} />
          </View>
          <View style={styles.tagContainer}>
            <View style={[styles.statusTag, { backgroundColor: "#E1E9EE" }]}>
              <SkeletonBox
                width={6}
                height={6}
                style={{ borderRadius: 3, marginRight: 4 }}
              />
              <SkeletonBox width={50} height={12} />
            </View>
          </View>
        </View>

        {/* Status Message Skeleton */}
        <View style={styles.statusMessageContainer}>
          <SkeletonBox width={12} height={12} style={{ marginRight: 4 }} />
          <SkeletonBox width={120} height={12} />
        </View>

        {/* Units Text Skeleton */}
        <SkeletonBox width={150} height={14} style={{ marginTop: -4 }} />

        {/* Progress Bar Skeleton */}
        <View style={styles.progressContainer}>
          <SkeletonBox width="100%" height={20} style={{ borderRadius: 10 }} />
        </View>

        {/* Stats Container Skeleton */}
        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { backgroundColor: "#F5F5F5" }]}>
            <SkeletonBox width={30} height={14} style={{ marginBottom: 4 }} />
            <SkeletonBox width={50} height={18} />
          </View>
          <View style={[styles.statBox, { backgroundColor: "#F5F5F5" }]}>
            <SkeletonBox width={50} height={14} style={{ marginBottom: 4 }} />
            <SkeletonBox width={50} height={18} />
          </View>
        </View>
      </View>
    );
  }

  // Mostrar estado de configuración si hay error de costos fijos
  if (isFixedCostsConfigError) {
    return (
      <View style={styles.balancePointContainer}>
        <View style={styles.header}>
          <View style={styles.containerLeftPoint}>
            <View style={styles.iconContainer}>
              <Feather name="trending-up" size={20} color="#5B7EFF" />
            </View>
            <Text style={styles.title}>Progreso</Text>
          </View>
          <View style={styles.tagContainer}>
            <View style={[styles.statusTag, { backgroundColor: "#ff6b47" }]}>
              <View
                style={[styles.statusDot, { backgroundColor: "white" }]}
              ></View>
              <Text style={styles.statusText}>Sin configurar</Text>
            </View>
          </View>
        </View>

        {/* Estado de configuración */}
        <View style={styles.configurationContainer}>
          <View style={styles.configIconContainer}>
            <Feather name="settings" size={20} color="#5B7EFF" />
          </View>

          <Text style={styles.configTitle}>Declara tus costos fijos</Text>
          <Text style={styles.configSubtitle}>
            Para determinar el punto de equilibrio
          </Text>

          <TouchableOpacity
            style={styles.configButton}
            onPress={() => router.replace("/settings/fixedcosts")}
            activeOpacity={0.8}
          >
            <Feather
              name="plus"
              size={14}
              color="white"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.configButtonText}>Configurar costos</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Mostrar estado de confirmación de costos mensuales
  if (isMonthlyCostsError) {
    // Mostrar loading mientras se cargan los costos fijos
    if (loadingFixedCosts) {
      return (
        <View style={styles.balancePointContainer}>
          <View style={styles.header}>
            <View style={styles.containerLeftPoint}>
              <View style={styles.iconContainer}>
                <Feather name="trending-up" size={20} color="#5B7EFF" />
              </View>
              <Text style={styles.title}>Progreso</Text>
            </View>
            <View style={styles.tagContainer}>
              <View style={[styles.statusTag, { backgroundColor: "#22c55e" }]}>
                <View
                  style={[styles.statusDot, { backgroundColor: "white" }]}
                ></View>
                <Text style={styles.statusText}>Configurado</Text>
              </View>
            </View>
          </View>

          <View style={styles.monthlyCostsContainer}>
            <View style={styles.checkIconContainer}>
              <Feather name="check" size={20} color="#5B7EFF" />
            </View>
            <Text style={styles.monthlyCostsTitle}>
              Cargando costos fijos...
            </Text>
            <SkeletonBox width={80} height={24} style={{ marginTop: 10 }} />
            <SkeletonBox width={150} height={14} style={{ marginTop: 8 }} />
          </View>
        </View>
      );
    }

    // Mostrar error si falló la carga
    if (fixedCostsError) {
      return (
        <View style={styles.balancePointContainer}>
          <View style={styles.header}>
            <View style={styles.containerLeftPoint}>
              <View style={styles.iconContainer}>
                <Feather name="trending-up" size={20} color="#5B7EFF" />
              </View>
              <Text style={styles.title}>Progreso</Text>
            </View>
            <View style={styles.tagContainer}>
              <View style={[styles.statusTag, { backgroundColor: "#ff6b47" }]}>
                <View
                  style={[styles.statusDot, { backgroundColor: "white" }]}
                ></View>
                <Text style={styles.statusText}>Error</Text>
              </View>
            </View>
          </View>

          <View style={styles.monthlyCostsContainer}>
            <View style={styles.configIconContainer}>
              <Feather name="alert-circle" size={20} color="#ff6b47" />
            </View>
            <Text style={styles.configTitle}>Error al cargar costos</Text>
            <Text style={styles.configSubtitle}>{fixedCostsError}</Text>

            <TouchableOpacity
              style={styles.configButton}
              onPress={fetchFixedCosts}
              activeOpacity={0.8}
            >
              <Feather
                name="refresh-cw"
                size={14}
                color="white"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.configButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Formatear el total mensual con separadores de miles
    const formatCurrencyWithCommas = (amount: string | number) => {
      const numAmount =
        typeof amount === "string" ? parseFloat(amount) : amount;
      return `${numAmount.toLocaleString("es-CO", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })}`;
    };

    const totalMensual = fixedCosts?.total_costos_mes
      ? formatCurrencyWithCommas(fixedCosts.total_costos_mes)
      : "$0";

    return (
      <View style={styles.balancePointContainer}>
        <View style={styles.header}>
          <View style={styles.containerLeftPoint}>
            <View style={styles.iconContainer}>
              <Feather name="trending-up" size={20} color="#5B7EFF" />
            </View>
            <Text style={styles.title}>Progreso</Text>
          </View>
          <View style={styles.tagContainer}>
            <View style={[styles.statusTag, { backgroundColor: "#22c55e" }]}>
              <View
                style={[styles.statusDot, { backgroundColor: "white" }]}
              ></View>
              <Text style={styles.statusText}>Configurado</Text>
            </View>
          </View>
        </View>

        {/* Estado de confirmación de costos mensuales */}
        <View style={styles.monthlyCostsContainer}>
          <View style={styles.checkIconContainer}>
            <Feather name="check" size={20} color="#5B7EFF" />
          </View>

          <Text style={styles.monthlyCostsTitle}>
            Costos fijos configurados
          </Text>
          <Text style={styles.monthlyCostsSubtitle}>
            Confirma el total para calcular el punto de equilibrio
          </Text>

          <Text style={styles.monthlyLabel}>Total mensual</Text>
          <Text style={styles.monthlyAmount}>{totalMensual}</Text>

          <Text style={styles.confirmationText}>
            ¿Estás seguro de este monto?
          </Text>

          {/* Mostrar error de generación si existe */}
          {generateError && (
            <Text style={styles.errorText}>{generateError}</Text>
          )}

          {/* Botones lado a lado */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.acceptButton,
                generatingFixedCosts && styles.buttonDisabled
              ]}
              onPress={generateFixedCosts}
              activeOpacity={0.8}
              disabled={generatingFixedCosts}
            >
              {generatingFixedCosts ? (
                <Feather
                  name="loader"
                  size={14}
                  color="white"
                  style={{ marginRight: 6 }}
                />
              ) : (
                <Feather
                  name="check"
                  size={14}
                  color="white"
                  style={{ marginRight: 6 }}
                />
              )}
              <Text style={styles.acceptButtonText}>
                {generatingFixedCosts ? "Procesando..." : "Aceptar"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => router.push("/settings/fixedcosts")}
              activeOpacity={0.8}
              disabled={generatingFixedCosts}
            >
              <Feather
                name="plus"
                size={14}
                color="#5B7EFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.continueButtonText}>Seguir configurando</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.balancePointContainer, styles.noDataContainer]}>
        <Feather name="alert-circle" size={24} color="#666" />
        <Text style={styles.noDataText}>No hay datos disponibles</Text>
      </View>
    );
  }

  return (
    <View style={styles.balancePointContainer}>
      <View style={styles.header}>
        <View style={styles.containerLeftPoint}>
          <View style={styles.iconContainer}>
            <Feather name="trending-up" size={20} color="#5B7EFF" />
          </View>
          <Text style={styles.title}>Progreso</Text>
        </View>
        <View style={styles.tagContainer}>
          <View
            style={[
              styles.statusTag,
              {
                backgroundColor:
                  statusConfig.status === "superado"
                    ? "#3b82f6"
                    : statusConfig.color,
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    statusConfig.status === "superado" ? "#22c55e" : "white",
                },
              ]}
            ></View>
            <Text style={styles.statusText}>{statusConfig.label}</Text>
          </View>
        </View>
      </View>

      {/* Mensaje del estado movido aquí y más pequeño */}
      <View style={styles.statusMessageContainer}>
        <Text style={styles.statusMessageIcon}>{statusConfig.messageIcon}</Text>
        <Text style={[styles.statusMessage, { color: statusConfig.color }]}>
          {statusConfig.message}
        </Text>
      </View>

      <Text style={[styles.unitsText, { color: "#666" }]}>
        {progressData.currentUnits} de {progressData.targetUnits} unidades
      </Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}></View>
        <View style={styles.containerProgressBar}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${progressPercentage}%`,
                backgroundColor: statusConfig.color,
              },
            ]}
          >
            {/* Texto dentro de la barra solo si es >= 10% */}
            {progressData.percentage >= 10 && (
              <View style={styles.textContainer}>
                <Text style={styles.progressText}>{displayPercentage}%</Text>
              </View>
            )}
          </View>
          
          {/* Texto fuera de la barra si es < 10% */}
          {progressData.percentage < 10 && (
            <View style={[
              styles.textContainerOutside,
              {
                left: `${Math.max(progressPercentage + 2, 8)}%`, // Posición dinámica con mínimo
              }
            ]}>
              <Text style={[styles.progressTextOutside, { color: statusConfig.color }]}>
                {displayPercentage}%
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View
          style={[
            styles.statBox,
            { backgroundColor: statusConfig.backgroundColor },
          ]}
        >
          <Text style={[styles.statLabel, { color: statusConfig.color }]}>
            Meta
          </Text>
          <Text style={styles.statValue}>{progressData.metaAmount}</Text>
        </View>
        <View
          style={[
            styles.statBox,
            { backgroundColor: statusConfig.backgroundColor },
          ]}
        >
          <Text style={[styles.statLabel, { color: statusConfig.color }]}>
            Recibido
          </Text>
          <Text style={styles.statValue}>{progressData.receivedAmount}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerLeftPoint: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F0F4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  balancePointContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 10,
    padding: 16,
    backgroundColor: "white",
    gap: 12,
    marginBottom: 20,
  },
  // Estilos para cuando no hay datos
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 150,
  },
  noDataText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  // Estilos para el estado de configuración
  configurationContainer: {
    alignItems: "center",
    paddingBottom: 12,
    gap: 8,
  },
  configIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F4FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    marginTop: -16,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  configSubtitle: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: -4,
  },
  configButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5B7EFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  configButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  // Nuevos estilos para el estado de costos mensuales
  monthlyCostsContainer: {
    alignItems: "center",
    paddingBottom: 12,
    gap: 8,
  },
  checkIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    marginTop: -16,
  },
  monthlyCostsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  monthlyCostsSubtitle: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: -4,
    marginBottom: 8,
  },
  monthlyLabel: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 4,
  },
  monthlyAmount: {
    fontSize: 24,
    fontWeight: "600",
    color: "#5B7EFF",
    textAlign: "center",
    marginBottom: 12,
  },
  confirmationText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  // Nuevo estilo para mensajes de error
  errorText: {
    fontSize: 12,
    color: "#ff6b47",
    textAlign: "center",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  // Contenedor para botones lado a lado
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  acceptButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5B7EFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
  },
  acceptButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  continueButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#5B7EFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
  },
  continueButtonText: {
    color: "#5B7EFF",
    fontSize: 13,
    fontWeight: "600",
  },
  // Nuevo estilo para botones deshabilitados
  buttonDisabled: {
    opacity: 0.6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontWeight: "400",
    fontSize: 16,
    color: "#666",
  },
  tagContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  // Nuevos estilos para el mensaje del estado
  statusMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end", // Alineado a la derecha
    gap: 4,
    marginTop: -8, // Reduce el espacio entre el header y el mensaje
  },
  statusMessageIcon: {
    fontSize: 12, // Más pequeño que antes
  },
  statusMessage: {
    fontSize: 12, // Más pequeño que antes
    fontWeight: "500",
  },
  weekText: {
    fontSize: 12,
    color: "#666",
  },
  unitsText: {
    fontSize: 14,
    color: "#666",
    marginTop: -4,
  },
  progressContainer: {
    height: 20,
    justifyContent: "center",
    position: "relative",
  },
  containerProgressBar: {
    position: "absolute",
    zIndex: 20,
    width: "100%",
    height: 20,
  },
  progressBackground: {
    height: 20,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.13)",
    borderRadius: 10,
    position: "absolute",
  },
  progressBar: {
    height: 20,
    borderRadius: 10,
    position: "absolute",
  },
  textContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  progressText: {
    fontSize: 14,
    color: "white",
    fontWeight: "600",
  },
  // Nuevos estilos para texto fuera de la barra
  textContainerOutside: {
    position: "absolute",
    height: "100%",
    justifyContent: "center",
    alignItems: "flex-start",
    zIndex: 25,
  },
  progressTextOutside: {
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: "hidden",
  },
  percentageRight: {
    position: "absolute",
    right: -30,
    fontSize: 14,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 18,
    color: "#333",
    fontWeight: "600",
  },
});

export default BalancePoint;
    