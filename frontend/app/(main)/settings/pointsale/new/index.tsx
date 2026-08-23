import React, { useEffect, useState } from "react";
import LayoutMain from "../../../../../components/LayoutHome";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  TextInput,
  Switch,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Entypo, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import useBusinessStore from "../../../../../hooks/useBusinessStore";
import api from "../../../../../api/apiConfig";

// Definición de interfaces para los datos
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

interface ApiResponse<T> {
  data: T[];
}

function NewPointSale() {
  const router = useRouter();
  const { activeBusiness } = useBusinessStore();

  // Estado unificado para el formulario
  const [formData, setFormData] = useState({
    nombre: "",
    ubicacion: "",
    telefono: "",
    nota: "",
    activo: true,
    responsable: "",
    departamento: "",
    municipio: "",
  });

  // Función para actualizar un solo campo del estado
  const updateField = (field: string, value: any) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  // Estados para las listas de departamentos y municipios
  const [departamentos, setDepartamentos] = useState<DropdownItem[]>([]);
  const [municipios, setMunicipios] = useState<DropdownItem[]>([]);

  // Estados para controlar la carga de datos
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(false);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);
  const [saving, setSaving] = useState(false); // Estado para controlar el proceso de guardado

  // Estados para controlar el foco de los dropdowns
  const [isFocusDepartamento, setIsFocusDepartamento] = useState(false);
  const [isFocusMunicipio, setIsFocusMunicipio] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (formData.departamento) {
      fetchMunicipalities(formData.departamento);
    } else {
      setMunicipios([]);
      updateField("municipio", "");
    }
  }, [formData.departamento]);

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

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      alert("El nombre de la sucursal es obligatorio");
      return false;
    }

    if (!formData.departamento) {
      alert("Debe seleccionar un departamento");
      return false;
    }

    if (!formData.municipio) {
      alert("Debe seleccionar un municipio");
      return false;
    }

    if (!formData.ubicacion.trim()) {
      alert("La dirección es obligatoria");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      setSaving(true);

      const pointSaleData = {
        negocio_id: activeBusiness?.id,
        nombre: formData.nombre,
        ubicacion: formData.ubicacion,
        departamento: parseInt(formData.departamento),
        municipio: parseInt(formData.municipio),
        responsable: formData.responsable || null,
        telefono: formData.telefono || null,
        activo: formData.activo,
        nota: formData.nota || null,
      };

      console.log("Guardando punto de venta:", pointSaleData);

      const response = await api.post("point-sale", pointSaleData);

      if (response.status === 201 || response.status === 200) {
        alert("Punto de venta creado con éxito");
        router.replace("/settings/pointsale");
      } else {
        throw new Error("Error al crear el punto de venta");
      }
    } catch (error) {
      console.error("Error al guardar el punto de venta:", error);
      alert(
        "Ocurrió un error al guardar el punto de venta. Intente nuevamente."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <LayoutMain>
      <View style={styles.headerHome}>
        <View style={styles.leftNavbar}>
          <Pressable
            style={styles.iconBackButton}
            onPress={() => router.replace("/settings/pointsale")}
          >
            <Feather name="arrow-left" size={19} color="black" />
          </Pressable>
          <Text style={styles.titleHeader}>Nuevo punto de venta</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Sección de información básica */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionTitleContainer}>
              <Entypo name="shop" size={20} color="#16a34a" />
              <Text style={styles.sectionTitle}>Información básica</Text>
            </View>

            {/* Nombre de la sucursal */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Nombre de la sucursal</Text>
              <TextInput
                style={styles.textInput}
                value={formData.nombre}
                onChangeText={(text) => updateField("nombre", text)}
                placeholder="Sucursal Centro"
              />
            </View>

            {/* Dirección */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Dirección</Text>
              <View style={styles.textInput}>
                <View style={styles.inputWithIcon}>
                  <Feather
                    name="map-pin"
                    size={16}
                    color="#9ca3af"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInputInner}
                    value={formData.ubicacion}
                    onChangeText={(text) => updateField("ubicacion", text)}
                    placeholder="Av. Principal 123"
                  />
                </View>
              </View>
            </View>

            {/* Departamento - Con datos de la API */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Departamento</Text>
              {loadingDepartamentos ? (
                <View style={[styles.dropdown, styles.loadingContainer]}>
                  <ActivityIndicator size="small" color="#16a34a" />
                  <Text style={styles.loadingText}>
                    Cargando departamentos...
                  </Text>
                </View>
              ) : (
                <Dropdown
                  style={[
                    styles.dropdown,
                    isFocusDepartamento && { borderColor: "#16a34a" },
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
                  value={formData.departamento}
                  onFocus={() => setIsFocusDepartamento(true)}
                  onBlur={() => setIsFocusDepartamento(false)}
                  onChange={(item) => {
                    updateField("departamento", item.value);
                    updateField("municipio", ""); // Resetear municipio al cambiar departamento
                    setIsFocusDepartamento(false);
                  }}
                  renderLeftIcon={() => (
                    <View style={styles.iconContainer}>
                      <Feather name="map" size={16} color="#9ca3af" />
                    </View>
                  )}
                />
              )}
            </View>

            {/* Municipio - Con datos de la API */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Municipio</Text>
              {loadingMunicipios ? (
                <View style={[styles.dropdown, styles.loadingContainer]}>
                  <ActivityIndicator size="small" color="#16a34a" />
                  <Text style={styles.loadingText}>Cargando municipios...</Text>
                </View>
              ) : (
                <Dropdown
                  style={[
                    styles.dropdown,
                    isFocusMunicipio && { borderColor: "#16a34a" },
                    !formData.departamento && styles.disabledDropdown,
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
                    formData.departamento
                      ? "Seleccionar municipio"
                      : "Primero seleccione un departamento"
                  }
                  searchPlaceholder="Buscar..."
                  value={formData.municipio}
                  disable={!formData.departamento}
                  onFocus={() => setIsFocusMunicipio(true)}
                  onBlur={() => setIsFocusMunicipio(false)}
                  onChange={(item) => {
                    updateField("municipio", item.value);
                    setIsFocusMunicipio(false);
                  }}
                  renderLeftIcon={() => (
                    <View style={styles.iconContainer}>
                      <Feather name="map-pin" size={16} color="#9ca3af" />
                    </View>
                  )}
                />
              )}
            </View>

            {/* Responsable a cargo - NUEVO CAMPO */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Responsable a cargo</Text>
              <View style={styles.textInput}>
                <View style={styles.inputWithIcon}>
                  <Feather
                    name="user"
                    size={16}
                    color="#9ca3af"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInputInner}
                    value={formData.responsable}
                    onChangeText={(text) => updateField("responsable", text)}
                    placeholder="Nombre del responsable"
                  />
                </View>
              </View>
            </View>

            {/* Teléfono */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Teléfono</Text>
              <View style={styles.textInput}>
                <View style={styles.inputWithIcon}>
                  <Feather
                    name="phone"
                    size={16}
                    color="#9ca3af"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInputInner}
                    value={formData.telefono}
                    onChangeText={(text) => updateField("telefono", text)}
                    placeholder="+52 55 1234 5678"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </View>

            {/* Notas adicionales */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Notas adicionales</Text>
              <TextInput
                style={[styles.textInput, styles.textAreaInput]}
                value={formData.nota}
                onChangeText={(text) => updateField("nota", text)}
                placeholder="Ubicada en el centro comercial principal. Cuenta con estacionamiento gratuito para clientes."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Botón de guardar cambios */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Crear punto de venta</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LayoutMain>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerHome: {
    height: 75,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 9,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  iconBackButton: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  titleHeader: {
    color: "black",
    fontSize: 24,
    fontWeight: "700",
    borderBottomWidth: 2,
    borderBottomColor: "#16a34a",
  },
  leftNavbar: {
    position: "relative",
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
  },
  sectionContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginLeft: 8,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4b5563",
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1f2937",
    height: 55, // Increased height for text inputs
    textAlignVertical: "center", // Center text vertically
  },
  textAreaInput: {
    minHeight: 80,
    textAlignVertical: "top",
    height: "auto", // Keep original height for notes field
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    height: "100%", // Make sure it takes full height of parent
  },
  inputIcon: {
    marginRight: 8,
  },
  textInputInner: {
    flex: 1,
    fontSize: 14,
    color: "#1f2937",
    paddingVertical: 0,
    textAlignVertical: "center", // Center text vertically
  },
  switchContainer: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: "#4b5563",
  },
  saveButton: {
    backgroundColor: "#16a34a",
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  saveButtonDisabled: {
    backgroundColor: "#86efac", // Un tono más claro para indicar que está deshabilitado
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButtonIcon: {
    marginRight: 8,
  },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: "white",
  },
  disabledDropdown: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
  },
  iconContainer: {
    marginRight: 8,
  },
  placeholderStyle: {
    fontSize: 14,
    color: "#9ca3af",
    textAlignVertical: "center", // Center placeholder text vertically
  },
  selectedTextStyle: {
    fontSize: 14,
    color: "#1f2937",
    textAlignVertical: "center", // Center selected text vertically
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
    height: 50,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#4b5563",
  },
});
export default NewPointSale;
