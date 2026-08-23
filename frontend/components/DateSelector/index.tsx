import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";

export type PeriodType = "day" | "week" | "month";

interface DateSelectorProps {
  periodType: PeriodType;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onPeriodTypeChange?: (periodType: PeriodType) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  periodType,
  currentDate,
  onDateChange,
  onPeriodTypeChange,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Función para formatear la fecha según el tipo de período
  const formatDateDisplay = (date: Date, type: PeriodType): string => {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
    };

    switch (type) {
      case "day":
        return date.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
        });
      case "week":
        const weekStart = getWeekStart(date);
        const weekEnd = getWeekEnd(date);
        return `${weekStart.getDate()} ${weekStart.toLocaleDateString("es-ES", { month: "short" })} - ${weekEnd.getDate()} ${weekEnd.toLocaleDateString("es-ES", { month: "short" })}`;
      case "month":
        return date.toLocaleDateString("es-ES", {
          month: "long",
          year: "numeric",
        });
      default:
        return "";
    }
  };

  // Obtener el inicio de la semana (lunes)
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  // Obtener el final de la semana (domingo)
  const getWeekEnd = (date: Date): Date => {
    const weekStart = getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return weekEnd;
  };

  // Navegar hacia atrás
  const navigateBack = () => {
    const newDate = new Date(currentDate);
    switch (periodType) {
      case "day":
        newDate.setDate(newDate.getDate() - 1);
        break;
      case "week":
        newDate.setDate(newDate.getDate() - 7);
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() - 1);
        break;
    }
    onDateChange(newDate);
  };

  // Navegar hacia adelante
  const navigateForward = () => {
    const newDate = new Date(currentDate);
    switch (periodType) {
      case "day":
        newDate.setDate(newDate.getDate() + 1);
        break;
      case "week":
        newDate.setDate(newDate.getDate() + 7);
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() + 1);
        break;
    }
    onDateChange(newDate);
  };

  // Obtener opciones rápidas para el modal
  const getQuickOptions = () => {
    const today = new Date();
    const options = [];

    switch (periodType) {
      case "day":
        options.push({
          label: "Hoy",
          date: new Date(today),
          color: "#E3F2FD",
          textColor: "#1976D2",
        });
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        options.push({
          label: "Ayer",
          date: yesterday,
          color: "#E8F5E8",
          textColor: "#388E3C",
        });
        break;
      case "week":
        options.push({
          label: "Esta semana",
          date: new Date(today),
          color: "#E3F2FD",
          textColor: "#1976D2",
        });
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        options.push({
          label: "Semana pasada",
          date: lastWeek,
          color: "#E8F5E8",
          textColor: "#388E3C",
        });
        break;
      case "month":
        options.push({
          label: "Este mes",
          date: new Date(today),
          color: "#E3F2FD",
          textColor: "#1976D2",
        });
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        options.push({
          label: "Mes pasado",
          date: lastMonth,
          color: "#E8F5E8",
          textColor: "#388E3C",
        });
        break;
    }

    // Agregar opción de "Hace 2 meses/semanas/días"
    const twoPeriodsAgo = new Date(today);
    switch (periodType) {
      case "day":
        twoPeriodsAgo.setDate(twoPeriodsAgo.getDate() - 2);
        options.push({
          label: "Hace 2 días",
          date: twoPeriodsAgo,
          color: "#F3E5F5",
          textColor: "#7B1FA2",
        });
        break;
      case "week":
        twoPeriodsAgo.setDate(twoPeriodsAgo.getDate() - 14);
        options.push({
          label: "Hace 2 semanas",
          date: twoPeriodsAgo,
          color: "#F3E5F5",
          textColor: "#7B1FA2",
        });
        break;
      case "month":
        twoPeriodsAgo.setMonth(twoPeriodsAgo.getMonth() - 2);
        options.push({
          label: "Hace 2 meses",
          date: twoPeriodsAgo,
          color: "#F3E5F5",
          textColor: "#7B1FA2",
        });
        break;
    }

    return options;
  };

  const selectQuickOption = (date: Date) => {
    onDateChange(date);
    setModalVisible(false);
  };

  const renderCalendar = () => {
    // Aquí puedes integrar tu componente de calendario existente
    // Por ahora, mostraremos una versión simplificada
    const today = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    const daysOfWeek = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    
    // Renderizar días de la semana
    const weekDays = daysOfWeek.map((day, index) => (
      <View key={index} style={styles.dayHeader}>
        <Text style={styles.dayHeaderText}>{day}</Text>
      </View>
    ));
    
    // Celdas vacías para los días antes del primer día del mes
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = date.toDateString() === currentDate.toDateString();
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            isSelected && styles.selectedDay,
            isToday && !isSelected && styles.todayDay,
          ]}
          onPress={() => selectQuickOption(date)}
        >
          <Text
            style={[
              styles.dayText,
              isSelected && styles.selectedDayText,
              isToday && !isSelected && styles.todayDayText,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return (
      <View style={styles.calendar}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            onPress={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(newDate.getMonth() - 1);
              onDateChange(newDate);
            }}
          >
            <MaterialIcons name="chevron-left" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.calendarTitle}>
            {currentDate.toLocaleDateString("es-ES", {
              month: "long",
              year: "numeric",
            })}
          </Text>
          <TouchableOpacity
            onPress={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(newDate.getMonth() + 1);
              onDateChange(newDate);
            }}
          >
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <View style={styles.weekDaysRow}>{weekDays}</View>
        <View style={styles.daysGrid}>{days}</View>
      </View>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={navigateBack} style={styles.navButton}>
          <MaterialIcons
            name="arrow-back-ios-new"
            size={15}
            color="rgba(55, 65, 82, 0.53)"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateDisplay}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons
            name="calendar-today"
            size={18}
            color="rgba(55, 65, 82, 0.53)"
          />
          <Text style={styles.dateText}>
            {formatDateDisplay(currentDate, periodType)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={navigateForward} style={styles.navButton}>
          <MaterialIcons
            name="arrow-forward-ios"
            size={15}
            color="rgba(55, 65, 82, 0.53)"
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Seleccionar {periodType === "day" ? "Día" : periodType === "week" ? "Semana" : "Mes"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.quickAccess}>
              <Text style={styles.sectionTitle}>Acceso rápido</Text>
              {getQuickOptions().map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.quickOption, { backgroundColor: option.color }]}
                  onPress={() => selectQuickOption(option.date)}
                >
                  <MaterialIcons
                    name="schedule"
                    size={16}
                    color={option.textColor}
                  />
                  <Text style={[styles.quickOptionText, { color: option.textColor }]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.customSelection}>
              <Text style={styles.sectionTitle}>Selección personalizada</Text>
              {renderCalendar()}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 50,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  navButton: {
    padding: 8,
  },
  dateDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dateText: {
    color: "rgba(55, 65, 82, 0.7)",
    fontSize: 16,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  quickAccess: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 12,
  },
  quickOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  quickOptionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  customSelection: {
    marginBottom: 24,
  },
  calendar: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  weekDaysRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  dayHeader: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  dayCell: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    margin: 1,
    borderRadius: 20,
  },
  selectedDay: {
    backgroundColor: "#00C853",
  },
  todayDay: {
    backgroundColor: "#E3F2FD",
  },
  dayText: {
    fontSize: 14,
    color: "#333",
  },
  selectedDayText: {
    color: "white",
    fontWeight: "600",
  },
  todayDayText: {
    color: "#1976D2",
    fontWeight: "500",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#00C853",
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DateSelector;