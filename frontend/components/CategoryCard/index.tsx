import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Menu, Divider } from 'react-native-paper';
import { SimpleLineIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const CategoryCard = ({ item, onDelete }:any) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleEdit = () => {
    closeMenu();
    router.replace(`/settings/costs/${item.id}`);
  };

  const handleDelete = () => {
    closeMenu();
    if (onDelete) {
      onDelete(item.id);
    }
  };

  // Determina el color de fondo basado en el tipo de costo
  const getTypeColor = (type:any) => {
    // Normaliza el tipo a minúsculas para comparación
    const normalizedType = type.toLowerCase();
    if (normalizedType === "fijo") return "#dbeafe"; // Azul claro para costos fijos
    return "#fee2e2"; // Rojo claro para costos variables
  };

  // Determina el color del texto basado en el tipo de costo
  const getTextColor = (type:any) => {
    const normalizedType = type.toLowerCase();
    if (normalizedType === "fijo") return "#1d4ed8"; // Azul para costos fijos
    return "#dc2626"; // Rojo para costos variables
  };

  return (
    <Pressable onPress={handleEdit} style={styles.categoryItem}>
      <View style={styles.categoryItemLeft}>
        <Text style={styles.categoryName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.categoryDescription} numberOfLines={1}>
            {item.description}
          </Text>
        )}
      </View>

      <View style={styles.categoryItemRight}>
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: getTypeColor(item.type) },
          ]}
        >
          <Text style={[styles.typeText, { color: getTextColor(item.type) }]}>
            {item.type}
          </Text>
        </View>

        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={
            <Pressable style={styles.optionsButton} onPress={openMenu}>
              <SimpleLineIcons name="options-vertical" size={18} color="#666" />
            </Pressable>
          }
          contentStyle={styles.menuContent}
        >
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
    </Pressable>
  );
};

const styles = StyleSheet.create({
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  categoryItemLeft: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1f2937",
  },
  categoryDescription: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  categoryItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  optionsButton: {
    padding: 4,
  },
  menuContent: {
    backgroundColor: "white",
    borderRadius: 8,
    marginTop: 8,
  },
  menuItem: {
    paddingHorizontal: 16,
    height: 48,
  },
  menuItemTitle: {
    fontSize: 14,
    color: "#333",
  },
  deleteText: {
    color: "#dc2626",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#f3f4f6",
  },
  iconContainer: {
    marginRight: 8,
  },
});

export default CategoryCard;