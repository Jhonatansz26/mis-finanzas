import React, { useEffect, useState } from "react";
import { View } from "react-native";
import DailyPerformance from "../DailyPerformance";
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

interface ComparacionAyer {
  gastos: {
    color: string;
    porcentaje: string;
    signo: string;
  };
  utilidad: {
    color: string;
    porcentaje: string;
    signo: string;
  };
  ventas: {
    color: string;
    porcentaje: string;
    signo: string;
  };
}

interface DesgloseDay {
  margen_dia: {
    porcentaje: string;
  };
  productos_vendidos: string;
  ticket_promedio: {
    formatted: string;
    valor: string;
  };
  transacciones_realizadas: number;
}

interface MetricasPrincipales {
  gastos_registrados: {
    formatted: string;
    valor: string;
  };
  utilidad_dia: {
    formatted: string;
    valor: string;
  };
  ventas_registradas: {
    formatted: string;
    valor: string;
  };
}

interface DailyPerformanceData {
  comparacion_ayer: ComparacionAyer;
  desglose_dia: DesgloseDay;
  fecha: {
    dia_semana: string;
    fecha_consulta: string;
    fecha_formateada: string;
  };
  metricas_principales: MetricasPrincipales;
}

interface DailySellersProduct {
  cantidad_total_vendida: string;
  costo_unitario: number;
  dia_semana: string;
  fecha_formateada: string;
  ganancia_por_unidad: number;
  ganancia_total_producto: string;
  ingresos_formatted: string;
  ingresos_generados: string;
  porcentaje_cantidad: string;
  precio_unitario: number;
  producto_id: number;
  producto_nombre: string;
  ranking_por_cantidad: number;
}

function TodayAnalytics() {
  const { activeBusiness } = useBusinessStore();

  const [dayInsights, setDayInsights] = useState<MetricData[]>([]);
  const [dailyPerformanceData, setDailyPerformanceData] =
    useState<DailyPerformanceData | null>(null);
  const [dailySellersData, setDailySellersData] = useState<
    DailySellersProduct[]
  >([]);

  // Estado de carga simplificado
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Estados para el DateSelector
  const [currentDate, setCurrentDate] = useState(new Date());
  const periodType: PeriodType = "day";

  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    setDataLoaded(false);
    setDayInsights([]);
    setDailyPerformanceData(null);
    setDailySellersData([]);

    if (activeBusiness?.id) {
      fetchDayInfo();
    }
  }, [currentDate, activeBusiness?.id]);

  const formatProductCount = (value: string | number): string => {
    const num = parseFloat(value.toString());
    if (num === 0) return "0";

    if (num >= 1000000) {
      return `${Math.floor(num / 1000000)}M`;
    } else if (num >= 1000) {
      return `${Math.floor(num / 1000)}K`;
    } else {
      return Math.floor(num).toString();
    }
  };

  const fetchDayInfo = async () => {
    try {
      setIsLoading(true);
      const formattedDate = formatDateForAPI(currentDate);

      const response = await api.get(
        `analytics/day/${activeBusiness?.id}?fecha=${formattedDate}`
      );

      console.log("DATOS DIARIOS COMPLETOS:", response.data);
      console.log("Performance diario:", response.data["responsePerformance"]);
      console.log("Best sellers diario:", response.data["responseBestSellers"]);
      console.log("Insights diario:", response.data["insights"]);

      setDailyPerformanceData(response.data["responsePerformance"] || null);
      setDailySellersData(response.data["responseBestSellers"] || []);

      const insights = response.data["insights"];
      if (insights) {
        const formattedInsights: MetricData[] = [
          {
            icon: "receipt",
            iconType: "MaterialIcons",
            iconColor: "#3b82f6",
            value: insights["todayTransactions"]?.toString() || "0",
            label: "transacciones hoy",
            backgroundColor: "rgba(239,246,255,1)",
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

        setDayInsights(formattedInsights);
      }

      // Simular un pequeño delay para mostrar el skeleton
      setTimeout(() => {
        setDataLoaded(true);
      }, 300);
    } catch (error) {
      console.error("Error fetching day data", error);
      // En caso de error, setear datos vacíos pero marcar como cargado
      setDayInsights([]);
      setDailyPerformanceData(null);
      setDailySellersData([]);
      setDataLoaded(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  // Función para transformar los datos del performance para el componente DailyPerformance
  const transformPerformanceData = (data: DailyPerformanceData) => {
    if (!data) return null;

    return {
      mainMetrics: [
        {
          label: "Ventas registradas",
          value: data.metricas_principales.ventas_registradas.formatted,
          color: "#10B981",
          dotColor: "#10B981",
        },
        {
          label: "Gastos registrados",
          value: data.metricas_principales.gastos_registrados.formatted,
          color: "#EF4444",
          dotColor: "#EF4444",
        },
        {
          label: "Utilidad del día",
          value: data.metricas_principales.utilidad_dia.formatted,
          color: "#3B82F6",
          dotColor: "#3B82F6",
        },
      ],
      comparisons: [
        {
          label: "Ventas",
          percentage: `${data.comparacion_ayer.ventas.signo}${data.comparacion_ayer.ventas.porcentaje}%`,
          color:
            data.comparacion_ayer.ventas.color === "green"
              ? "#10B981"
              : "#EF4444",
          backgroundColor:
            data.comparacion_ayer.ventas.color === "green"
              ? "rgba(240,253,244,1)"
              : "rgba(254,242,242,1)",
        },
        {
          label: "Gastos",
          percentage: `${data.comparacion_ayer.gastos.signo}${data.comparacion_ayer.gastos.porcentaje}%`,
          color:
            data.comparacion_ayer.gastos.color === "green"
              ? "#10B981"
              : "#EF4444",
          backgroundColor:
            data.comparacion_ayer.gastos.color === "green"
              ? "rgba(240,253,244,1)"
              : "rgba(254,242,242,1)",
        },
        {
          label: "Utilidad",
          percentage: `${data.comparacion_ayer.utilidad.signo}${data.comparacion_ayer.utilidad.porcentaje}%`,
          color:
            data.comparacion_ayer.utilidad.color === "green"
              ? "#10B981"
              : "#EF4444",
          backgroundColor:
            data.comparacion_ayer.utilidad.color === "green"
              ? "rgba(240,253,244,1)"
              : "rgba(254,242,242,1)",
        },
      ],
      insights: [
        {
          label: "Transacciones realizadas",
          value: data.desglose_dia.transacciones_realizadas.toString(),
        },
        {
          label: "Productos vendidos",
          value: data.desglose_dia.productos_vendidos,
        },
        {
          label: "Ticket promedio",
          value: data.desglose_dia.ticket_promedio.formatted,
        },
        {
          label: "Margen del día",
          value: `${data.desglose_dia.margen_dia.porcentaje}%`,
        },
      ],
    };
  };

  return (
    <View>
      <DateSelector
        periodType={periodType}
        currentDate={currentDate}
        onDateChange={handleDateChange}
      />

      <AnalysisCards
        type="daily"
        currentDate={currentDate}
        showData={dataLoaded}
        onDataLoaded={() => {}}
        insights={dayInsights}
      />

      <DailyPerformance
        data={
          dailyPerformanceData
            ? transformPerformanceData(dailyPerformanceData)
            : null
        }
        loading={!dataLoaded}
      />

      <BestSellers data={dailySellersData} loading={!dataLoaded} />

{/*       <ExecutiveReports fecha={currentDate} periodType="day" /> */}
    </View>
  );
}

export default TodayAnalytics;
