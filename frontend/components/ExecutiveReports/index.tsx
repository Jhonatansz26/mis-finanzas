import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import ModalDailyReport from "../ModalDailyReport";
import ModalWeeklyReport from "../ModalWeeklyReport";
import ModalMonthlyReport from "../ModalMonthlyReport";

type PeriodType = "day" | "week" | "month";

interface ExecutiveReportsProps {
  fecha: any;
  periodType: PeriodType;
}

const ExecutiveReports = ({ fecha, periodType }: ExecutiveReportsProps) => {
  // Estados para controlar cada modal
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);

  // Configuración de reportes según el tipo de período
  const getReportsConfig = () => {
    const allReports = [
      {
        id: 'daily',
        title: 'Reporte diario',
        subtitle: 'Estimaciones de hoy',
        icon: 'trending-up' as const,
        backgroundColor: '#E9D5FF', // Light purple
        iconColor: '#8B5CF6', // Purple
        onPress: () => setShowDailyModal(true),
        periodType: 'day' as PeriodType
      },
      {
        id: 'weekly',
        title: 'Reporte Semanal',
        subtitle: 'Análisis detallado de 7 días',
        icon: 'bar-chart' as const,
        backgroundColor: '#D1FAE5', // Light green
        iconColor: '#10B981', // Green
        onPress: () => setShowWeeklyModal(true),
        periodType: 'week' as PeriodType
      },
      {
        id: 'monthly',
        title: 'Comparativa Mensual',
        subtitle: 'Evolución mes a mes',
        icon: 'calendar-today' as const,
        backgroundColor: '#DBEAFE', // Light blue
        iconColor: '#3B82F6', // Blue
        onPress: () => setShowMonthlyModal(true),
        periodType: 'month' as PeriodType
      }
    ];

    // Filtrar según el periodType
    switch (periodType) {
      case 'day':
        return allReports.filter(report => report.periodType === 'day');
      case 'week':
        return allReports.filter(report => report.periodType === 'week');
      case 'month':
        return allReports.filter(report => report.periodType === 'month');
      default:
        return allReports; // Mostrar todos si no se especifica
    }
  };

  const reportsData = getReportsConfig();

  const renderReportItem = (report: any, index: any) => {
    return (
      <TouchableOpacity
        key={index}
        style={styles.reportItem}
        onPress={report.onPress}
      >
        <View style={styles.reportContent}>
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: report.backgroundColor },
            ]}
          >
            <MaterialIcons
              name={report.icon}
              size={24}
              color={report.iconColor}
            />
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.reportTitle}>{report.title}</Text>
            <Text style={styles.reportSubtitle}>{report.subtitle}</Text>
          </View>

          {/* Arrow */}
          <View style={styles.arrowContainer}>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color="#9CA3AF"
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Función para obtener el título del header según el período
  const getHeaderTitle = () => {
    switch (periodType) {
      case 'day':
        return 'Reporte Diario';
      case 'week':
        return 'Reporte Semanal';
      case 'month':
        return 'Reporte Mensual';
      default:
        return 'Reportes Ejecutivos';
    }
  };

  return (
    <View style={styles.executiveReports}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{getHeaderTitle()}</Text>
      </View>

      {/* Reports List */}
      <View style={styles.reportsList}>
        {reportsData.map((report, index) => renderReportItem(report, index))}
      </View>

      {/* Modals - Solo renderizar los que correspondan */}
      {(periodType === 'day' || !periodType) && (
        <ModalDailyReport
          showModal={showDailyModal}
          setShowModal={setShowDailyModal}
          fecha={fecha}
        />
      )}
      
      {(periodType === 'week' || !periodType) && (
        <ModalWeeklyReport
          showModal={showWeeklyModal}
          setShowModal={setShowWeeklyModal}
          fecha={fecha}
        />
      )}
      
      {(periodType === 'month' || !periodType) && (
        <ModalMonthlyReport
          showModal={showMonthlyModal}
          setShowModal={setShowMonthlyModal}
          fecha={fecha}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  executiveReports: {
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 5,
    padding: 16,
    backgroundColor: "white",
    marginBottom: 20,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  reportsList: {
    gap: 12,
  },
  reportItem: {
    borderRadius: 12,
    overflow: "hidden",
  },
  reportContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  reportSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "400",
  },
  arrowContainer: {
    marginLeft: 8,
  },
});

export default ExecutiveReports;