import React from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  Entypo,
  EvilIcons,
  SimpleLineIcons,
  MaterialCommunityIcons,
  Feather
} from "@expo/vector-icons";
import { Switch, Menu, Divider } from "react-native-paper";
import { useRouter } from "expo-router";

// Definición de interfaces para tipado
interface LocationProps {
  id: number;
  name: string;
  address: string;
  isActive: boolean;
  responsable?: string;
  telefono?: string;
}

interface PointSaleCardProps {
  location: LocationProps;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function PointSaleCard({
  location,
  onToggle,
  onEdit,
  onDelete,
}: PointSaleCardProps) {
  const router = useRouter();

  const { name, address, isActive, responsable, telefono } = location;
  const [menuVisible, setMenuVisible] = React.useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleEdit = () => {
    closeMenu();
    if (onEdit) onEdit();
  };

  const handleDelete = () => {
    closeMenu();
    if (onDelete) onDelete();
  };

  return (
    <TouchableOpacity style={styles.cardPoint} onPress={handleEdit}>
      <View style={styles.cardLeftContent}>
        <View style={styles.locationInfo}>
          <Text style={[styles.locationName, !isActive && styles.inactiveText]}>
            {name}
          </Text>
          <View style={styles.addressContainer}>
            <EvilIcons
              name="location"
              size={16}
              color={isActive ? "#666" : "#aaa"}
            />
            <Text
              style={[
                styles.addressText,
                !isActive && styles.inactiveAddressText,
              ]}
            >
              {address}
            </Text>
          </View>
          
          {responsable && (
            <View style={styles.infoContainer}>
              <Feather
                name="user"
                size={12}
                color={isActive ? "#666" : "#aaa"}
              />
              <Text
                style={[
                  styles.infoText,
                  !isActive && styles.inactiveInfoText,
                ]}
              >
                {responsable}
              </Text>
            </View>
          )}
          
          {telefono && (
            <View style={styles.infoContainer}>
              <Feather
                name="phone"
                size={12}
                color={isActive ? "#666" : "#aaa"}
              />
              <Text
                style={[
                  styles.infoText,
                  !isActive && styles.inactiveInfoText,
                ]}
              >
                {telefono}
              </Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.cardRightContent}>
      
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardPoint: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    paddingLeft: 23,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardLeftContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  inactiveText: {
    color: "#aaa",
    fontWeight: "400",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
    flex: 1,
  },
  inactiveAddressText: {
    color: "#aaa",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
  },
  inactiveInfoText: {
    color: "#aaa",
  },
  cardRightContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusContainer: {
    alignItems: "center",
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    marginBottom: 4,
  },
  activeText: {
    color: "#16a34a",
  },
  inactiveStatusText: {
    color: "#aaa",
  },
  optionsButton: {
    padding: 5,
  },
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

export default PointSaleCard;