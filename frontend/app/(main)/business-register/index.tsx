import React from "react";
import { Dimensions, Platform, StyleSheet, Text, View } from "react-native";
import BusinessForm from "../../../forms/BusinessForm";

const getTopInset = () => {
  const { height, width } = Dimensions.get("window");

  if (Platform.OS === "ios") {
    // iPhone con notch/Dynamic Island
    if (height >= 812 || width >= 812) {
      return 47; // iPhone X, XS, XR, 11, 12, 13, 14, etc.
    }
    return 20; // iPhone más antiguos
  } else {
    // Android
    return 0;
  }
};

// Función para obtener el bottom inset según el dispositivo
const getBottomInset = () => {
  const { height } = Dimensions.get("window");

  if (Platform.OS === "ios") {
    // iPhone con botón home gesture
    if (height >= 812) {
      return 34; // iPhone X y posteriores
    }
    return 20; // iPhone con botón físico
  } else {
    // Android con navegación por gestos
    return 50; // Valor estándar para Android moderno
  }
};

function Business_register() {
  const topInset = getTopInset();
  const bottomInset = getBottomInset();
  return (
    <View style={styles.container}>
    
      <View style={[styles.content, { paddingTop: topInset }]}>
        <View style={styles.containerPlayground}>
          <View style={styles.headerBusinnesForm}>
            <Text style={styles.title}>Registra tu Negocio</Text>
          </View>
          <BusinessForm />
        </View>
      </View>
      <View ></View>
    </View>
  );
}

const styles = StyleSheet.create({
  content:{flex:1},
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  containerPlayground: {
    flex: 1,
  },
  headerBusinnesForm: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 30,
    marginBottom: 10,
    fontWeight: 700,
  },
  subtitle: {
    fontSize: 20,
    textAlign: "center",
    color: "rgba(0, 0, 0, 0.48)",
  },
});

export default Business_register;
