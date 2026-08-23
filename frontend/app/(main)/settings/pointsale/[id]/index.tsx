import React, { useState, useEffect } from "react";
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
  Alert,
  ActivityIndicator,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Entypo, Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import useBusinessStore from "../../../../../hooks/useBusinessStore";
import api from "../../../../../api/apiConfig";

interface PointSaleData {
  id: number;
  nombre: string;
  ubicacion: string;
  activo: number;
  responsable: string;
  telefono: string;
  fecha_creacion: string;
  negocio_id: number;
  latitud: number | null;
  longitud: number | null;
  departamento?: string;
  municipio?: string;
  nota?: string;
}

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

function EditPointSale() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { activeBusiness } = useBusinessStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados para los campos del formulario
  const [branchName, setBranchName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [responsable, setResponsable] = useState("");
  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [creationDate, setCreationDate] = useState("");
  const [lastUpdate, setLastUpdate] = useState("");

  // Estados para departamento y municipio
  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");

  // Estados para las listas de departamentos y municipios
  const [departamentos, setDepartamentos] = useState<DropdownItem[]>([]);
  const [municipios, setMunicipios] = useState<DropdownItem[]>([]);

  // Estados para controlar la carga de datos
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(false);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

  // Estados para controlar el foco de los dropdowns
  const [isFocusDepartamento, setIsFocusDepartamento] = useState(false);
  const [isFocusMunicipio, setIsFocusMunicipio] = useState(false);

  // Cargar departamentos al inicio
  useEffect(() => {
    if (activeBusiness?.id) {
      fetchDepartments();
    }
  }, [activeBusiness?.id]);

  // Cargar municipios cuando cambia el departamento
  useEffect(() => {
    if (departamento) {
      fetchMunicipalities(departamento);
    } else {
      setMunicipios([]);
      setMunicipio("");
    }
  }, [departamento]);

  // Asegúrate de que se carguen los municipios cuando el componente se monte y ya hay un departamento
  useEffect(() => {
    if (departamento && municipios.length <= 1) {
      fetchMunicipalities(departamento);
    }
  }, [departamento, municipios]);

  // Cargar los datos del punto de venta
  useEffect(() => {
    const fetchPointSaleData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`point-sale/${id}`);
        const pointSale: PointSaleData = response.data;

        // Actualizar estados con los datos recibidos
        setBranchName(pointSale.nombre || "");
        setAddress(pointSale.ubicacion || "");
        setPhone(pointSale.telefono || "");
        setResponsable(pointSale.responsable || "");
        setNotes(pointSale.nota || "");
        setIsActive(pointSale.activo === 1);

        // Formatear fecha de creación para mostrar
        if (pointSale.fecha_creacion) {
          const date = new Date(pointSale.fecha_creacion);
          setCreationDate(date.toLocaleDateString("es-ES"));
          setLastUpdate(new Date().toLocaleDateString("es-ES")); // Ejemplo, ajustar según API
        }

        // Establecer departamento y municipio si están disponibles
        if (pointSale.departamento) {
          setDepartamento(pointSale.departamento.toString());
          console.log(
            "Departamento establecido:",
            pointSale.departamento.toString()
          );
        }

        if (pointSale.municipio) {
          setMunicipio(pointSale.municipio.toString());
          console.log("Municipio establecido:", pointSale.municipio.toString());
        }
      } catch (error) {
        console.error("Error al obtener datos del punto de venta:", error);
        Alert.alert(
          "Error",
          "No se pudieron cargar los datos del punto de venta."
        );
      } finally {
        setLoading(false);
      }
    };

    if (activeBusiness?.id) {
      fetchPointSaleData();
    }
  }, [id, activeBusiness?.id]);

  // Función para cargar departamentos desde la API
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
      // Fallback a una lista vacía con opción por defecto
      setDepartamentos([{ label: "Seleccionar departamento", value: "" }]);
    } finally {
      setLoadingDepartamentos(false);
    }
  };

  // Función para cargar municipios basados en el departamento seleccionado
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

  // Función para validar el formulario
  const validateForm = (): boolean => {
    if (!branchName.trim()) {
      Alert.alert("Error", "El nombre de la sucursal es obligatorio");
      return false;
    }

    if (!address.trim()) {
      Alert.alert("Error", "La dirección es obligatoria");
      return false;
    }

    if (!departamento) {
      Alert.alert("Error", "Debe seleccionar un departamento");
      return false;
    }

    if (!municipio) {
      Alert.alert("Error", "Debe seleccionar un municipio");
      return false;
    }

    if (!phone.trim()) {
      Alert.alert("Error", "El teléfono es obligatorio");
      return false;
    }

    if (!responsable.trim()) {
      Alert.alert("Error", "El responsable es obligatorio");
      return false;
    }

    return true;
  };

  // Función para manejar el guardado de cambios
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const pointSaleData = {
        nombre: branchName,
        ubicacion: address,
        telefono: phone,
        responsable: responsable,
        activo: isActive ? 1 : 0,
        nota: notes,
        departamento: parseInt(departamento),
        municipio: parseInt(municipio),
        negocio_id: activeBusiness?.id,
      };

      // Actualizar punto de venta existente
      const response = await api.put(`point-sale/${id}`, pointSaleData);
      Alert.alert("Éxito", "Punto de venta actualizado con éxito");
      router.replace("/settings/pointsale");
    } catch (error) {
      console.error("Error al guardar el punto de venta:", error);
      Alert.alert(
        "Error",
        "No se pudo guardar el punto de venta. Intente de nuevo."
      );
    } finally {
      setSaving(false);
    }
  };

  // Función para manejar la eliminación
  const handleDelete = () => {
    Alert.alert(
      "Eliminar punto de venta",
      `¿Estás seguro que deseas eliminar este punto de venta?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              await api.patch(`point-sale/${id}/status`, {
                activo: false,
              });

              router.replace("/settings/pointsale");
            } catch (error) {
              console.error(`Error eliminando este item`, error);
              Alert.alert("Error", "No se pudo eliminar el punto de venta");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  if (loading) {
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
    <Text style={styles.titleHeader}>Editar punto de venta</Text>
  </View>
  <Pressable
    style={styles.saveButton}
    onPress={handleSave}
    disabled={saving}
  >
    <View style={styles.buttonContent}>
      {saving ? (
        <ActivityIndicator size="small" color="#16a34a" />
      ) : (
        <>
          <Feather name="save" size={20} color="#16a34a" />
          <Text style={styles.buttonText}>Guardar</Text>
        </>
      )}
    </View>
  </Pressable>
</View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Cargando datos...</Text>
        </View>
      </LayoutMain>
    );
  }

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
    <Text style={styles.titleHeader}>Editar punto de venta</Text>
  </View>
  <Pressable
    style={styles.saveButton}
    onPress={handleSave}
    disabled={saving}
  >
    <View style={styles.buttonContent}>
      {saving ? (
        <ActivityIndicator size="small" color="#16a34a" />
      ) : (
        <>
          <Feather name="save" size={20} color="#16a34a" />
          <Text style={styles.buttonText}>Guardar</Text>
        </>
      )}
    </View>
  </Pressable>
</View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* Sección de información básica */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleContainer}>
            <Entypo name="shop" size={20} color="#16a34a" />
            <Text style={styles.sectionTitle}>Información básica</Text>
          </View>

          {/* Nombre de la sucursal */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Nombre de la sucursal *</Text>
            <TextInput
              style={styles.textInput}
              value={branchName}
              onChangeText={setBranchName}
              placeholder="Ej: Sucursal Centro"
            />
          </View>

          {/* Responsable */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Responsable *</Text>
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
                  value={responsable}
                  onChangeText={setResponsable}
                  placeholder="Ej: Ana María Rodríguez"
                />
              </View>
            </View>
          </View>

          {/* Dirección */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Dirección *</Text>
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
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Ej: Av. Principal 123"
                />
              </View>
            </View>
          </View>

          {/* Departamento con Dropdown - Usando API */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Departamento *</Text>
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
                value={departamento}
                onFocus={() => setIsFocusDepartamento(true)}
                onBlur={() => setIsFocusDepartamento(false)}
                onChange={(item) => {
                  setDepartamento(item.value);
                  setMunicipio(""); // Resetear municipio al cambiar departamento
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

          {/* Municipio con Dropdown - Usando API */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Municipio *</Text>
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
                  !departamento && styles.disabledDropdown,
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
                  departamento
                    ? "Seleccionar municipio"
                    : "Primero seleccione un departamento"
                }
                searchPlaceholder="Buscar..."
                value={municipio}
                disable={!departamento}
                onFocus={() => setIsFocusMunicipio(true)}
                onBlur={() => setIsFocusMunicipio(false)}
                onChange={(item) => {
                  setMunicipio(item.value);
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

          {/* Teléfono */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Teléfono *</Text>
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
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Ej: 3157894562"
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
              value={notes}
              onChangeText={setNotes}
              placeholder="Información complementaria sobre el punto de venta"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Estado del punto de venta */}
          <View style={styles.switchContainer}>
            <Text style={styles.fieldLabel}>Estado del punto de venta</Text>
            <View style={styles.switchRow}>
              <Text
                style={[
                  styles.switchLabel,
                  isActive ? styles.activeText : styles.inactiveText,
                ]}
              >
                {isActive ? "Activo" : "Inactivo"}
              </Text>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: "#e5e7eb", true: "#16a34a" }}
                thumbColor={"#ffffff"}
              />
            </View>
          </View>
        </View>

        {/* Sección de información adicional */}
        {creationDate && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionTitleContainer}>
              <Feather name="info" size={20} color="#16a34a" />
              <Text style={styles.sectionTitle}>Información adicional</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Fecha de creación</Text>
                <View style={styles.infoValue}>
                  <Feather
                    name="calendar"
                    size={14}
                    color="#9ca3af"
                    style={styles.infoIcon}
                  />
                  <Text style={styles.infoText}>{creationDate}</Text>
                </View>
              </View>

              {lastUpdate && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Última actualización</Text>
                  <View style={styles.infoValue}>
                    <Feather
                      name="calendar"
                      size={14}
                      color="#9ca3af"
                      style={styles.infoIcon}
                    />
                    <Text style={styles.infoText}>{lastUpdate}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Botón de eliminar */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Feather
            name="trash-2"
            size={18}
            color="#ef4444"
            style={styles.deleteIcon}
          />
          <Text style={styles.deleteButtonText}>Eliminar punto de venta</Text>
        </TouchableOpacity>
      </ScrollView>
    </LayoutMain>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "500",
  },
  deleteIcon: {
    marginRight: 8,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  saveButton: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
    height: 24,
  },
  buttonText: {
    color: "#16a34a",
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "500",
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
  },
  textAreaInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputIcon: {
    marginRight: 8,
  },
  textInputInner: {
    flex: 1,
    fontSize: 14,
    color: "#1f2937",
    paddingVertical: 0,
  },
  switchContainer: {
    marginBottom: 4,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  activeText: {
    color: "#16a34a",
  },
  inactiveText: {
    color: "#9ca3af",
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
  },
  selectedTextStyle: {
    fontSize: 14,
    color: "#1f2937",
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 14,
    borderColor: "#e5e7eb",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4b5563",
    marginBottom: 6,
  },
  infoValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    marginRight: 6,
  },
  infoText: {
    fontSize: 14,
    color: "#1f2937",
  },
});

export default EditPointSale;
