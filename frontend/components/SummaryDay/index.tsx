import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View, Animated } from "react-native";

function SummaryDay({ data, loading }: any) {

  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  const today = new Date();

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

  const formatCurrencyBalance = (value: any) => {
    const num = parseFloat(value) || 0;
    return `${num.toLocaleString("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };
  // Función para formatear números con K (miles)
  const formatCurrency = (value: any) => {
    const num = parseFloat(value) || 0;
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`;
    }
    return `$${num.toFixed(0)}`;
  };

  // Función para formatear unidades
  const formatUnits = (value: any) => {
    const num = parseFloat(value) || 0;
    return num.toFixed(0);
  };

  if (loading) {
    return (
      <View style={styles.containerSummaryDay}>
        <View style={styles.containerTitleSummary}>
          <View>
            <View style={styles.titleLeftHeader}>
              <View style={styles.iconContainer}>
                <SkeletonBox width={20} height={20} />
              </View>
              <SkeletonBox width={60} height={16} />
            </View>
            <SkeletonBox width={120} height={32} style={{ marginTop: 4 }} />
          </View>
          <View style={styles.rightheader}>
            <View style={styles.rightheadertitle}>
              <SkeletonBox width={20} height={20} />
              <SkeletonBox width={60} height={16} style={{ marginLeft: 4 }} />
            </View>
            <SkeletonBox width={80} height={24} style={{ marginTop: 4 }} />
          </View>
        </View>

        <View style={styles.contentSummaryDay}>
          <View style={[styles.containerInfo, styles.salesCard]}>
            <View style={styles.containerHeaderMiniCard}>
              <View
                style={[
                  styles.miniIconContainer,
                  { backgroundColor: "#D1FAE5" },
                ]}
              >
                <SkeletonBox width={14} height={14} />
              </View>
              <SkeletonBox width={45} height={14} />
            </View>
            <SkeletonBox width={55} height={18} />
          </View>

          <View style={[styles.containerInfo, styles.expensesCard]}>
            <View style={styles.containerHeaderMiniCard}>
              <View
                style={[
                  styles.miniIconContainer,
                  { backgroundColor: "#FECACA" },
                ]}
              >
                <SkeletonBox width={14} height={14} />
              </View>
              <SkeletonBox width={45} height={14} />
            </View>
            <SkeletonBox width={55} height={18} />
          </View>

          <View style={[styles.containerInfo, styles.unitsCard]}>
            <View style={styles.containerHeaderMiniCard}>
              <View
                style={[
                  styles.miniIconContainer,
                  { backgroundColor: "#E9D5FF" },
                ]}
              >
                <SkeletonBox width={14} height={14} />
              </View>
              <SkeletonBox width={45} height={14} />
            </View>
            <SkeletonBox width={55} height={18} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.containerSummaryDay}>
      <View style={styles.containerTitleSummary}>
        <View>
          <View style={styles.titleLeftHeader}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="balance" size={20} color="#5B7EFF" />
            </View>
            <Text style={styles.titleCard}>Utilidad</Text>
          </View>
          <Text style={styles.titleValueCard}>
            $ {formatCurrencyBalance(data.balance)}
          </Text>
        </View>
        <View style={styles.rightheader}>
          <View style={styles.rightheadertitle}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.titleCardRight}>Hoy</Text>
          </View>
          <Text style={styles.rightValueCard}>
            {today.toISOString().split('T')[0]}
          </Text>
        </View>
      </View>

      <View style={styles.contentSummaryDay}>
        <View style={[styles.containerInfo, styles.salesCard]}>
          <View style={styles.containerHeaderMiniCard}>
            <View
              style={[styles.miniIconContainer, { backgroundColor: "#00C896" }]}
            >
              <Feather name="shopping-cart" size={16} color="white" />
            </View>
            <Text style={styles.labelCard}>Ventas</Text>
          </View>
          <Text style={styles.valueCard} numberOfLines={1} adjustsFontSizeToFit>
            {formatCurrency(data.totalIngresos)}
          </Text>
        </View>

        <View style={[styles.containerInfo, styles.expensesCard]}>
          <View style={styles.containerHeaderMiniCard}>
            <View
              style={[styles.miniIconContainer, { backgroundColor: "#FF4757" }]}
            >
              <Ionicons name="trending-down" size={16} color="white" />
            </View>
            <Text style={styles.labelCard}>Gastos</Text>
          </View>
          <Text style={styles.valueCard} numberOfLines={1} adjustsFontSizeToFit>
            {formatCurrency(data.totalEgresos)}
          </Text>
        </View>

        <View style={[styles.containerInfo, styles.unitsCard]}>
          <View style={styles.containerHeaderMiniCard}>
            <View
              style={[styles.miniIconContainer, { backgroundColor: "#8B5FBF" }]}
            >
              <Feather name="package" size={16} color="white" />
            </View>
            <Text style={styles.labelCard}>Unidades</Text>
          </View>
          <Text style={styles.valueCard} numberOfLines={1} adjustsFontSizeToFit>
            {formatUnits(data.totalProductosVendidos)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerSummaryDay: {
    height: "auto",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 16,
    paddingBottom: 20,
    marginBottom: 20,
    backgroundColor: "white",
  },
  containerTitleSummary: {
    paddingLeft: 20,
    paddingTop: 20,
    paddingRight: 20,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleLeftHeader: {
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
  titleCard: {
    fontWeight: "400",
    fontSize: 16,
    color: "#666",
  },
  titleValueCard: {
    fontSize: 32,
    fontWeight: "700",
    color: "#000",
    marginTop: 4,
  },
  rightheader: {
    alignItems: "flex-end",
  },
  rightheadertitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  titleCardRight: {
    fontWeight: "400",
    fontSize: 16,
    color: "#666",
    marginLeft: 4,
  },
  rightValueCard: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 4,
  },
  contentSummaryDay: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    gap: 10,
  },
  containerInfo: {
    flex: 1,
    height: 84,
    borderRadius: 12,
    padding: 12,
    justifyContent: "space-between",
  },
  salesCard: {
    backgroundColor: "#E8F9F5",
  },
  expensesCard: {
    backgroundColor: "#FFE8EA",
  },
  unitsCard: {
    backgroundColor: "#F2EDFF",
  },
  containerHeaderMiniCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  miniIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  labelCard: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  valueCard: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
});

export default SummaryDay;