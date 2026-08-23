import React, { useEffect, useState } from "react";
import { View } from "react-native";
import WeeklyPerformance from "../WeeklyPerformance";
import BestSellers from "../BestSellers";
import ExecutiveReports from "../ExecutiveReports";
import AnalysisCards from "../AnalysisCards";
import api from "../../api/apiConfig";
import useBusinessStore from "../../hooks/useBusinessStore";
import DateSelector, { PeriodType } from "../DateSelector";

interface MetricData {
  icon: string;
  iconType: "FontAwesome6" | "Feather" | "MaterialIcons" | "AntDesign";
  iconColor: string;
  value: string;
  label: string;
  backgroundColor: string;
}

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

interface WeeklySellersProduct {
  cantidad_total_vendida: string;
  fin_semana: string;
  ganancia_total_producto: string;
  ingresos_formatted: string;
  ingresos_generados: string;
  inicio_semana: string;
  porcentaje_cantidad: string;
  producto_id: number;
  producto_nombre: string;
  ranking_por_cantidad: number;
}

function WeeklyAnalytics() {
  const { activeBusiness } = useBusinessStore();

  const [weekInsights, setWeekInsights] = useState<MetricData[]>([]);
  const [weeklyPerformanceData, setWeeklyPerformanceData] = useState<WeeklyDataItem[]>([]);
  const [weeklySellersData, setWeeklySellersData] = useState<WeeklySellersProduct[]>([]);

  // Estado de carga simplificado
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Estados para el DateSelector
  const [currentDate, setCurrentDate] = useState(new Date());
  const periodType: PeriodType = "week";

  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    // Resetear estados cuando cambie la fecha
    setDataLoaded(false);
    setWeekInsights([]); // Limpiar insights previos
    setWeeklyPerformanceData([]);
    setWeeklySellersData([]);

    if (activeBusiness?.id) {
      fetchWeekInfo();
    }
  }, [currentDate, activeBusiness?.id]);

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

  const fetchWeekInfo = async () => {
    try {
      setIsLoading(true);
      const formattedDate = formatDateForAPI(currentDate);
      
      const response = await api.get(
        `analytics/week/${activeBusiness?.id}?fecha=${formattedDate}`
      );
      
      console.log("insights", response.data["insights"]);
      console.log("Performance", response.data["responsePerformance"]);
      console.log("BEST SELLERS", response.data["responseBestSellers"]);

      // Procesar y setear los datos
      setWeeklyPerformanceData(response.data["responsePerformance"] || []);
      setWeeklySellersData(response.data["responseBestSellers"] || []);
      
      // Construir los insights para el AnalysisCards
      const insights = response.data["insights"];
      if (insights) {
        const formattedInsights: MetricData[] = [
          {
            icon: "star",
            iconType: "AntDesign",
            iconColor: "#f59e0b",
            value: insights["bestDay"] || "N/A",
            label: "mejor día",
            backgroundColor: "rgba(255,251,235,1)",
          },
          {
            icon: "shopping-bag",
            iconType: "Feather",
            iconColor: "#a855f7",
            value: formatProductCount(insights["productsSold"] || "0"),
            label: "productos vendidos",
            backgroundColor: "rgba(250,245,255,1)",
          },
        ];
        
        setWeekInsights(formattedInsights);
      }

      // Simular un pequeño delay para mostrar el skeleton
      setTimeout(() => {
        setDataLoaded(true);
      }, 300);

    } catch (error) {
      console.error("Error fetching week data", error);
      // En caso de error, setear datos vacíos pero marcar como cargado
      setWeekInsights([]);
      setWeeklyPerformanceData([]);
      setWeeklySellersData([]);
      setDataLoaded(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
    console.log("Nueva fecha seleccionada para análisis semanal:", newDate);
  };

  return (
    <View>
      <DateSelector
        periodType={periodType}
        currentDate={currentDate}
        onDateChange={handleDateChange}
      />
      
      <AnalysisCards
        type="weekly"
        currentDate={currentDate}
        showData={dataLoaded}
        onDataLoaded={() => {}} // Ya no necesitamos esta función
        insights={weekInsights}
      />

      <WeeklyPerformance
        data={weeklyPerformanceData}
        loading={!dataLoaded}
      />

      <BestSellers
        data={weeklySellersData}
        loading={!dataLoaded}
      />
      
      <ExecutiveReports fecha={currentDate} periodType="week"/>
    </View>
  );
}

export default WeeklyAnalytics;