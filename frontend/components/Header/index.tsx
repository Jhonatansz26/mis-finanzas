import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const Header = ({ title = "Mi Negocio", showIcon = true }) => {
  return (
    <View style={styles.headerHome}>
      <Text style={styles.titleHeader}>{title}</Text>
      {showIcon && (
        <View style={styles.containerIconHeader}>
          <FontAwesome
            name="exchange"
            size={16}
            color="black"
            style={styles.iconHeader}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  containerIconHeader: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    height: 40,
    width: 40,
  },
  iconHeader: {
    color: "white",
  },
  titleHeader: {
    color: "white",
    fontSize: 24,
    fontWeight: 600,
  },
  headerHome: {
    height: 65,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 29,
    backgroundColor: "#16a34a",
    borderRadius: 5,
  },
});

export default Header;