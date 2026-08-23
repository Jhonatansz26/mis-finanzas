import React, { useState, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");
const cardWidth = screenWidth - 80; // Permite ver parte de la siguiente tarjeta

function PracticalAdviceCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef: any = useRef(null);

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

  const handleScroll = (event: any) => {
    const slideSize = cardWidth + 12; // card width + margin
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  };

  const goToSlide = (index: any) => {
    const slideSize = cardWidth + 12;
    scrollViewRef.current?.scrollTo({
      x: slideSize * index,
      animated: true,
    });
    setCurrentIndex(index);
  };

  const renderAdviceCard = (config: any, index: any) => {
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
        {adviceCards.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.indicator,
              currentIndex === index && styles.activeIndicator,
            ]}
            onPress={() => goToSlide(index)}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💡 Consejos Prácticos</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        decelerationRate="fast"
        snapToInterval={cardWidth + 12}
        snapToAlignment="center"
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
        contentInsetAdjustmentBehavior="never"
      >
        {adviceCards.map((advice, index) => renderAdviceCard(advice, index))}
      </ScrollView>

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
    marginRight: 10,
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
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: "#3B82F6",
    width: 32,
    height: 8,
  },
});

export default PracticalAdviceCarousel;
