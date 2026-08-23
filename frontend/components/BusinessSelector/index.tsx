import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { AntDesign } from "@expo/vector-icons";
import useBusinessStore from "../../hooks/useBusinessStore";
import { useAuthStore } from "../../hooks/useAuthStore";

const BusinessSelector = ({ onBusinessChange, containerStyle }: any) => {
  const {
    businesses,
    activeBusiness,
    setActiveBusiness,
    fetchBusinesses,
    isLoading,
  } = useBusinessStore();

  const { isAuthenticated } = useAuthStore();
  const [isFocus, setIsFocus] = useState(false);

  // Cargar los negocios cuando el componente se monta si es necesario
  useEffect(() => {
    if (isAuthenticated && businesses.length === 0) {
      fetchBusinesses();
    }
  }, [isAuthenticated]);

  // Lanzar el callback cuando cambia el negocio activo
  useEffect(() => {
    if (onBusinessChange && activeBusiness) {
      onBusinessChange(activeBusiness);
    }
  }, [activeBusiness, onBusinessChange]);

  // Preparar los datos para el dropdown - Usando 'nombre' en lugar de 'name'
  const businessOptions = businesses.map(business => ({
    label: business.nombre, // Cambiado de business.name a business.nombre
    value: business.id
  }));

  console.log("Business options:", businessOptions);
  console.log("Active ID:", activeBusiness?.id);

  // Función para renderizar la etiqueta
  const renderLabel = () => {
    if (activeBusiness || isFocus) {
      return (
        <Text style={styles.label}>Negocio activo</Text>
      );
    }
    return null;
  };

  // Si no hay usuario autenticado, no mostrar nada
  if (!isAuthenticated) {
    return null;
  }

  // Mostrar cargando mientras se obtienen los negocios
  if (isLoading) {
    return (
      <View style={[styles.container, containerStyle]}>
        <ActivityIndicator size="small" color="#16a34a" />
        <Text style={styles.loadingText}>Cargando negocios...</Text>
      </View>
    );
  }

  // Si no hay negocios, mostrar mensaje
  if (businesses.length === 0) {
    return (
      <View style={[styles.container, containerStyle]}>
        <Text style={styles.noBusinessText}>
          No tienes negocios registrados
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            // Navegar a la pantalla de añadir negocio
            // Requiere implementación de navegación
          }}
        >
          <Text style={styles.addButtonText}>Añadir Negocio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.dropdownContainer}>
        {renderLabel()}
        <Dropdown
          style={[styles.dropdown, isFocus && { borderColor: "#16a34a" }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={businessOptions}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? "Seleccionar negocio" : "..."}
          searchPlaceholder="Buscar..."
          value={activeBusiness?.id}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={(item) => {
            console.log("Selected item:", item);
            setActiveBusiness(item.value);
            setIsFocus(false);
          }}
          renderLeftIcon={() => (
            <AntDesign
              style={styles.icon}
              color={isFocus ? "#16a34a" : "black"}
              name="api"
              size={20}
            />
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginVertical: 10,
  },
  dropdownContainer: {
    backgroundColor: "white",
    marginBottom: 15,
    position: "relative",
  },
  dropdown: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    backgroundColor: "white",
  },
  icon: {
    marginRight: 10,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: -8,
    zIndex: 999,
    paddingHorizontal: 4,
    fontSize: 12,
  },
  placeholderStyle: {
    fontSize: 16,
    color: "#999",
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "#333",
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  loadingText: {
    marginTop: 5,
    color: "#666",
    textAlign: "center",
  },
  noBusinessText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#16a34a",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default BusinessSelector;