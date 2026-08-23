import React, { useState } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";

// A prop to allow parent components to get the selected option
interface TooglePeriodProps {
  onSelectChange?: (selected: string) => void;
}

function TooglePeriod({ onSelectChange }: TooglePeriodProps) {
  const [selected, setSelected] = useState("Semana");

  const options = [
    { id: "today", label: "Hoy" },
    { id: "week", label: "Semana" },
    { id: "month", label: "Mes" },
  ];

  const handleToggle = (label: any) => {
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
            selected === option.label && styles.activeButton,
            pressed && styles.pressedButton,
          ]}
          onPress={() => handleToggle(option.label)}
        >
          <Text
            style={[
              styles.buttonText,
              selected === option.label && styles.activeText,
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
    height: 38,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    flexDirection: "row",
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
    marginVertical: 8,
  },
  toggleButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  activeButton: {
    backgroundColor: "#fff",
  },
  pressedButton: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#888",
  },
  activeText: {
    color: "#000",
    fontWeight: "600",
  },
});

export default TooglePeriod;
