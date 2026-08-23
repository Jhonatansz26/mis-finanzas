import React, { useState } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import LayoutMain from "../../../components/LayoutHome";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import DiaryBook from "../../../components/DiaryBook";
import RecentTransactions from "../../../components/RecentTransactions";

function change() {
  const [isIconPressed, setIsIconPressed] = useState(true);

  const handleIconPress = () => {
    setIsIconPressed(!isIconPressed);
  };

  return (
    <LayoutMain>
      <View style={styles.headerHome}>
        <Text style={styles.titleHeader}>
          {isIconPressed ? "Libro diario" : "Historial de Transacciones"}
        </Text>
        <Pressable style={styles.containerIconHeader} onPress={handleIconPress}>
          {isIconPressed ? (
            <AntDesign
              name="book"
              size={20}
              color="black"
           
            />
          ) : (
            <MaterialIcons
              name="currency-exchange"
              size={20}
              color="black"
             
            />
          )}
        </Pressable>
      </View>
      {isIconPressed ? <DiaryBook /> : <RecentTransactions />}
    </LayoutMain>
  );
}

const styles = StyleSheet.create({
  containerIconHeader: {
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    height: 40,
    width: 40,
  },
 
  titleHeader: {
    color: "black",
    fontSize: 24,
    fontWeight: 700,
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
    borderBottomWidth:1,
    borderColor:'#ddd'
  },
});

export default change;
