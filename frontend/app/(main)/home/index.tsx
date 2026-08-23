import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SummaryDay from "../../../components/SummaryDay";
import BalancePoint from "../../../components/BalancePoint";
import LayoutMain from "../../../components/LayoutHome";
import useBusinessStore from "../../../hooks/useBusinessStore";
import ProductProfit from "../../../components/ProductProfit";
import UrgentActions from "../../../components/UrgentActions";

import PracticalAdviceCarousel from "../../../components/PracticalAdvice";
import api from "../../../api/apiConfig";

const { height } = Dimensions.get("screen");

interface SummaryDayData {
  total_egresos: string;
  total_ingresos: string;
  total_productos_vendidos: string;
}

interface ProductProfitData {
  estadisticas_generales: {
    ganancia_promedio_unitaria: number;
    ganancia_total_negocio: number;
    margen_promedio_porcentaje: number;
    total_productos: number;
    total_productos_vendidos: string;
  };
  periodo: {
    fecha_fin: string;
    fecha_inicio: string;
  };
  productos: Array<{
    cantidad_vendida: string;
    costo_unitario: number;
    ganancia_total: string;
    ganancia_unitaria: number;
    margen_ganancia_porcentaje: string;
    precio_unitario: number;
    producto_id: number;
    producto_nombre: string;
  }>;
  productos_mas_rentables: Array<{
    ganancia_total: string;
    nombre: string;
  }>;
  productos_menos_rentables: Array<{
    ganancia_total: string;
    nombre: string;
  }>;
}

interface BalancePointData {
  cantidad_vendida: string;
  ganancia_promedio_unitaria: string;
  margen_promedio_porcentaje: string;
  total_costos_fijos: string;
  total_vendido: string;
  unidades_punto_equilibrio: number;
  ventas_punto_equilibrio_pesos: string;
}

interface LoadedData {
  summaryDay: boolean;
  productProfit: boolean;
  balancePoint: boolean;
}

interface producto {
  cantidad_vendida: string;
  costo_unitario: number;
  ganancia_total: string;
  ganancia_unitaria: number;
  margen_ganancia_porcentaje: string;
  precio_unitario: number;
  producto_id: number;
  producto_nombre: string;
}

