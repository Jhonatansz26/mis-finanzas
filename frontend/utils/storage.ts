import { Platform } from "react-native";

export const storage = {
  getItemAsync: async (key: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    const SecureStore = require("expo-secure-store");
    return SecureStore.getItemAsync(key);
  },
  setItemAsync: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return;
    }
    const SecureStore = require("expo-secure-store");
    return SecureStore.setItemAsync(key, value);
  },
  deleteItemAsync: async (key: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
      return;
    }
    const SecureStore = require("expo-secure-store");
    return SecureStore.deleteItemAsync(key);
  },
};

export const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await storage.getItemAsync(name);
    } catch (error) {
      console.error("Error al recuperar del SecureStore:", error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await storage.setItemAsync(name, value);
    } catch (error) {
      console.error("Error al guardar en SecureStore:", error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await storage.deleteItemAsync(name);
    } catch (error) {
      console.error("Error al eliminar de SecureStore:", error);
    }
  },
};
