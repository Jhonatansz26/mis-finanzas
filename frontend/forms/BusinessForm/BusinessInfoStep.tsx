import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
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

const businessSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  nit: z.string().optional(),
  direccion: z.string().min(1, "La dirección es obligatoria"),
  telefono: z.string().min(1, "El teléfono es obligatorio"),
  email: z.string().min(1, "El email es obligatorio").email("Email inválido"),
  departamento: z.string().min(1, "El departamento es obligatorio"),
  municipio: z.string().min(1, "El municipio es obligatorio"),
});

export type BusinessData = z.infer<typeof businessSchema>;

interface BusinessInfoStepProps {
  initialData: BusinessData;
  onNext: (data: BusinessData) => void;
}

export function BusinessInfoStep({
  initialData,
  onNext,
}: BusinessInfoStepProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BusinessData>({
    resolver: zodResolver(businessSchema),
    defaultValues: initialData,
  });

  const [departamentos, setDepartamentos] = useState<DropdownItem[]>([]);
  const [municipios, setMunicipios] = useState<DropdownItem[]>([]);
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(false);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);
  const [isFocusDepartamento, setIsFocusDepartamento] = useState(false);
  const [isFocusMunicipio, setIsFocusMunicipio] = useState(false);

  const departamentoValue = watch("departamento");

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Feather name="briefcase" size={24} color="#16a34a" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Información del Negocio</Text>
          <Text style={styles.subtitle}>Datos básicos de tu empresa</Text>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre del Negocio *</Text>
          <Controller
            control={control}
            name="nombre"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.nombre && styles.inputError]}
                placeholder="Ej: Mi Tienda S.A."
                value={value}
                onChangeText={onChange}
                placeholderTextColor="#9ca3af"
              />
            )}
          />
          {errors.nombre && (
            <Text style={styles.errorText}>{errors.nombre.message}</Text>
          )}
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>NIT</Text>
            <Controller
              control={control}
              name="nit"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="123456789-0"
                  value={value}
                  onChangeText={onChange}
                  placeholderTextColor="#9ca3af"
                />
              )}
            />
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Teléfono *</Text>
            <Controller
              control={control}
              name="telefono"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.telefono && styles.inputError]}
                  placeholder="300 123 4567"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                  placeholderTextColor="#9ca3af"
                />
              )}
            />
            {errors.telefono && (
              <Text style={styles.errorText}>{errors.telefono.message}</Text>
            )}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email *</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="contacto@minegocio.com"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9ca3af"
              />
            )}
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email.message}</Text>
          )}
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
            {errors.departamento && (
              <Text style={styles.errorText}>
                {errors.departamento.message}
              </Text>
            )}
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
            {errors.municipio && (
              <Text style={styles.errorText}>{errors.municipio.message}</Text>
            )}
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dirección *</Text>
          <Controller
            control={control}
            name="direccion"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.direccion && styles.inputError]}
                placeholder="Calle 123 #45-67"
                value={value}
                onChangeText={onChange}
                placeholderTextColor="#9ca3af"
              />
            )}
          />
          {errors.direccion && (
            <Text style={styles.errorText}>{errors.direccion.message}</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(onNext)}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Continuar</Text>
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
    marginBottom: 12,
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
  form: {
    gap: 0,
  },
  inputGroup: {
    marginBottom: 16,
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
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16a34a",
    height: 56,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  buttonText: {
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