function home() {
  const { activeBusiness } = useBusinessStore();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [showData, setShowData] = useState(false);

  const [productProfitData, setProductProfitData] =
    useState<ProductProfitData | null>(null);
  const [balancePointData, setBalancePointData] =
    useState<BalancePointData | null>(null);
  const [summaryData, setSummaryData] = useState({
    totalIngresos: "0",
    totalEgresos: "0",
    totalProductosVendidos: "0",
    balance: "0",
    utilidad: "0",
  });

  const [loadedData, setLoadedData] = useState<LoadedData>({
    summaryDay: false,
    productProfit: false,
    balancePoint: false,
  });
  const [balancePointError, setBalancePointError] = useState<any>(null);


  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getCurrentYearMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    return { year, month };
  };

  const calculateFinancials = (ingresos: any, egresos: any) => {
    const ingresosNum = parseFloat(ingresos) || 0;
    const egresosNum = parseFloat(egresos) || 0;
    const balance = ingresosNum - egresosNum;
    const utilidad = balance > 0 ? balance * 0.2 : 0;
    return { balance: balance.toFixed(2), utilidad: utilidad.toFixed(2) };
  };

  const updateLoadedData = (key: keyof LoadedData, value: boolean) => {
    setLoadedData((prev) => {
      const newStates = { ...prev, [key]: value };

      if (
        newStates.summaryDay &&
        newStates.productProfit &&
        newStates.balancePoint
      ) {
        setShowData(true);
      }

      return newStates;
    });
  };

  const productsWarning: producto[] = productProfitData
    ? productProfitData.productos.filter((item) => item.ganancia_unitaria < 0)
    : [];

  console.log("productsWarning", productsWarning);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const fetchSummaryDay = async () => {
    try {
      const currentDate = getCurrentDate();

      const response = await api.get(
        `/financial-analysis/summaryDay/${activeBusiness?.id}?fecha=${currentDate}`
      );

      const data: SummaryDayData = response.data;

      const { balance, utilidad } = calculateFinancials(
        data.total_ingresos,
        data.total_egresos
      );

      setSummaryData({
        totalIngresos: data.total_ingresos,
        totalEgresos: data.total_egresos,
        totalProductosVendidos: data.total_productos_vendidos,
        balance: balance,
        utilidad: utilidad,
      });

      updateLoadedData("summaryDay", true);
    } catch (error) {
      console.error("Error fetching summary data:", error);
      setSummaryData({
        totalIngresos: "0",
        totalEgresos: "0",
        totalProductosVendidos: "0",
        balance: "0",
        utilidad: "0",
      });
      updateLoadedData("summaryDay", true);
    }
  };

  const fetchProductProfit = async () => {
    try {
      const response = await api.get(
        `/financial-analysis/productprofit/${activeBusiness?.id}`
      );

      const data: ProductProfitData = response.data;

      console.log("resumen de los productos", response.data.productos);

      setProductProfitData(data);
      updateLoadedData("productProfit", true);
    } catch (error) {
      console.error("Error fetching product profit data:", error);
      setProductProfitData(null);
      updateLoadedData("productProfit", true);
    }
  };

  const fetchBalancePoint = async () => {
    try {
      const { year, month } = getCurrentYearMonth();
      const response = await api.get(
        `/financial-analysis/balancepoint/${activeBusiness?.id}?año=${year}&mes=${month}`
      );
      console.log("data response", response);
      console.log("data response data", response.data.data[0]);

      setBalancePointData(response.data.data[0]);
      setBalancePointError(null);
      updateLoadedData("balancePoint", true);
    } catch (error: any) {
      setBalancePointData(null);
      setBalancePointError(error);
      updateLoadedData("balancePoint", true);
    }
  };

  const handleConfigureFixedCosts = () => {
    console.log("Navegando a configuración de costos fijos...");
  };

  const handleRefreshBalancePoint = async () => {
    console.log("Refrescando datos del balance point...");

    // Reiniciar el estado de loading para balance point
    setLoadedData((prev) => ({ ...prev, balancePoint: false }));
    setShowData(false);

    // Ejecutar de nuevo la petición del balance point
    await fetchBalancePoint();
  };

  useEffect(() => {
    if (activeBusiness?.id) {
      console.log("Iniciando peticiones para business ID:", activeBusiness.id);

      setShowData(false);
      setBalancePointError(null);
      setLoadedData({
        summaryDay: false,
        productProfit: false,
        balancePoint: false,
      });

      Promise.all([
        fetchSummaryDay(),
        fetchProductProfit(),
        fetchBalancePoint(),
      ])
        .then(() => {
          console.log("Todas las peticiones completadas");
        })
        .catch((error) => {
          console.error("Error en una o más peticiones:", error);
        });
    }
  }, [activeBusiness?.id]);



  require("../../../assets/Group 475.png")

  return (
    <LayoutMain>
      <View style={styles.headerHome}>
        <Text style={styles.titleHeader}>Panel Inicial</Text>
        <View style={{ paddingRight: 5 }}>
          <Image
            source={require("../../../assets/Group 475.png")}
            style={{
              width: 120,
              height: 46,
              marginTop: -9,
            }}
          />
        </View>
      </View>
      <ScrollView style={styles.containerMainHome} scrollEnabled={!isModalOpen}>
        <View style={styles.containerSubTitle}>
          <Text style={styles.subTitleText}>Balance total de hoy</Text>
        </View>
        <SummaryDay data={summaryData} loading={!showData} />

        <View style={styles.containerSubTitle}>
          <Text style={styles.subTitleText}>Punto de Equilibrio Mensual</Text>
        </View>
        <BalancePoint
          data={balancePointData}
          loading={!showData}
          error={balancePointError}
          onConfigureFixedCosts={handleConfigureFixedCosts}
          onRefreshData={handleRefreshBalancePoint}
        />

        <View style={styles.containerSubTitle}>
          <Text style={styles.subTitleText}>Ganancia por Producto</Text>
        </View>
        <ProductProfit data={productProfitData} loading={!showData} />

        <PracticalAdviceCarousel />
        {showData &&
          productsWarning.map((item, index) => (
            <UrgentActions data={item} key={index} />
          ))}
      </ScrollView>

     
    </LayoutMain>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1500,
  },
  overlayTouchable: {
    flex: 1,
  },
  box: {
    position: "absolute",
    width: "100%",
    borderRadius: 20,
    backgroundColor: "white",
    zIndex: 2000,
  },
  modalContent: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2001,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#16a34a",
    textAlign: "center",
  },
  modalBody: {
    flex: 1,
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
    lineHeight: 24,
  },
  subTitleText: {
    fontSize: 20,
    color: "#16a34a",
    fontWeight: 600,
  },
  subTitleLine2: {
    height: 2,
    width: 247,
    backgroundColor: "#16a34a",
  },
  subTitleLine: {
    height: 2,
    width: 180,
    backgroundColor: "#16a34a",
  },
  containerSubTitle: {
    marginBottom: 20,
  },
  containerSubTitle2: {
    marginBottom: 20,
    alignItems: "flex-end",
  },
  dropdownContainer: {
    backgroundColor: "white",
    position: "relative",
  },
  dropdown: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    backgroundColor: "white",
  },
  placeholderStyle: {
    fontSize: 16,
    color: "#999",
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "#333",
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  icon: {
    marginRight: 10,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: -8,
    zIndex: 999,
    paddingHorizontal: 4,
    fontSize: 12,
  },
  containerMainHome: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  containerTitleSection: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  titleSection: {
    fontWeight: "700",
    fontSize: 25,
  },
  titleHeader: {
    color: "black",
    fontSize: 24,
    fontWeight: "700",
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
  containerHome: {
    flex: 1,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default home;
