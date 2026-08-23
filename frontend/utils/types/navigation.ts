// types/navigation.ts
import { StackNavigationProp } from "@react-navigation/stack";

// Define las rutas sin parámetros
export type RootStackParamList = {
  // Rutas del grupo (main)
  "/(main)/home/index": undefined;
  "/(main)/settings/index": undefined;
  "/(main)/diarybook/index": undefined;
  "/(main)/variables/index": undefined;
  
  // Rutas del grupo (auth)
  "/(auth)/login": undefined;
  "/(auth)/register": undefined;
};

// Tipo para la navegación
export type AppStackNavigationProp<T extends keyof RootStackParamList> = 
  StackNavigationProp<RootStackParamList, T>;