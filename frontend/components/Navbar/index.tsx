// NavBar.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { usePathname, useRouter } from "expo-router";

const NAVBAR_HEIGHT = 60; // Altura del navbar

// Función para calcular la altura total incluyendo el inset
const getTotalNavBarHeight = (bottomInset: number): number => {
  return NAVBAR_HEIGHT + (bottomInset > 0 ? bottomInset : 10);
};

function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (route: string) => {
    if (route === "/analysis") {
      // Retorna true si estamos en /analysis o en cualquier subruta de /analysis
      return pathname === route || pathname.startsWith(`${route}/`);
    } else if (route === "/settings") {
      return pathname === route || pathname.startsWith(`${route}/`);
    }
    return pathname === route;
  };
  const navigateTo = (route: string) => {
    router.replace(route);
  };
  return (
    <View style={[styles.navbar]}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigateTo("/home")}
      >
        <MaterialIcons
          name="space-dashboard"
          size={24}
          color={isActive("/home") ? "black" : "gray"}
        />
        <Text
          style={{
            color: isActive("/home") ? "black" : "gray",
            marginTop: 4,
          }}
        >
          Inicio
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/diarybook")}
      >
        <MaterialIcons
          name="currency-exchange"
          size={24}
          color={isActive("/diarybook") ? "black" : "gray"}
        />
        <Text
          style={{
            color: isActive("/diarybook") ? "black" : "gray",
            marginTop: 4,
          }}
        >
          Libro diario
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/analysis")}
      >
        <Ionicons
          name="document-text-outline"
          size={24}
          color={isActive("/analysis") ? "black" : "gray"}
        />
        <Text
          style={{
            color: isActive("/analysis") ? "black" : "gray",
            marginTop: 4,
          }}
        >
          Analisis
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigateTo("/settings")}
      >
        <Ionicons
          name="settings-outline"
          size={24}
          color={isActive("/settings") ? "black" : "gray"}
        />
        <Text
          style={{
            color: isActive("/settings") ? "black" : "gray",
            marginTop: 4,
          }}
        >
          Ajustes
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "white",
    width: "100%",
    height: 56,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export { NavBar, NAVBAR_HEIGHT, getTotalNavBarHeight };
