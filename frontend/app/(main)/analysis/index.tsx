import React, { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import LayoutMain from "../../../components/LayoutHome";
import { FontAwesome6, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import TooglePeriod from "../../../components/TogglePeriod";
import WeeklyAnalytics from "../../../components/WeeklyAnalytics";
import MonthlyAnalytics from "../../../components/MonthlyAnalytics";
import TodayAnalytics from "../../../components/TodayAnalytics";

function Analysis() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState("Semana");

  const handlePeriodChange = (period:any) => {
    setSelectedPeriod(period);
  };

  const renderAnalyticsComponent = () => {
    switch (selectedPeriod) {
      case "Hoy":
        return <TodayAnalytics />;
      case "Semana":
        return <WeeklyAnalytics />;
      case "Mes":
        return <MonthlyAnalytics />;
      default:
        return <WeeklyAnalytics />;
    }
  };

  return (
    <LayoutMain>
      <View style={styles.headerHome}>
        <Text style={styles.titleHeader}>Análisis Financiero</Text>
        <View style={{ paddingRight: 5 }}>
          <Image
            source={require("../../../assets/icon.png")}
            style={{
              width: 70,
              height: 46,
              marginTop: -9
            }}
          />
        </View>
      </View>
      <ScrollView   showsVerticalScrollIndicator={false} style={styles.contentAnalysis}>
        <TooglePeriod onSelectChange={handlePeriodChange} />
        {renderAnalyticsComponent()}
      </ScrollView>
    </LayoutMain>
  );
}

const styles = StyleSheet.create({
  contentAnalysis: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: "#f5f5f5",
  },
  titleHeader: {
    color: "black",
    fontSize: 24,
    fontWeight: "700",
    borderBottomWidth: 2,
    borderBottomColor: "#16a34a",
  },
  headerHome: {
    height: 75,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 29,
    backgroundColor: "white",
       borderBottomWidth:1,
    borderColor:'#ddd'
  },
  contentDescription: {
    fontSize: 16,
    marginBottom: 20,
    color: "#333",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    height: 25,
  },
  selectButtonText: {
    color: "#16a34a",
    fontWeight: "500",
    marginRight: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 16,
    color: "#333",
  },
  recentContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  recentInfo: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  recentDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  viewButton: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  viewButtonText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
});

export default Analysis;