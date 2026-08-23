import React from "react";
import { Image, Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import LayoutMain from "../../../../components/LayoutHome";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import useBusinessStore from "../../../../hooks/useBusinessStore";
import { useAuthStore } from "../../../../hooks/useAuthStore";

function Profile() {
  const router = useRouter();

  const { activeBusiness } = useBusinessStore();
  const { user } = useAuthStore();
  
  // Función para formatear la fecha
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "No disponible";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Función para formatear el teléfono
  const formatPhone = (phone?: string | null): string => {
    if (!phone) return "No disponible";
    // Formato: (312) 874-4946
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <LayoutMain>
      <View style={styles.headerHome}>
        <Text style={styles.titleHeader}>Perfil</Text>
        <View style={{ paddingRight: 5 }}>
          <Image
            source={require("../../../../assets/icon.png")}
            style={{
              width: 70,
              height: 46,
              marginTop: -9,
            }}
          />
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Sección de Usuario */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="user" size={20} color="#16a34a" />
            <Text style={styles.sectionTitle}>Información Personal</Text>
          </View>
          
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nombre Completo:</Text>
              <Text style={styles.value}>
                {user?.nombres} {user?.apellidos}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Documento:</Text>
              <Text style={styles.value}>{user?.documento || "No disponible"}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{user?.email || "No disponible"}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Teléfono:</Text>
              <Text style={styles.value}>{formatPhone(user?.telefono)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Fecha de Nacimiento:</Text>
              <Text style={styles.value}>{formatDate(user?.fecha_nacimiento)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Rol:</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {user?.role === 'user' ? 'Usuario' : user?.role || 'No definido'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sección de Negocio */}
        {activeBusiness && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="briefcase" size={20} color="#16a34a" />
              <Text style={styles.sectionTitle}>Negocio Activo</Text>
            </View>
            
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Nombre del Negocio:</Text>
                <Text style={styles.value}>{activeBusiness.nombre}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>NIT:</Text>
                <Text style={styles.value}>{activeBusiness.nit}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{activeBusiness.email}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Teléfono:</Text>
                <Text style={styles.value}>{formatPhone(activeBusiness.telefono)}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Dirección:</Text>
                <Text style={styles.value}>{activeBusiness.direccion}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Fecha de Creación:</Text>
                <Text style={styles.value}>{formatDate(activeBusiness.created_at)}</Text>
              </View>

            </View>
          </View>
        )}

        {/* Botones de Acción */}
        <View style={styles.actionsSection}>
          <Pressable style={styles.actionButton} onPress={() => router.push('/settings/profile/edit')}>
            <Feather name="edit-3" size={18} color="white" />
            <Text style={styles.actionButtonText}>Editar Perfil</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={() => router.push('/settings')}>
            <Feather name="settings" size={18} color="#16a34a" />
            <Text style={styles.secondaryButtonText}>Configuración</Text>
          </Pressable>
        </View>

        {/* Espaciado inferior */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </LayoutMain>
  );
}

const styles = StyleSheet.create({
  headerHome: {
    height: 75,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 29,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  titleHeader: {
    color: "black",
    fontSize: 24,
    fontWeight: "700",
    borderBottomWidth: 2,
    borderBottomColor: "#16a34a",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginLeft: 8,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
    flex: 1,
    marginRight: 10,
  },
  value: {
    fontSize: 14,
    color: "#1e293b",
    flex: 1.2,
    textAlign: "right",
    fontWeight: "400",
  },
  roleBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 12,
    color: "#16a34a",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  actionsSection: {
    marginTop: 30,
    gap: 12,
  },
  actionButton: {
    backgroundColor: "#16a34a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#16a34a",
    gap: 8,
  },
  secondaryButtonText: {
    color: "#16a34a",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Profile;