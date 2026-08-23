import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Menu, Divider } from "react-native-paper";
import { SimpleLineIcons, MaterialCommunityIcons } from "@expo/vector-icons";

interface FixedCostCardProps {
  cost: any;
  onEdit: (cost: any) => void;
  onDelete: (cost: any) => void;
}

const FixedCostCard: React.FC<FixedCostCardProps> = ({ cost, onEdit, onDelete }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleEdit = () => {
    closeMenu();
    if (onEdit) onEdit(cost);
  };

  const handleDelete = () => {
    closeMenu();
    if (onDelete) onDelete(cost);
  };

  // Formatear moneda
  const formatCurrency = (amount: any) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Formatear fecha
  const formatDate = (dateString: any) => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View style={styles.costCard}>
      <View style={styles.costCardHeader}>
        <View style={styles.costCardLeft}>
          <Text style={styles.categoryName}>{cost.categoria_nombre}</Text>
          <Text style={styles.costAmount}>
            {formatCurrency(cost.monto_mensual)}
          </Text>
        </View>
        <View style={styles.costCardRight}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: cost.activo ? "#dcfce7" : "#fef2f2" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: cost.activo ? "#16a34a" : "#dc2626" },
              ]}
            >
              {cost.activo ? "Activo" : "Inactivo"}
            </Text>
          </View>

          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={
              <Pressable
                style={styles.moreOptionsButton}
                onPress={openMenu}
              >
                <Feather name="more-vertical" size={16} color="#6b7280" />
              </Pressable>
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item
              onPress={handleEdit}
              title="Editar"
              titleStyle={styles.menuItemTitle}
              style={styles.menuItem}
              leadingIcon={({ size, color }) => (
                <View style={styles.iconContainer}>
                  <SimpleLineIcons name="pencil" size={16} color="#333" />
                </View>
              )}
            />
            <Divider style={styles.menuDivider} />
            <Menu.Item
              onPress={handleDelete}
              title="Eliminar"
              titleStyle={[styles.menuItemTitle, styles.deleteText]}
              style={styles.menuItem}
              leadingIcon={({ size, color }) => (
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name="delete"
                    size={16}
                    color="#dc2626"
                  />
                </View>
              )}
            />
          </Menu>
        </View>
      </View>

      {cost.descripcion && (
        <Text style={styles.costDescription}>{cost.descripcion}</Text>
      )}

      <View style={styles.costCardFooter}>
        <Text style={styles.creationDate}>
          Creado: {formatDate(cost.fecha_creacion)}
        </Text>
        {cost.ultima_actualizacion &&
          cost.ultima_actualizacion !== cost.fecha_creacion && (
            <Text style={styles.updateDate}>
              Actualizado: {formatDate(cost.ultima_actualizacion)}
            </Text>
          )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  costCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  costCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  costCardLeft: {
    flex: 1,
  },
  costCardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  costAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#16a34a",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  moreOptionsButton: {
    padding: 4,
  },
  costDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
    lineHeight: 20,
  },
  costCardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 8,
  },
  creationDate: {
    fontSize: 12,
    color: "#9ca3af",
  },
  updateDate: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  // Estilos para el menú
  menuContent: {
    backgroundColor: "white",
    borderRadius: 4,
    marginTop: 35,
    width: 130,
  },
  menuItem: {
    height: 40,
    paddingVertical: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 50,
  },
  menuItemTitle: {
    fontSize: 14,
  },
  deleteText: {
    color: "#dc2626",
  },
  menuDivider: {
    height: 1,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default FixedCostCard;