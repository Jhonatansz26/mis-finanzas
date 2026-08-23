import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface ResultModalProps {
  visible: boolean;
  type: "success" | "error";
  title: string;
  message: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ResultModal({
  visible,
  type,
  title,
  message,
  onClose,
  onSuccess,
}: ResultModalProps) {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  const isSuccess = type === "success";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View
            style={[
              styles.iconContainer,
              isSuccess ? styles.successBg : styles.errorBg,
            ]}
          >
            <Feather
              name={isSuccess ? "check-circle" : "x-circle"}
              size={48}
              color="#fff"
            />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity
            style={[
              styles.button,
              isSuccess ? styles.successButton : styles.errorButton,
            ]}
            onPress={() => {
              if (isSuccess && onSuccess) {
                onSuccess();
              } else {
                onClose();
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {isSuccess ? "Continuar" : "Cerrar"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    maxWidth: 400,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successBg: {
    backgroundColor: "#16a34a",
  },
  errorBg: {
    backgroundColor: "#dc2626",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successButton: {
    backgroundColor: "#16a34a",
  },
  errorButton: {
    backgroundColor: "#dc2626",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});