import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import LayoutMain from "../../../components/LayoutHome";
import {
  Entypo,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../../hooks/useAuthStore";
import useBusinessStore from "../../../hooks/useBusinessStore";
import ProfileCard from "../../../components/ProfileCard";

function settings() {
  const router = useRouter();

  const { businesses } = useBusinessStore();

  console.log(businesses);

  const { logout } = useAuthStore();

  return (
    <LayoutMain>
      <View style={styles.headerHome}>
        <Text style={styles.titleHeader}>Ajustes</Text>
        <View style={{ paddingRight: 5 }}>
          <Image
            source={require("../../../assets/icon.png")}
            style={{
              width: 70,
              height: 46,
              marginTop: -9,
            }}
          />
        </View>
      </View>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <ProfileCard />
       

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Negocio</Text>
          <View style={styles.menuContainer}>
            <Pressable
              style={styles.menuItem}
              onPress={() => router.replace("/settings/pointsale")}
            >
              <View style={styles.menuItemLeft}>
                <View
                  style={[styles.iconContainer, { backgroundColor: "#e6f7ee" }]}
                >
                  <Entypo name="shop" size={20} color="#16a34a" />
                </View>
                <View style={styles.menuItemTextContainer}>
                  <Text style={styles.menuItemText}>Puntos de venta</Text>
                  <Text style={styles.menuItemSubtext}>
                    Añadir, editar o desactivar sucursales
                  </Text>
                </View>
              </View>
              <MaterialIcons
                name="arrow-forward-ios"
                size={16}
                color="#bdbdbd"
              />
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => router.replace("/settings/products")}
            >
              <View style={styles.menuItemLeft}>
                <View
                  style={[styles.iconContainer, { backgroundColor: "#e8f1fb" }]}
                >
                  <Feather name="package" size={20} color="#4a7fc0" />
                </View>
                <View style={styles.menuItemTextContainer}>
                  <Text style={styles.menuItemText}>Catálogo de productos</Text>
                  <Text style={styles.menuItemSubtext}>
                    Precios, unidades de medida e información detallada
                  </Text>
                </View>
              </View>
              <MaterialIcons
                name="arrow-forward-ios"
                size={16}
                color="#bdbdbd"
              />
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => router.replace("/settings/costs")}
            >
              <View style={styles.menuItemLeft}>
                <View
                  style={[styles.iconContainer, { backgroundColor: "#fff8e1" }]}
                >
                  <MaterialIcons
                    name="attach-money"
                    size={20}
                    color="#ffc107"
                  />
                </View>
                <View style={styles.menuItemTextContainer}>
                  <Text style={styles.menuItemText}>Categorías de gastos</Text>
                  <Text style={styles.menuItemSubtext}>
                    Clasificación en costos fijos o variables
                  </Text>
                </View>
              </View>
              <MaterialIcons
                name="arrow-forward-ios"
                size={16}
                color="#bdbdbd"
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Configuracion</Text>
          <View style={styles.menuContainer}>
            <Pressable
              style={styles.menuItem}
              onPress={() => router.replace("/settings/fixedcosts")}
            >
              <View style={styles.menuItemLeft}>
                <View
                  style={[styles.iconContainer, { backgroundColor: "#f3e5f5" }]}
                >
                  <MaterialCommunityIcons
                    name="tune-vertical"
                    size={20}
                    color="#9c27b0"
                  />
                </View>
                <View style={styles.menuItemTextContainer}>
                  <Text style={styles.menuItemText}>Costos fijos</Text>
                  <Text style={styles.menuItemSubtext}>
                    Declara tus costos mensuales
                  </Text>
                </View>
              </View>
              <MaterialIcons
                name="arrow-forward-ios"
                size={16}
                color="#bdbdbd"
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.logoutContainer}>
          <Pressable
            style={styles.logoutButton}
            onPress={() => {
              logout();
              router.replace("(auth)/login");
            }}
          >
            <MaterialCommunityIcons name="logout" size={20} color="#f44336" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </Pressable>
        </View>
      </ScrollView>
    </LayoutMain>
  );
}

const styles = StyleSheet.create({
  cardProfile: {
    height: 170,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 5,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 24,
  },
  titleHeader: {
    color: "black",
    fontSize: 24,
    fontWeight: "700",
    borderBottomWidth: 2,
    borderBottomColor: "#16a34a",
  },
  headerHome: {
    height: 75,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 29,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderColor: "#ddd"
  },
  sectionContainer: {
    width: "100%",
  },
  sectionTitle: {
    fontSize: 16,
    color: "#757575",
    marginBottom: 8,
    fontWeight: "500",
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: "#212121",
    fontWeight: "500",
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemSubtext: {
    fontSize: 12,
    color: "#757575",
    marginTop: 2,
  },
  logoutContainer: {
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ffcdd2",
  },
  logoutText: {
    color: "#f44336",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
});

export default settings;
