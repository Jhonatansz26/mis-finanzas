import React, { useState } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";

interface ToggleTransactionProps {
  onSelectChange?: (selected: string) => void;
}

function ToggleTransaction({ onSelectChange }: ToggleTransactionProps) {
  const [selected, setSelected] = useState("Ingresos");
  
  const options = [
    { id: "income", label: "Ingresos" },
    { id: "expense", label: "Egresos" }
  ];
  
  const handleToggle = (label: string) => {
    setSelected(label);
    // Notify parent component of the change
    if (onSelectChange) {
      onSelectChange(label);
    }
  };
  
  return (
    <View style={styles.toggleContainer}>
      {options.map((option) => (
        <Pressable
          key={option.id}
          style={({ pressed }) => [
            styles.toggleButton,
            selected === option.label && 
              (option.label === "Ingresos" ? styles.activeIncomeButton : styles.activeExpenseButton),
            pressed && styles.pressedButton
          ]}
          onPress={() => handleToggle(option.label)}
        >
          <Text
            style={[
              styles.buttonText,
              selected === option.label && 
                (option.label === "Ingresos" ? styles.activeIncomeText : styles.activeExpenseText)
            ]}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  toggleContainer: {
    height: 60,
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 20,
    borderRadius: 10,
    flexDirection: "row",
    overflow: "hidden",
    backgroundColor:'white'
  },
  toggleButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white"
  },
  activeIncomeButton: {
    backgroundColor: "rgba(11, 216, 0, 0.20)"
  },
  activeExpenseButton: {
    backgroundColor: "#f7e6e6"
  },
  pressedButton: {
    opacity: 0.8
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333"
  },
  activeIncomeText: {
    color: "#16a34a"
  },
  activeExpenseText: {
    color: "#781b1b"
  }
});

export default ToggleTransaction;