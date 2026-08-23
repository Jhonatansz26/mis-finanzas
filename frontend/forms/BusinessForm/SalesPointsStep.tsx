import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dropdown } from "react-native-element-dropdown";
import api from "../../api/apiConfig";

interface DropdownItem {
  label: string;
  value: string;
}

interface DepartmentResponse {
  departamento: string;
  id_departamento: number;
}

interface MunicipalityResponse {
  municipio: string;
  id_municipio: number;
}

const salesPointSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  ubicacion: z.string().min(1, "La ubicación es obligatoria"),
  responsable: z.string().optional(),
  telefono: z.string().optional(),
  departamento: z.string().min(1, "El departamento es obligatorio"),
  municipio: z.string().min(1, "El municipio es obligatorio"),
  nota: z.string().optional(),
});

type SalesPointData = z.infer<typeof salesPointSchema>;

export interface SalesPoint extends SalesPointData {
  id: string;
}

interface SalesPointsStepProps {
  initialPoints: SalesPoint[];
  onNext: (points: SalesPoint[]) => void;
  onBack: () => void;
}

export function SalesPointsStep({
  initialPoints,
  onNext,
  onBack,
}: SalesPointsStepProps) {
  const [salesPoints, setSalesPoints] = useState<SalesPoint[]>(
    initialPoints.length > 0
      ? initialPoints
      : [
          {
            id: Math.random().toString(36).substr(2, 9),
            nombre: "",
            ubicacion: "",
            responsable: "",
            telefono: "",
            departamento: "",
            municipio: "",
            nota: "",
          },
        ]
  );

  const [currentEditIndex, setCurrentEditIndex] = useState(0);
  const [departamentos, setDepartamentos] = useState<DropdownItem[]>([]);
  const [municipios, setMunicipios] = useState<DropdownItem[]>([]);
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(false);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);
  const [isFocusDepartamento, setIsFocusDepartamento] = useState(false);
  const [isFocusMunicipio, setIsFocusMunicipio] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<SalesPointData>({
    resolver: zodResolver(salesPointSchema),
    defaultValues: salesPoints[currentEditIndex],
  });

  const departamentoValue = watch("departamento");
  const watchedFields = watch();

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (departamentoValue) {
      fetchMunicipalities(departamentoValue);
    } else {
      setMunicipios([]);
      setValue("municipio", "");
    }
  }, [departamentoValue]);

  // Sincronizar formulario con salesPoints cuando cambian los valores
  useEffect(() => {
    if (watchedFields && currentEditIndex >= 0) {
      setSalesPoints((prev) => {
        const updated = [...prev];
        if (updated[currentEditIndex]) {
          updated[currentEditIndex] = {
            ...updated[currentEditIndex],
            ...watchedFields,
          };
        }
        return updated;
      });
    }
  }, [watchedFields, currentEditIndex]);

  const fetchDepartments = async () => {
    try {
      setLoadingDepartamentos(true);
      const response = await api.get<DepartmentResponse[]>("tools/departments");

      if (response.data && Array.isArray(response.data)) {
        const formattedDepartments: DropdownItem[] = response.data.map(
          (dept) => ({
            label: dept.departamento,
            value: dept.id_departamento.toString(),
          })
        );

        formattedDepartments.unshift({
          label: "Seleccionar departamento",
          value: "",
        });

        setDepartamentos(formattedDepartments);
      } else {
        console.error(
          "Formato de respuesta inesperado para departamentos:",
          response.data
        );
        setDepartamentos([{ label: "Seleccionar departamento", value: "" }]);
      }
    } catch (error) {
      console.error("Error al obtener los departamentos:", error);
      setDepartamentos([{ label: "Seleccionar departamento", value: "" }]);
    } finally {
      setLoadingDepartamentos(false);
    }
  };

  const fetchMunicipalities = async (departmentId: string) => {
    if (!departmentId) return;

    try {
      setLoadingMunicipios(true);
      const response = await api.get<MunicipalityResponse[]>(
        `tools/municipalities/${departmentId}`
      );

      if (response.data && Array.isArray(response.data)) {
        const formattedMunicipalities: DropdownItem[] = response.data.map(
          (muni) => ({
            label: muni.municipio,
            value: muni.id_municipio.toString(),
          })
        );

        formattedMunicipalities.unshift({
          label: "Seleccionar municipio",
          value: "",
        });

        setMunicipios(formattedMunicipalities);
      } else {
        console.error(
          "Formato de respuesta inesperado para municipios:",
          response.data
        );
        setMunicipios([{ label: "Seleccionar municipio", value: "" }]);
      }
    } catch (error) {
      console.error("Error al obtener los municipios:", error);
      setMunicipios([{ label: "Seleccionar municipio", value: "" }]);
    } finally {
      setLoadingMunicipios(false);
    }
  };

  const handleSelectPoint = (index: number) => {
    // Guardar los datos actuales antes de cambiar
    handleSubmit((data) => {
      const updated = [...salesPoints];
      updated[currentEditIndex] = { ...updated[currentEditIndex], ...data };
      setSalesPoints(updated);
      
      // Cambiar al punto seleccionado
      setCurrentEditIndex(index);
      reset(updated[index]);
    })();
  };

  const handleAddPoint = () => {
    handleSubmit((data) => {
      const updated = [...salesPoints];
      updated[currentEditIndex] = { ...updated[currentEditIndex], ...data };
      
      const newPoint: SalesPoint = {
        id: Math.random().toString(36).substr(2, 9),
        nombre: "",
        ubicacion: "",
        responsable: "",
        telefono: "",
        departamento: "",
        municipio: "",
        nota: "",
      };
      
      setSalesPoints([...updated, newPoint]);
      setCurrentEditIndex(updated.length);
      reset(newPoint);
    })();
  };

  const handleRemovePoint = (id: string) => {
    if (salesPoints.length > 1) {
      Alert.alert(
        "Eliminar punto de venta",
        "¿Estás seguro de eliminar este punto de venta?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => {
              const filtered = salesPoints.filter((point) => point.id !== id);
              setSalesPoints(filtered);
              const newIndex = currentEditIndex >= filtered.length ? filtered.length - 1 : currentEditIndex;
              setCurrentEditIndex(newIndex);
              reset(filtered[newIndex]);
            },
          },
        ]
      );
    }
  };

  const handleContinue = () => {
    handleSubmit((data) => {
      const updatedPoints = [...salesPoints];
      updatedPoints[currentEditIndex] = { 
        ...updatedPoints[currentEditIndex], 
        ...data 
      };
      
      const allValid = updatedPoints.every(point => 
        point.nombre && point.ubicacion && point.departamento && point.municipio
      );
      
      if (allValid) {
        onNext(updatedPoints);
      } else {
        Alert.alert("Error", "Por favor completa todos los puntos de venta antes de continuar");
      }
    })();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Feather name="map-pin" size={24} color="#16a34a" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Puntos de Venta</Text>
          <Text style={styles.subtitle}>Agrega las ubicaciones donde operas</Text>
        </View>
      </View>

      {/* Lista de puntos de venta */}
      {salesPoints.length > 1 && (
        <View style={styles.pointsList}>
          <Text style={styles.pointsListTitle}>Puntos de venta agregados:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pointsScrollView}>
            {salesPoints.map((point, index) => (
              <TouchableOpacity
                key={point.id}
                style={[
                  styles.pointTab,
                  currentEditIndex === index && styles.pointTabActive
                ]}
                onPress={() => handleSelectPoint(index)}
              >
                <Text style={[
                  styles.pointTabText,
                  currentEditIndex === index && styles.pointTabTextActive
                ]}>
                  {point.nombre || `Punto ${index + 1}`}
                </Text>
                {point.nombre && point.ubicacion && point.departamento && point.municipio && (
                  <View style={styles.completeBadge}>
                    <Feather name="check" size={12} color="#16a34a" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Feather name="shopping-bag" size={16} color="#16a34a" />
            <Text style={styles.cardTitle}>Punto de Venta {currentEditIndex + 1}</Text>
          </View>
          {salesPoints.length > 1 && (
            <TouchableOpacity
              onPress={() => handleRemovePoint(salesPoints[currentEditIndex].id)}
              style={styles.deleteButton}
            >
              <Feather name="trash-2" size={18} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.cardContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre *</Text>
            <Controller
              control={control}
              name="nombre"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.nombre && styles.inputError]}
                  placeholder="Ej: Sucursal Centro"
                  value={value}
                  onChangeText={onChange}
                  placeholderTextColor="#9ca3af"
                />
              )}
            />
            {errors.nombre && <Text style={styles.errorText}>{errors.nombre.message}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ubicación *</Text>
            <Controller
              control={control}
              name="ubicacion"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.ubicacion && styles.inputError]}
                  placeholder="Dirección completa"
                  value={value}
                  onChangeText={onChange}
                  placeholderTextColor="#9ca3af"
                />
              )}
            />
            {errors.ubicacion && <Text style={styles.errorText}>{errors.ubicacion.message}</Text>}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Responsable</Text>
              <Controller
                control={control}
                name="responsable"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Nombre del encargado"
                    value={value}
                    onChangeText={onChange}
                    placeholderTextColor="#9ca3af"
                  />
                )}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Teléfono</Text>
              <Controller
                control={control}
                name="telefono"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="+57 300 123 4567"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="phone-pad"
                    placeholderTextColor="#9ca3af"
                  />
                )}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Departamento *</Text>
              {loadingDepartamentos ? (
                <View style={[styles.dropdown, styles.loadingContainer]}>
                  <ActivityIndicator size="small" color="#16a34a" />
                </View>
              ) : (
                <Controller
                  control={control}
                  name="departamento"
                  render={({ field: { onChange, value } }) => (
                    <Dropdown
                      style={[
                        styles.dropdown,
                        isFocusDepartamento && { borderColor: "#16a34a" },
                        errors.departamento && styles.inputError,
                      ]}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      inputSearchStyle={styles.inputSearchStyle}
                      data={departamentos}
                      search
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      placeholder="Seleccionar departamento"
                      searchPlaceholder="Buscar..."
                      value={value}
                      onFocus={() => setIsFocusDepartamento(true)}
                      onBlur={() => setIsFocusDepartamento(false)}
                      onChange={(item) => {
                        onChange(item.value);
                        setValue("municipio", "");
                        setIsFocusDepartamento(false);
                      }}
                      renderLeftIcon={() => (
                        <View style={styles.iconContainerDropdown}>
                          <Feather name="map" size={16} color="#9ca3af" />
                        </View>
                      )}
                    />
                  )}
                />
              )}
              {errors.departamento && <Text style={styles.errorText}>{errors.departamento.message}</Text>}
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Municipio *</Text>
              {loadingMunicipios ? (
                <View style={[styles.dropdown, styles.loadingContainer]}>
                  <ActivityIndicator size="small" color="#16a34a" />
                </View>
              ) : (
                <Controller
                  control={control}
                  name="municipio"
                  render={({ field: { onChange, value } }) => (
                    <Dropdown
                      style={[
                        styles.dropdown,
                        isFocusMunicipio && { borderColor: "#16a34a" },
                        !departamentoValue && styles.disabledDropdown,
                        errors.municipio && styles.inputError,
                      ]}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      inputSearchStyle={styles.inputSearchStyle}
                      data={municipios}
                      search
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      placeholder={
                        departamentoValue
                          ? "Seleccionar municipio"
                          : "Primero seleccione un departamento"
                      }
                      searchPlaceholder="Buscar..."
                      value={value}
                      disable={!departamentoValue}
                      onFocus={() => setIsFocusMunicipio(true)}
                      onBlur={() => setIsFocusMunicipio(false)}
                      onChange={(item) => {
                        onChange(item.value);
                        setIsFocusMunicipio(false);
                      }}
                      renderLeftIcon={() => (
                        <View style={styles.iconContainerDropdown}>
                          <Feather name="map-pin" size={16} color="#9ca3af" />
                        </View>
                      )}
                    />
                  )}
                />
              )}
              {errors.municipio && <Text style={styles.errorText}>{errors.municipio.message}</Text>}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nota (opcional)</Text>
            <Controller
              control={control}
              name="nota"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Información adicional sobre este punto de venta"
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  placeholderTextColor="#9ca3af"
                />
              )}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddPoint}
        activeOpacity={0.8}
      >
        <Feather name="plus" size={20} color="#16a34a" />
        <Text style={styles.addButtonText}>Agregar otro punto de venta</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <Feather name="arrow-left" size={20} color="#374151" />
          <Text style={styles.backButtonText}>Atrás</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continuar</Text>
          <Feather name="arrow-right" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  pointsList: {
    marginBottom: 16,
  },
  pointsListTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  pointsScrollView: {
    flexDirection: "row",
  },
  pointTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pointTabActive: {
    backgroundColor: "#dcfce7",
    borderColor: "#16a34a",
  },
  pointTabText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  pointTabTextActive: {
    color: "#16a34a",
    fontWeight: "600",
  },
  completeBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  deleteButton: {
    padding: 4,
  },
  cardContent: {
    gap: 12,
  },
  inputGroup: {
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#000",
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    height: 48,
    borderRadius: 8,
    marginBottom: 24,
    gap: 8,
  },
  addButtonText: {
    color: "#16a34a",
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  backButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    height: 56,
    borderRadius: 8,
    gap: 8,
  },
  backButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  continueButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16a34a",
    height: 56,
    borderRadius: 8,
    gap: 8,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  dropdown: {
    height: 48,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  disabledDropdown: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
  },
  iconContainerDropdown: {
    marginRight: 8,
  },
  placeholderStyle: {
    fontSize: 14,
    color: "#9ca3af",
  },
  selectedTextStyle: {
    fontSize: 14,
    color: "#000",
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 14,
    borderColor: "#e5e7eb",
  },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});