import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Platform } from "react-native";
import Constants from 'expo-constants';
import { useEffect } from "react";
import { initializeBusinessListeners } from "../hooks/useBusinessStore";

export default function RootLayout() {
  // Inicializar listeners de negocio una sola vez
  useEffect(() => {
    initializeBusinessListeners();
  }, []);

  const containerStyle = {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? Constants.statusBarHeight : 0,
  };

  return (
    <View style={containerStyle}>
      <StatusBar style="dark" backgroundColor="#16a34a" />
      <Slot />
    </View>
  );
}