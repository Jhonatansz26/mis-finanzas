import {
  AntDesign,
  Entypo,
  EvilIcons,
  Feather,
  MaterialIcons,
} from "@expo/vector-icons";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import useBusinessStore from "../../hooks/useBusinessStore";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../hooks/useAuthStore";

const ProfileCard = () => {
  const { activeBusiness } = useBusinessStore();
  const { user } = useAuthStore();
  const router = useRouter();

  console.log("activeBusiness",activeBusiness);
  

  // Construir el nombre completo del usuario
  const getFirstName = (nombres: string | null | undefined) =>
    nombres?.split(" ")[0] || "";
  const getFirstLastName = (apellidos: string | null | undefined) =>
    apellidos?.split(" ")[0] || "";

  const fullName =
    user?.nombres && user?.apellidos
      ? `${getFirstName(user.nombres)} ${getFirstLastName(user.apellidos)}`
      : getFirstName(user?.nombres) ||
        getFirstLastName(user?.apellidos) ||
        "Usuario";
  // Construir la ubicación desde el negocio
  const location =
    activeBusiness?.municipio_nombre && activeBusiness?.departamento_id
      ? `${activeBusiness.municipio_nombre}, ${activeBusiness.departamento_nombre}`
      : activeBusiness?.municipio_nombre ||
        activeBusiness?.departamento_nombre ||
        "No especificada";

  return (
    <View style={styles.cardProfile}>
      {/* Primera sección: Icono y información principal */}
      <View style={styles.topSection}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="person" size={24} color="#4CAF50" />
        </View>

        <View style={styles.mainInfo}>
          <Text style={styles.userName}>{fullName}</Text>
          <View style={styles.businessRow}>
            <MaterialIcons name="business" size={16} color="#666" />
            <Text style={styles.businessInfo}>
              {activeBusiness?.nombre || "Sin negocio activo"}
            </Text>
          </View>
        </View>

        {/* Estado moderno */}
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>ACTIVO</Text>
        </View>
      </View>

      {/* Segunda sección: Información de contacto pegada a la izquierda */}
      <View style={styles.bottomSection}>
        <View style={styles.contactInfo}>
          {/* Email */}
          <View style={styles.contactRow}>
            <Entypo name="email" size={16} color="rgba(0, 0, 0, 0.7)" />
            <Text style={styles.contactText}>
              {user?.email || "No especificado"}
            </Text>
          </View>

          {/* Teléfono */}
          <View style={styles.contactRow}>
            <AntDesign name="phone" size={16} color="rgba(0, 0, 0, 0.7)" />
            <Text style={styles.contactText}>
              {user?.telefono || activeBusiness?.telefono || "No especificado"}
            </Text>
          </View>

          {/* Ubicación */}
          <View style={styles.contactRow}>
            <EvilIcons name="location" size={22} color="rgba(0, 0, 0, 0.7)" />
            <Text style={styles.contactText}>{location}</Text>
          </View>

          {/* Botón de editar moderno y más grande */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.replace("/settings/profile")}
          >
            <Feather name="edit-3" size={20} color="rgba(0, 0, 0, 0.7)" />
            <Text style={styles.editText}>Editar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

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
    padding: 16,
    flexDirection: "column",
  },

  // Primera sección
  topSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    position: "relative",
    paddingTop: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  mainInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  businessRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  businessInfo: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  statusBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    color: "white",
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  // Segunda sección
  bottomSection: {
    flex: 1,
    justifyContent: "space-between",
    position: "relative",
  },
  contactInfo: {
    alignItems: "flex-start",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    position: "absolute",
    borderWidth: 1,
    borderColor: "#ddd",
    alignSelf: "flex-end",
    bottom: 0,
  },
  editText: {
    fontSize: 14,
    color: "rgba(0, 0, 0, 0.7)",
    marginLeft: 6,
    fontWeight: "600",
  },
});

export default ProfileCard;
