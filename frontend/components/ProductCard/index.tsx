import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Menu, Divider } from "react-native-paper";
import { SimpleLineIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import Product from "../../utils/types/Products";



interface ProductCardProps {
  product: Product;
  onEdit: (id: number) => void;
  onDelete: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleEdit = () => {
    closeMenu();
    if (onEdit) onEdit(product.id);
  };

  const handleDelete = () => {
    closeMenu();
    if (onDelete) onDelete();
  };

  // Función para determinar el estado del producto
  const getStatusColor = (activo: number) => {
    return activo === 1 ? "#16a34a" : "#ef4444"; // Verde para activo, rojo para inactivo
  };

  const getStatusText = (activo: number) => {
    return activo === 1 ? "Activo" : "Inactivo";
  };

  // Formatear precio para mostrar con separador de miles
  const formatPrice = (price: string) => {
    const numericPrice = parseFloat(price);
    return numericPrice.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  return (
    <TouchableOpacity onPress={handleEdit} style={styles.productCard}>
      <View style={styles.productIconContainer}>
        <Feather name="box" size={20} color="#4b5563" />
      </View>

      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{product.nombre}</Text>
          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={
              <Pressable style={styles.moreOptionsButton} onPress={openMenu}>
                <Feather name="more-vertical" size={18} color="#4b5563" />
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

        {product.descripcion && (
          <Text style={styles.descriptionText} numberOfLines={1} ellipsizeMode="tail">
            {product.descripcion}
          </Text>
        )}

        <View style={styles.detailsContainer}>
          <View style={styles.unitContainer}>
            <Text style={styles.unitText}>{product.unidad_medida}</Text>
          </View>
          
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: product.activo === 1 ? "#dcfce7" : "#fee2e2" }
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(product.activo) }
              ]}
            >
              {getStatusText(product.activo)}
            </Text>
          </View>
        </View>

        <View style={styles.productDetails}>
          <Text style={styles.priceText}>$ {formatPrice(product.precio_unitario)}</Text>
          
          <View style={styles.costContainer}>
            <Text style={styles.costLabel}>Costo: </Text>
            <Text style={styles.costValue}>$ {formatPrice(product.costo_unitario)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  productIconContainer: {
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  descriptionText: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 8,
  },
  moreOptionsButton: {
    padding: 2,
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  unitContainer: {
    marginRight: 10,
  },
  unitText: {
    fontSize: 12,
    color: "#6b7280",
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
  productDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#4b5563",
  },
  costContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  costLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  costValue: {
    fontSize: 12,
    color: "#4b5563",
    fontWeight: "500",
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

export default ProductCard;