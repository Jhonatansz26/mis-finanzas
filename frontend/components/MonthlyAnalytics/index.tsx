import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import MonthlyBestSellers from "../MonthlyBestSellers";
import ExecutiveReports from "../ExecutiveReports";
import AnalysisCards from "../AnalysisCards";
import DateSelector, { PeriodType } from "../DateSelector";
import useBusinessStore from "../../hooks/useBusinessStore";
import api from "../../api/apiConfig";
import MonthlyPerformance from "../MonthlyPerformance";

interface MetricData {
  icon: string;
  iconType: "FontAwesome6" | "Feather" | "MaterialIcons" | "AntDesign";
  iconColor: string;
  value: string;
  label: string;
  backgroundColor: string;
}

// Tipado para los datos que vienen de la API
interface MonthlyPerformanceAPIData {
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

// Interface para los datos de best sellers mensuales
interface MonthlyBestSellersAPIData {
  año_mes: number;
  cantidad_total_vendida: string;
  fin_mes: string;
  ganancia_total_producto: string;
  ingresos_formatted: string;
  ingresos_generados: string;
  inicio_mes: string;
  nombre_mes: string;
  porcentaje_cantidad: string;
  producto_id: number;
  producto_nombre: string;
  ranking_por_cantidad: number;
}

function MonthlyAnalytics() {
  const { activeBusiness } = useBusinessStore();

  const [monthInsights, setMonthInsights] = useState<MetricData[]>([]);
  const [monthPerformanceData, setMonthPerformanceData] = useState<
    MonthlyPerformanceAPIData[]
  >([]);
  const [monthSellersData, setMonthSellersData] = useState<
    MonthlyBestSellersAPIData[]
  >([]);

  // Estado de carga simplificado
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const periodType: PeriodType = "month";

  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    // Resetear estados cuando cambie la fecha
    setDataLoaded(false);
    setMonthInsights([]); // Limpiar insights previos
    setMonthPerformanceData([]);
    setMonthSellersData([]);

    if (activeBusiness?.id) {
      fetchMonthInfo();
    }
  }, [currentDate, activeBusiness?.id]);

  const calculateDaysElapsed = (currentDate: Date): number => {
    const today = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    return Math.min(
      Math.floor(
        (today.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1,
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      ).getDate()
    );
  };

  const calculateDaysWithSales = (
    performanceData: MonthlyPerformanceAPIData[]
  ): number => {
    const weeksWithSales =
      performanceData?.filter(
        (week: MonthlyPerformanceAPIData) =>
          parseFloat(week.total_ingresos || "0") > 0
      )?.length || 0;

    return weeksWithSales * 5; // Asumiendo 5 días laborales por semana
  };

  const fetchMonthInfo = async () => {
    try {
      setIsLoading(true);
      const formattedDate = formatDateForAPI(currentDate);

      const response = await api.get(
        `analytics/month/${activeBusiness?.id}?fecha=${formattedDate}`
      );

      console.log("DATOS MENSUALES COMPLETOS:", response.data);
      console.log("Performance mensual:", response.data["responsePerformance"]);
      console.log(
        "Best sellers mensual:",
        response.data["responseBestSellers"]
      );
      console.log("Insights mensual:", response.data["insights"]);

      // Procesar y setear los datos
      const performanceData = response.data["responsePerformance"] || [];
      setMonthPerformanceData(performanceData);
      setMonthSellersData(response.data["responseBestSellers"] || []);

      // Construir los insights para el AnalysisCards
      const insights = response.data["insights"];
      const diasTranscurridos = calculateDaysElapsed(currentDate);
      const diasConVentas = calculateDaysWithSales(performanceData);

      const formattedInsights: MetricData[] = [
        {
          icon: "calendar",
          iconType: "Feather",
          iconColor: "#3b82f6",
          value:
            insights?.daysElapsed?.toString() || diasTranscurridos.toString(),
          label: "días transcurridos",
          backgroundColor: "rgba(239,246,255,1)",
        },
        {
          icon: "check-circle",
          iconType: "Feather",
          iconColor: "#16a34a",
          value:
            insights?.daysWithSales?.toString() || diasConVentas.toString(),
          label: "días con ventas",
          backgroundColor: "rgba(240,253,244,1)",
        },
      ];

      setMonthInsights(formattedInsights);

      // Simular un pequeño delay para mostrar el skeleton
      setTimeout(() => {
        setDataLoaded(true);
      }, 300);
    } catch (error) {
      console.error("Error fetching month data", error);
      // En caso de error, setear datos vacíos pero marcar como cargado
      setMonthInsights([]);
      setMonthPerformanceData([]);
      setMonthSellersData([]);
      setDataLoaded(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (newDate: Date): void => {
    setCurrentDate(newDate);
    console.log("Nueva fecha seleccionada para análisis mensual:", newDate);
  };

  return (
    <View style={styles.container}>
      <DateSelector
        periodType={periodType}
        currentDate={currentDate}
        onDateChange={handleDateChange}
      />

      <AnalysisCards
        type="monthly"
        currentDate={currentDate}
        showData={dataLoaded}
        onDataLoaded={() => {}} // Ya no necesitamos esta función
        insights={monthInsights}
      />

      <MonthlyPerformance data={monthPerformanceData} loading={!dataLoaded} />

      <MonthlyBestSellers data={monthSellersData} loading={!dataLoaded} />

     {/*  <ExecutiveReports fecha={currentDate} periodType="month"/> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MonthlyAnalytics;
