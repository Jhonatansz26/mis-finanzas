import { Feather, FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";

// Interface para los datos que recibe el componente
interface ProductProfitData {
  estadisticas_generales: {
    ganancia_promedio_unitaria: number;
    ganancia_total_negocio: number;
    margen_promedio_porcentaje: number;
    total_productos: number;
    total_productos_vendidos: string;
  };
  periodo: {
    fecha_fin: string;
    fecha_inicio: string;
  };
  productos: Array<{
    cantidad_vendida: string;
    costo_unitario: number;
    ganancia_total: string;
    ganancia_unitaria: number;
    margen_ganancia_porcentaje: string;
    precio_unitario: number;
    producto_id: number;
    producto_nombre: string;
  }>;
  productos_mas_rentables: Array<{
    ganancia_total: string;
    nombre: string;
  }>;
  productos_menos_rentables: Array<{
    ganancia_total: string;
    nombre: string;
  }>;
}

interface ProductProfitProps {
  data: ProductProfitData | null;
  loading: boolean;
}

const statusConfig: any = {
  excelente: {
    color: "#4CAF50",
    text: "Excelente",
    icon: "✓",
  },
  bueno: {
    color: "#2196F3",
    text: "Bueno",
    icon: "↗",
  },
  revisar: {
    color: "#FF9800",
    text: "Revisar",
    icon: "⚠",
  },
  pérdida: {
    color: "#F44336",
    text: "Pérdida",
    icon: "⚠",
  },
};

function ProductProfit({ data, loading }: ProductProfitProps) {
  const [expanded, setExpanded] = useState(false);
  
  const router = useRouter()
  // Animación para el skeleton
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

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Función para determinar el estado basado en el margen de ganancia
  const getProductStatus = (margenPorcentaje: string, gananciaTotalStr: string) => {
    const margen = parseFloat(margenPorcentaje || "0");
    const gananciaTotal = parseFloat(gananciaTotalStr || "0");
    
    if (gananciaTotal < 0) return 'pérdida';
    if (margen >= 30) return 'excelente';
    if (margen >= 15) return 'bueno';
    return 'revisar';
  };

  // Función para obtener el color de fondo basado en el estado
  const getBackgroundColor = (status: string) => {
    switch (status) {
      case 'excelente': return '#E8F5E8';
      case 'bueno': return '#E3F2FD';
      case 'revisar': return '#FFF8E1';
      case 'pérdida': return '#FFEBEE';
      default: return '#F5F5F5';
    }
  };

  // Función para formatear números con validación de null/undefined
  const formatCurrency = (value: number | string | null | undefined) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    const safeValue = numValue && !isNaN(numValue) ? numValue : 0;
    
    if (safeValue >= 1000) {
      return `$${(safeValue / 1000).toFixed(0)}K`;
    }
    return `$${safeValue.toFixed(0)}`;
  };

  const formatCurrencyFromString = (valueStr: string | null | undefined) => {
    const value = parseFloat(valueStr || "0");
    return formatCurrency(value);
  };

  // Función segura para formatear con toLocaleString
  const formatCurrencyBalance = (value: number | string | null | undefined) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    const safeValue = numValue && !isNaN(numValue) ? numValue : 0;
    
    try {
      return safeValue.toLocaleString('es-CO', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
      });
    } catch (error) {
      // Fallback si toLocaleString falla
      return safeValue.toFixed(0);
    }
  };

  const getPriceRange = (costoUnitario: number | null | undefined, precioUnitario: number | null | undefined) => {
    const safeCosto = costoUnitario && !isNaN(costoUnitario) ? costoUnitario : 0;
    const safePrecio = precioUnitario && !isNaN(precioUnitario) ? precioUnitario : 0;
    return `${formatCurrency(safePrecio)} - ${formatCurrency(safeCosto)}`;
  };

  const ProductCard = ({ product, index }: any) => {
    const status = getProductStatus(product.margen_ganancia_porcentaje, product.ganancia_total);
    const backgroundColor = getBackgroundColor(status);
    const safeGananciaUnitaria = product.ganancia_unitaria && !isNaN(product.ganancia_unitaria) ? product.ganancia_unitaria : 0;
    const gananciaUnitariaFormatted = safeGananciaUnitaria >= 0 
      ? `+${formatCurrency(safeGananciaUnitaria)}`
      : formatCurrency(safeGananciaUnitaria);

    return (
      <View style={[styles.productCard, { backgroundColor }]}>
        <View style={styles.productLeft}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: statusConfig[status].color },
            ]}
          />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.producto_nombre || "Sin nombre"}</Text>
            <Text style={styles.priceRange}>
              {getPriceRange(product.costo_unitario, product.precio_unitario)}
            </Text>
          </View>
        </View>
        <View style={styles.productRight}>
          <Text
            style={[
              styles.profit,
              {
                color: statusConfig[status].color,
              },
            ]}
          >
            {gananciaUnitariaFormatted}
          </Text>
          <View style={styles.statusContainer}>
            <Text
              style={[
                styles.statusText,
                { color: statusConfig[status].color },
              ]}
            >
              {statusConfig[status].text}
            </Text>
            <Text
              style={[
                styles.statusIcon,
                { color: statusConfig[status].color },
              ]}
            >
              {statusConfig[status].icon}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Skeleton para las tarjetas de productos
  const ProductCardSkeleton = () => (
    <View style={[styles.productCard, { backgroundColor: '#F5F5F5' }]}>
      <View style={styles.productLeft}>
        <SkeletonBox width={6} height={6} style={{ borderRadius: 3, marginRight: 10 }} />
        <View style={styles.productInfo}>
          <SkeletonBox width={100} height={16} style={{ marginBottom: 4 }} />
          <SkeletonBox width={80} height={12} />
        </View>
      </View>
      <View style={styles.productRight}>
        <SkeletonBox width={60} height={16} style={{ marginBottom: 4 }} />
        <View style={styles.statusContainer}>
          <SkeletonBox width={50} height={12} style={{ marginRight: 4 }} />
          <SkeletonBox width={12} height={12} />
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.containerProductProfit}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.containerLeftPoint}>
            <View style={styles.iconContainer}>
              <FontAwesome6 name="money-bills" size={15} color="#5B7EFF" />
            </View>
            <Text style={styles.title}>Ganancia</Text>
          </View>
          <Text style={styles.subtitle}>Pesos por unidad</Text>
        </View>

        {/* Summary Section Skeleton */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryIcon}>
            <Text style={styles.summaryIconText}>$</Text>
          </View>
          <SkeletonBox width={180} height={14} style={{ marginBottom: 4 }} />
          <SkeletonBox width={80} height={24} style={{ marginBottom: 4 }} />
          <SkeletonBox width={150} height={12} />
        </View>

        {/* Products List Skeleton */}
        <ScrollView
          style={[styles.productsScrollContainer, styles.contractedContainer]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          contentContainerStyle={styles.scrollContent}
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </ScrollView>

        {/* Toggle Button Skeleton */}
        <View style={[styles.toggleButton, { backgroundColor: '#E1E9EE' }]}>
          <SkeletonBox width={60} height={16} />
        </View>
      </View>
    );
  }

  // Si no hay datos o no hay productos, mostrar el diseño de la imagen
  if (!data || !data.productos || data.productos.length === 0) {
    return (
      <View style={styles.containerProductProfit}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.containerLeftPoint}>
            <View style={styles.iconContainer}>
              <FontAwesome6 name="money-bills" size={15} color="#5B7EFF" />
            </View>
            <Text style={styles.title}>Ganancia</Text>
          </View>
          <Text style={styles.subtitle}>Pesos por unidad</Text>
        </View>

        {/* No Data Section with exact design from image */}
        <View style={styles.noDataMainContainer}>
          {/* Icon with sparkles */}
          <View style={styles.noDataIconContainer}>
            <View style={styles.noDataIcon}>
              <FontAwesome6 name="cube" size={24} color="#10B981" />
            </View>
            <Text style={styles.sparkle}>✨</Text>
          </View>

          {/* Main message */}
          <Text style={styles.noDataMainTitle}>¡Comienza a generar ganancias!</Text>
          <View style={styles.noDataDescriptionContainer}>
            <Text style={styles.noDataDescription}>
              Aún no has creado productos. Agrega tu primer producto y comienza a{" "}
              <Text style={styles.highlightText}>hacer dinero</Text> hoy mismo.
            </Text>
          </View>

          {/* Summary Section - same as when there's data but with $0 */}
          <View style={styles.summaryContainerNoData}>
            <View style={styles.summaryIcon}>
              <Text style={styles.summaryIconText}>$</Text>
            </View>
            <Text style={styles.summaryTitle}>Ganancia Promedio por Venta</Text>
            <Text style={styles.summaryAmount}>$0</Text>
            <Text style={styles.summarySubtitle}>Total de productos vendidos: 0</Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity style={styles.createProductButton} activeOpacity={0.8} onPress={() => router.push('settings/products/new')}>
            <Text style={styles.createProductButtonIcon}>+</Text>
            <Text style={styles.createProductButtonText}>Crear mi primer producto</Text>
          </TouchableOpacity>

          {/* Tip */}
          <View style={styles.tipContainer}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>Tip: Los productos más exitosos generan hasta $5K por venta</Text>
          </View>
        </View>
      </View>
    );
  }

  // Validar que existan las propiedades necesarias
  const estadisticasGenerales = data.estadisticas_generales || {};
  const productos = data.productos || [];
  const productosAMostrar = expanded ? productos : productos.slice(0, 3);

  return (
    <View style={styles.containerProductProfit}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.containerLeftPoint}>
          <View style={styles.iconContainer}>
            <FontAwesome6 name="money-bills" size={15} color="#5B7EFF" />
          </View>
          <Text style={styles.title}>Ganancia</Text>
        </View>
        <Text style={styles.subtitle}>Pesos por unidad</Text>
      </View>

      {/* Summary Section */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryIcon}>
          <Text style={styles.summaryIconText}>$</Text>
        </View>
        <Text style={styles.summaryTitle}>Ganancia Promedio por Venta</Text>
        <Text style={styles.summaryAmount}>
          ${formatCurrencyBalance(estadisticasGenerales.ganancia_promedio_unitaria)}
        </Text>
        <Text style={styles.summarySubtitle}>
          Total de productos vendidos: {parseFloat(estadisticasGenerales.total_productos_vendidos || "0").toFixed(0)}
        </Text>
      </View>

      {/* Products List */}
      <ScrollView
        style={[
          styles.productsScrollContainer,
          expanded ? styles.expandedContainer : styles.contractedContainer,
        ]}
        showsVerticalScrollIndicator={expanded}
        scrollEnabled={expanded}
        contentContainerStyle={styles.scrollContent}
      >
        {productosAMostrar.map((product, index) => (
          <ProductCard key={product.producto_id || index} product={product} index={index} />
        ))}
      </ScrollView>

      {/* Toggle Button */}
      {productos.length > 3 && (
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={toggleExpanded}
          activeOpacity={0.8}
        >
          <Text style={styles.toggleButtonText}>
            {expanded ? "Ver menos" : "Ver más"}
          </Text>
          <Text style={styles.chevron}>{expanded ? "▲" : "▼"}</Text>
        </TouchableOpacity>
      )}
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
  containerProductProfit: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  trophy: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontWeight: "400",
    fontSize: 16,
    color: "#666",
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  productsScrollContainer: {
    flex: 1,
  },
  contractedContainer: {
    maxHeight: 150,
  },
  expandedContainer: {
    maxHeight: 300,
  },
  scrollContent: {
    gap: 6,
    paddingBottom: 4,
  },
  productCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginBottom: 1,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  productLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 1,
  },
  priceRange: {
    fontSize: 12,
    color: "#6B7280",
  },
  productRight: {
    alignItems: "flex-end",
  },
  profit: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    marginRight: 4,
  },
  statusIcon: {
    fontSize: 12,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6366F1",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    alignSelf: "center",
    minWidth: 100,
  },
  toggleButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },
  chevron: {
    color: "white",
    fontSize: 12,
  },
  summaryContainer: {
    alignItems: "center",
    marginTop: 0,
    paddingTop: 0,
    paddingBottom: 12,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  summaryIcon: {
    backgroundColor: "#10B981",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  summaryIconText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  summaryTitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 2,
  },
  summaryAmount: {
    fontSize: 22,
    fontWeight: "700",
    color: "#10B981",
    marginBottom: 2,
  },
  summarySubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  // Nuevos estilos para el estado sin datos
  noDataMainContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  noDataIconContainer: {
    position: "relative",
    alignItems: "center",
    marginBottom: 16,
  },
  noDataIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  sparkle: {
    position: "absolute",
    top: -5,
    right: -5,
    fontSize: 20,
  },
  noDataMainTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  noDataDescriptionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  noDataDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  highlightText: {
    color: "#10B981",
    fontWeight: "600",
  },
  summaryContainerNoData: {
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    width: "100%",
  },
  createProductButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6366F1",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 16,
    width: "100%",
  },
  createProductButtonIcon: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  createProductButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: "100%",
  },
  tipIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tipText: {
    fontSize: 12,
    color: "#92400E",
    flex: 1,
  },
});

export default ProductProfit;