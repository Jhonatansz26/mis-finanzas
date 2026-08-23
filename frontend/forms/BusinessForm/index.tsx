import React, { useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BusinessInfoStep } from "./BusinessInfoStep";
import { SalesPointsStep } from "./SalesPointsStep";
import { ReviewStep } from "./ReviewStep";
import api from "../../api/apiConfig";
import { ResultModal } from "../../components/ResultModal";
import useBusinessStore from "../../hooks/useBusinessStore";

export interface BusinessData {
  nombre: string;
  nit?: string;
  direccion: string;
  telefono: string;
  email: string;
  departamento: string;
  municipio: string;
}

export interface SalesPoint {
  id: string;
  nombre: string;
  ubicacion: string;
  responsable?: string;
  telefono?: string;
  departamento: string;
  municipio: string;
  nota?: string;
}

const steps = [
  { number: 1, title: "Información del Negocio" },
  { number: 2, title: "Puntos de Venta" },
  { number: 3, title: "Revisión" },
];

function BusinessForm() {
  const router = useRouter();
  const { fetchBusinesses } = useBusinessStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [businessData, setBusinessData] = useState<BusinessData>({
    nombre: "",
    nit: "",
    direccion: "",
    telefono: "",
    email: "",
    departamento: "",
    municipio: "",
  });
  const [salesPoints, setSalesPoints] = useState<SalesPoint[]>([]);
  
  // Estados para el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const handleBusinessNext = (data: BusinessData) => {
    setBusinessData(data);
    setCurrentStep(2);
  };

  const handleSalesPointsNext = (points: SalesPoint[]) => {
    setSalesPoints(points);
    setCurrentStep(3);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    try {
      // Validar que departamento y municipio no estén vacíos
      if (!businessData.departamento || businessData.departamento === "") {
        setModalType("error");
        setModalTitle("Error de Validación");
        setModalMessage("Debe seleccionar un departamento válido");
        setModalVisible(true);
        return;
      }

      if (!businessData.municipio || businessData.municipio === "") {
        setModalType("error");
        setModalTitle("Error de Validación");
        setModalMessage("Debe seleccionar un municipio válido");
        setModalVisible(true);
        return;
      }

      // Validar puntos de venta
      if (salesPoints.length === 0) {
        setModalType("error");
        setModalTitle("Error de Validación");
        setModalMessage("Debe agregar al menos un punto de venta");
        setModalVisible(true);
        return;
      }

      for (let i = 0; i < salesPoints.length; i++) {
        const point = salesPoints[i];
        if (!point.nombre || !point.ubicacion || !point.departamento || !point.municipio) {
          setModalType("error");
          setModalTitle("Error de Validación");
          setModalMessage(`El punto de venta ${i + 1} tiene campos obligatorios vacíos`);
          setModalVisible(true);
          return;
        }
      }

      // Preparar los datos para enviar
      const dataToSend = {
        nombre: businessData.nombre,
        nit: businessData.nit || null,
        direccion: businessData.direccion,
        telefono: businessData.telefono,
        email: businessData.email,
        departamento: businessData.departamento,
        municipio: businessData.municipio,
        puntosVenta: salesPoints.map((point) => ({
          nombre: point.nombre,
          ubicacion: point.ubicacion,
          responsable: point.responsable || null,
          telefono: point.telefono || null,
          departamento: point.departamento,
          municipio: point.municipio,
          nota: point.nota || null,
        })),
      };

      console.log("Enviando datos:", dataToSend);

      // Hacer la petición al backend
      const response = await api.post("/business/with-points", dataToSend);

      console.log("Respuesta del servidor:", response.data);

      // Mostrar modal de éxito
      setModalType("success");
      setModalTitle("¡Registro Exitoso!");
      setModalMessage(
        `El negocio "${response.data.business.nombre}" ha sido registrado correctamente con ${response.data.totalPuntosCreados} punto(s) de venta.`
      );
      setModalVisible(true);
    } catch (error: any) {
      console.error("Error al registrar negocio:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error desconocido al registrar el negocio";

      // Mostrar modal de error
      setModalType("error");
      setModalTitle("Error al Registrar");
      setModalMessage(errorMessage);
      setModalVisible(true);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleSuccess = async () => {
    setModalVisible(false);
    // Recargar negocios antes de redirigir
    await fetchBusinesses();
    router.push("/(main)/home");
  };

  const getCircleStyle = (stepNumber: number) => {
    if (currentStep > stepNumber) {
      return styles.circleCompleted;
    } else if (currentStep === stepNumber) {
      return styles.circleCurrent;
    } else {
      return styles.circleInactive;
    }
  };

  const getTextStyle = (stepNumber: number) => {
    return currentStep >= stepNumber ? styles.textActive : styles.textInactive;
  };

  const getLineStyle = (stepNumber: number) => {
    return currentStep > stepNumber
      ? styles.lineCompleted
      : styles.lineInactive;
  };

  return (
    <View style={styles.container}>
      <View style={styles.stepsView}>
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <View style={styles.stepColumn}>
              <View style={[styles.circleNumber, getCircleStyle(step.number)]}>
                {currentStep > step.number ? (
                  <Feather name="check" size={20} color="#fff" />
                ) : (
                  <Text style={styles.circleText}>{step.number}</Text>
                )}
              </View>
              <Text style={[styles.stepTitle, getTextStyle(step.number)]}>
                {step.title}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View style={[styles.line, getLineStyle(step.number)]} />
            )}
          </React.Fragment>
        ))}
      </View>
      <View style={{ flex: 1 }}>
        {currentStep === 1 && (
          <BusinessInfoStep
            initialData={businessData}
            onNext={handleBusinessNext}
          />
        )}
        {currentStep === 2 && (
          <SalesPointsStep
            initialPoints={salesPoints}
            onNext={handleSalesPointsNext}
            onBack={handleBack}
          />
        )}
        {currentStep === 3 && (
          <ReviewStep
            businessData={businessData}
            salesPoints={salesPoints}
            onBack={handleBack}
            onSubmit={handleSubmit}
          />
        )}
      </View>

      <ResultModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  stepsView: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  stepColumn: {
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    marginBottom: 20,
  },
  circleNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  circleCompleted: {
    backgroundColor: "#16a34a",
  },
  circleCurrent: {
    backgroundColor: "#16a34a",
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  circleInactive: {
    backgroundColor: "#e5e7eb",
  },
  circleText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  stepTitle: {
    fontSize: 10,
    marginTop: 8,
    textAlign: "center",
    maxWidth: 79,
  },
  textActive: {
    color: "#000",
    fontWeight: "500",
  },
  textInactive: {
    color: "#9ca3af",
  },
  line: {
    height: 2,
    flex: 1,
    alignSelf: "flex-start",
    marginTop: 19,
    marginHorizontal: 4,
  },
  lineCompleted: {
    backgroundColor: "#16a34a",
  },
  lineInactive: {
    backgroundColor: "#e5e7eb",
  },
});

export default BusinessForm;