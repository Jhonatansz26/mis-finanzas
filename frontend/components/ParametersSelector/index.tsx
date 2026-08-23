import { AntDesign, Entypo } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import TooglePeriod from "../TogglePeriod";
import { Dropdown } from "react-native-element-dropdown";
import { useEffect, useState } from "react";

// A prop to allow parent components to get the selected option
interface TooglePeriodProps {
  onGenerateAnalysis?: (selected: string) => void;
}

function ParametersSelector({ onGenerateAnalysis }: TooglePeriodProps) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Estados para los dropdowns
  const [sucursal, setSucursal] = useState(null);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("Semana");
  const [periodoValue, setPeriodoValue] = useState(null);
  const [isFocusSucursal, setIsFocusSucursal] = useState(false);
  const [isFocusPeriodo, setIsFocusPeriodo] = useState(false);

  // Generar datos para el dropdown de periodos
  // Función para crear datos del selector de periodos según el tipo (semana/mes)
  const generarDatosPeriodo = (tipo: any) => {
    if (tipo === "Mes") {
      // Generar opciones para meses (últimos 24 meses)
      const mesData = [];
      for (let i = 0; i < 24; i++) {
        // Calcular el mes y año
        let targetMonth = currentMonth - i;
        let targetYear = currentYear;

        while (targetMonth < 0) {
          targetMonth += 12;
          targetYear -= 1;
        }

        // Nombres de los meses
        const nombresMeses = [
          "Enero",
          "Febrero",
          "Marzo",
          "Abril",
          "Mayo",
          "Junio",
          "Julio",
          "Agosto",
          "Septiembre",
          "Octubre",
          "Noviembre",
          "Diciembre",
        ];

        mesData.push({
          label: `${nombresMeses[targetMonth]} - ${targetYear}`,
          value: `${targetYear}-${targetMonth + 1}`,
        });
      }
      return mesData;
    } else {
      // Generar opciones para semanas (últimas 53 semanas)
      const semanaData = [];
      const hoy = new Date();

      for (let i = 0; i < 53; i++) {
        // Calcular la fecha de la semana restando i semanas de la fecha actual
        const fechaSemana: any = new Date(hoy);
        fechaSemana.setDate(hoy.getDate() - i * 7);

        // Obtener el número de semana
        const primerDiaDelAno: any = new Date(fechaSemana.getFullYear(), 0, 1);
        const pastDays = Math.floor((fechaSemana - primerDiaDelAno) / 86400000);
        const weekNumber = Math.ceil(
          (pastDays + primerDiaDelAno.getDay() + 1) / 7
        );

        // Formatear la fecha para mostrar el día y mes
        const dia = fechaSemana.getDate();
        const mes = fechaSemana.getMonth();
        const nombresMesesCortos = [
          "ene",
          "feb",
          "mar",
          "abr",
          "may",
          "jun",
          "jul",
          "ago",
          "sep",
          "oct",
          "nov",
          "dic",
        ];

        semanaData.push({
          label: `Semana ${weekNumber} - ${dia} ${nombresMesesCortos[mes]}`,
          value: `${fechaSemana.getFullYear()}-W${weekNumber}`,
        });
      }
      return semanaData;
    }
  };

  // Datos para los dropdowns
  const sucursalData = [
    { label: "Todas las sucursales", value: "todas" },
    { label: "Sucursal 1", value: "sucursal1" },
    { label: "Sucursal 2", value: "sucursal2" },
  ];

  // Estado para los datos del período que se actualizarán según el toggle
  const [periodData, setPeriodData] = useState(() =>
    generarDatosPeriodo("Semana")
  );

  // Actualizar el dropdown cuando cambia el tipo de periodo
  useEffect(() => {
    setPeriodoValue(null); // Resetear valor seleccionado
    setPeriodData(generarDatosPeriodo(periodoSeleccionado));
  }, [periodoSeleccionado]);

  // Manejar el cambio en el TooglePeriod
  const handlePeriodChange = (selected: any) => {
    setPeriodoSeleccionado(selected);
  };

  // Manejar el clic en el botón de generar análisis
  const handleGenerateClick = () => {
    // Recopilar todos los parámetros seleccionados
    const parametros: any = {
      sucursal: sucursal,
      periodoTipo: periodoSeleccionado,
      periodoValor: periodoValue,
    };

    // Llamar a la función prop si existe
    if (onGenerateAnalysis) {
      onGenerateAnalysis(parametros);
    }
  };

  return (
    <View style={styles.parametersContainer}>
      <Text style={styles.parametersTitle}>Seleccionar parámetros</Text>

      <View style={styles.formContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Punto de venta</Text>
          <Dropdown
            style={[
              styles.dropdown,
              isFocusSucursal && { borderColor: "#16a34a" },
            ]}
            data={sucursalData}
            labelField="label"
            valueField="value"
            placeholder="Todas las sucursales"
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelectedText}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            maxHeight={300}
            value={sucursal}
            onFocus={() => setIsFocusSucursal(true)}
            onBlur={() => setIsFocusSucursal(false)}
            onChange={(item: any) => {
              setSucursal(item.value);
              setIsFocusSucursal(false);
            }}
            renderLeftIcon={() => (
              <Entypo
                name="shop"
                size={20}
                color="black"
                style={styles.dropdownIcon}
              />
            )}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Periodo</Text>
          <View>
            <TooglePeriod onSelectChange={handlePeriodChange} />

            {/* Un único dropdown para el periodo (meses o semanas) */}
            <Dropdown
              style={[
                styles.dropdown,
                isFocusPeriodo && { borderColor: "#16a34a" },
              ]}
              data={periodData}
              labelField="label"
              valueField="value"
              placeholder={
                periodoSeleccionado === "Semana"
                  ? "Seleccionar semana"
                  : "Seleccionar mes"
              }
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              maxHeight={300}
              value={periodoValue}
              search
              searchPlaceholder="Buscar..."
              onFocus={() => setIsFocusPeriodo(true)}
              onBlur={() => setIsFocusPeriodo(false)}
              onChange={(item) => {
                setPeriodoValue(item.value);
                setIsFocusPeriodo(false);
              }}
              renderLeftIcon={() => (
                <AntDesign
                  style={styles.dropdownIcon}
                  name="calendar"
                  size={18}
                  color={isFocusPeriodo ? "#16a34a" : "#888"}
                />
              )}
            />
          </View>
        </View>

        <Pressable style={styles.generateButton} onPress={handleGenerateClick}>
          <Text style={styles.generateButtonText}>Generar análisis</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  parametersContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  parametersTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#222",
  },
  formContainer: {
    gap: 12,
  },
  formGroup: {
    marginBottom: 6,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
    color: "#444",
  },
  dropdown: {
    height: 45,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingLeft: 10,
    backgroundColor: "#fff",
    marginTop: 8,
  },
  dropdownPlaceholder: {
    color: "#444",
    fontSize: 14,
  },
  dropdownSelectedText: {
    color: "#444",
    fontSize: 14,
  },
  dropdownIcon: {
    marginRight: 8,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 14,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  generateButton: {
    backgroundColor: "#16a34a",
    height: 45,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  generateButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  toggleContainer: {
    height: 38,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    flexDirection: "row",
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
    marginVertical: 8,
  },
  toggleButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  activeButton: {
    backgroundColor: "#fff",
  },
  pressedButton: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#888",
  },
  activeText: {
    color: "#000",
    fontWeight: "600",
  },
});

export default ParametersSelector;
