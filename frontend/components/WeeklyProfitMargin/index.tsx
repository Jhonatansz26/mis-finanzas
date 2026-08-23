import React from "react";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get('window').width;

function WeeklyProfitMargin() {
  const areaLineData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    datasets: [
      {
        data: [20000, 35000, 25000, 45000, 60000, 50000],
        color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`, // Color verde
        strokeWidth: 2,
      },
    ],
  };


  const areaLineChartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`, // Color verde para la línea
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
      borderColor: "#ddd",
      borderWidth: 1,
    },
    propsForDots: {
      r: '0', // Sin puntos para mostrar solo la línea
    },
    fillShadowGradient: 'rgba(0, 128, 0, 0.2)', // Sombreado del área bajo la curva
    fillShadowGradientOpacity: 0.2,
    formatYLabel: (value:any) => {
        // Convertir el valor a número y formatearlo con puntos de millar
        return Number(value).toLocaleString('es-ES');
      }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Margen de utilidad semanal</Text>
      <LineChart
        data={areaLineData}
        width={350}
        height={200}
        chartConfig={areaLineChartConfig}
        bezier
        style={styles.chart}
        withShadow={true}
        withInnerLines={false}
        withVerticalLines={false}
        withHorizontalLines={true}
        withDots={false}
        withVerticalLabels={true}
        withHorizontalLabels={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 270,
    borderRadius: 10,
    padding: 12,
    backgroundColor: 'white',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontWeight: 600,
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  }
});

export default WeeklyProfitMargin;
