import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");
const cardWidth = screenWidth - 80; // Permite ver parte de la siguiente tarjeta
const cardMargin = 10;
const slideSize = cardWidth + cardMargin;

function PracticalAdviceCarousel() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<any>(null);

  // Datos simulados - en tu app real vendrían de props o estado
  const businessData = {
    multiplier: 1.4,
    profitPerProduct: 27000,
    reserveDays: 7,
    todayROI: 122.5,
    monthlyROI: 3675,
  };

  const getMultiplierAdvice = () => {
    const { multiplier } = businessData;
    const isGood = multiplier >= 1.3;

    return {
      emoji: "💰",
      title: `Ten siempre una reserva`,
      description:
        "Buena gestión de efectivo, puede resistir días flojos y aprovechar oportunidades de compra .",
      borderColor: isGood ? "#10B981" : "#EF4444",
      backgroundColor: isGood ? "#ECFDF5" : "#FEF2F2",
      isAlert: !isGood,
    };
  };

  const getProfitAdvice = () => {
    const { profitPerProduct } = businessData;
    const formattedProfit = (profitPerProduct / 1000).toFixed(0);

    return {
      emoji: "🎯",
      title: `Establece metas financieras`,
      description: "Define objetivos claros de ventas e ingresos, esto te ayudará a mantenerte enfocado y medir tu progreso.",
      borderColor: "#3B82F6",
      backgroundColor: "#EFF6FF",
    };
  };

  const getReserveAdvice = () => {
    const { reserveDays } = businessData;
    const isGood = reserveDays >= 7;

    return {
      emoji: "✅",
      title: `Aprovecha los días de mayor venta`,
      description: "Identifica tus mejores días y prepárate con más inventario y personal para maximizar ingresos.",
      borderColor: isGood ? "#8B5CF6" : "#EF4444",
      backgroundColor: isGood ? "#F3E8FF" : "#FEF2F2",
      isAlert: !isGood,
    };
  };

  const getROIAdvice = () => {
    const { todayROI, monthlyROI } = businessData;

    return {
      emoji: "📊",
      title: `Planifica para temporadas altas y bajas`,
      description: `Prepárate financieramente para épocas de pocas ventas y aprovecha las temporadas fuertes para crear reservas.`,
      borderColor: "#F59E0B",
      backgroundColor: "#FFFBEB",
    };
  };

  const adviceCards = [
    getMultiplierAdvice(),
    getProfitAdvice(),
    getReserveAdvice(),
    getROIAdvice(),
  ];

  const goToSlide = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: slideSize * index,
      animated: true,
    });
  };

  const renderAdviceCard = (config: any, index: number) => {
    const {
      emoji,
      title,
      description,
      backgroundColor,
      isAlert = false,
    } = config;

    return (
      <View
        key={index}
        style={[
          styles.cardContainer,
          {
            backgroundColor: backgroundColor,
            width: cardWidth,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.emojiContainer}>
            <Text style={styles.cardEmoji}>{emoji}</Text>
          </View>
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={[styles.cardDescription, isAlert && styles.alertText]}>
          {description}
        </Text>
      </View>
    );
  };

  const renderIndicators = () => {
    return (
      <View style={styles.indicatorContainer}>
        {adviceCards.map((_, index) => {
          const inputRange = [
            (index - 1) * slideSize,
            index * slideSize,
            (index + 1) * slideSize,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: "clamp",
          });

          const backgroundColor = scrollX.interpolate({
            inputRange,
            outputRange: ["#CBD5E1", "#3B82F6", "#CBD5E1"],
            extrapolate: "clamp",
          });

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              onPress={() => goToSlide(index)}
            >
              <Animated.View
                style={[
                  styles.indicator,
                  {
                    width: dotWidth,
                    opacity,
                    backgroundColor,
                  },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💡 Consejos Prácticos</Text>
      </View>

      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={slideSize}
        snapToAlignment="start"
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
        contentInsetAdjustmentBehavior="never"
      >
        {adviceCards.map((advice, index) => renderAdviceCard(advice, index))}
      </Animated.ScrollView>

      {renderIndicators()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  header: {
    marginBottom: 16,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  scrollView: {
    marginHorizontal: -16,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  cardContainer: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 16,
    marginRight: cardMargin,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 120,
  },
  cardHeader: {
    marginBottom: 12,
    alignItems: "flex-start",
  },
  emojiContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  cardEmoji: {
    fontSize: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    lineHeight: 20,
  },
  cardDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 18,
  },
  alertText: {
    color: "#DC2626",
    fontWeight: "600",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    height: 12,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default PracticalAdviceCarousel;
