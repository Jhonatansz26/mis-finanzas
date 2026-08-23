// LayoutMain.tsx
import React from "react";
import { StyleSheet, View, Platform, Dimensions, StatusBar } from "react-native";
import { NavBar } from "../Navbar";

// Función para obtener el top inset según el dispositivo
const getTopInset = () => {
  const { height, width } = Dimensions.get('window');
  
  if (Platform.OS === 'ios') {
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
  const { height } = Dimensions.get('window');
  
  if (Platform.OS === 'ios') {
    // iPhone con botón home gesture
    if (height >= 812) {
      return 34; // iPhone X y posteriores
    }
    return 20; // iPhone con botón físico
  } else {
    // Android con navegación por gestos
    return 0; // Valor estándar para Android moderno
  }
}; 

function LayoutMain({ children }: any) {
  const topInset = getTopInset();
  const bottomInset = getBottomInset();

  return (
    <View style={styles.container}>
      {/* StatusBar para Android */}
      {Platform.OS === 'android' && (
        <StatusBar backgroundColor="white" barStyle="dark-content" />
      )}
      
      {/* Aplicamos el padding calculado para el inset superior */}
      <View style={[styles.content, { paddingTop: topInset }]}>
        {children}
      </View>
      
      {/* El NavBar con padding calculado para el inset inferior */}
      <View style={[
        styles.navbarContainer, 
        { paddingBottom: Math.max(bottomInset) }
      ]}>
        <NavBar />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
  },
  navbarContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});

export default LayoutMain;