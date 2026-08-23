import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import { AntDesign, Feather } from "@expo/vector-icons";
import api from "../../api/apiConfig";
import useBusinessStore from "../../hooks/useBusinessStore";
import TransactionCard from "../TransactionIncomeCard";
import { useRouter } from "expo-router";
import {
  Transaction,
  TransactionWithDetails,
} from "../../utils/types/transaction";
import Product from "../../utils/types/Products";
import {
  formatDateForMySQL,
  formatPriceToColombianPrice,
} from "../../utils/formatFunctions";
import IncomeModal from "../IncomeModal";

type RespuestaAPI = Product[];

type CartItem = Product & {
  cantidad: number;
};

function IncomeComponent({ fecha, sucursal }: any) {
  const getTodayInColombia = () => {
    const now = new Date();
    const colombiaTime = new Date(now.getTime() - 5 * 60 * 60 * 1000);
    return colombiaTime;
  };

  const today = getTodayInColombia();
  const router = useRouter();

  const getTodayFormatted = () => {
    const options: any = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return today.toLocaleDateString("es-ES", options);
  };

  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<RespuestaAPI>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [showProductPicker, setShowProductPicker] = useState<boolean>(false);
  const [showCart, setShowCart] = useState<boolean>(false);
  const { activeBusiness } = useBusinessStore();
  const [todayTransactions, setTodayTransactions] = useState<
    TransactionWithDetails[]
  >([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          `products/business/${activeBusiness?.id}`
        );
        setProducts(response.data);
      } catch (error: any) {
        console.error("Error al obtener productos:", error.message);
        Alert.alert("Error", "No se pudieron cargar los productos");
      } finally {
        setLoading(false);
      }
    };

    const fetchTodayTrasactions = async () => {
      try {
        const response = await api.get(
          `transactions/dailytransaction/${activeBusiness?.id}?fecha=${
            today.toISOString().split("T")[0]
          }&tipo=ingreso`
        );
        console.log("Datosssssssssssssss =>", response);

        setTodayTransactions(response.data);
      } catch (error: any) {
        console.error("Error al obtener productos:", error.message);
        Alert.alert("Error", "No se pudieron cargar los productos");
      } finally {
      }
    };

    fetchProducts();
    fetchTodayTrasactions();
  }, [activeBusiness]);

  const handleAddToCart = () => {
    if (!selectedProduct) {
      Alert.alert("Error", "Por favor seleccione un producto");
      return;
    }

    if (cantidad <= 0) {
      Alert.alert("Error", "La cantidad debe ser mayor a 0");
      return;
    }

    const existingItemIndex = cart.findIndex(
      (item) => item.id === selectedProduct.id
    );

    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].cantidad += cantidad;
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...selectedProduct, cantidad }]);
    }

    setSelectedProduct(null);
    setCantidad(1);
    setShowProductPicker(false);
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const handleUpdateCantidad = (productId: number, newCantidad: number) => {
    if (newCantidad < 1) return;

    const updatedCart = cart.map((item) =>
      item.id === productId ? { ...item, cantidad: newCantidad } : item
    );

    setCart(updatedCart);
  };

  const calculateTotal = () => {
    const total = cart.reduce(
      (sum, item) => sum + parseFloat(item.precio_unitario) * item.cantidad,
      0
    );

    return formatPriceToColombianPrice(total);
  };

  const calculateTotalToday = () => {
    const total = todayTransactions.reduce(
      (sum: any, item: any) => sum + parseFloat(item.monto_total),
      0
    );

    return formatPriceToColombianPrice(total);
  };

  const getNumericTotal = () => {
    return cart.reduce(
      (sum, item) => sum + parseFloat(item.precio_unitario) * item.cantidad,
      0
    );
  };

  const handleSaveTransaction = async () => {
    if (cart.length === 0) {
      Alert.alert(
        "Error",
        "Agregue al menos un producto para guardar la transacción"
      );
      return;
    }

    const detalles = cart.map((item) => ({
      producto_id: item.id,
      cantidad: item.cantidad,
    }));

    const dataTransaction = {
      punto_venta_id: parseInt(sucursal),
      tipo: "ingreso",
      fecha: formatDateForMySQL(fecha),
      monto_total: getNumericTotal(),
      detalles: detalles,
    };

    console.log("Enviando transacción:", dataTransaction);

    try {
      setLoading(true);

      const response = await api.post("transactions", dataTransaction);

      console.log("Respuesta de la API:", response.data);

      const todayFormatted = today.toISOString().split("T")[0];
      const transactionDateFormatted = formatDateForMySQL(fecha).split(" ")[0];
      console.log("todayFormatted =>", todayFormatted);
      console.log("transactionDateFormatted =>", transactionDateFormatted);

      const isToday = todayFormatted === transactionDateFormatted;

      console.log("Comparando fechas:");
      console.log("Hoy:", todayFormatted);
      console.log("Fecha transacción:", transactionDateFormatted);
      console.log("Es hoy?:", isToday);

      if (isToday) {
        const newTransaction = {
          ...response.data,
          detalles: cart.map((item) => ({
            id: Date.now() + item.id,
            nombre: item.nombre,
            cantidad: item.cantidad.toString(),
            precio_unitario: item.precio_unitario,
            producto_id: item.id,
            subtotal: (
              parseFloat(item.precio_unitario) * item.cantidad
            ).toString(),
          })),
        };
        setTodayTransactions((prevTransactions) => [
          newTransaction,
          ...prevTransactions,
        ]);
        console.log("✅ Transacción agregada al estado todayTransactions");
      } else {
        console.log("❌ Transacción NO agregada al estado - no es de hoy");
      }

      Alert.alert(
        "Transacción Guardada",
        `Se han guardado ${
          cart.length
        } productos por un total de ${calculateTotal()}`
      );

      setCart([]);
    } catch (error: any) {
      console.error("Error al guardar la transacción:", error);

      const errorMessage =
        error.response?.data?.message ||
        "No se pudo guardar la transacción. Intente nuevamente.";

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const hasProductsInCart = cart.length > 0;
  const hasProducts = products.length > 0;

  const [showTransactionModal, setShowTransactionModal] =
    useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionWithDetails | null>(null);

  const handleTransactionPress = (transaction: TransactionWithDetails) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleTransactionDeleted = () => {
    if (!selectedTransaction) return;

    setTodayTransactions((prevTransactions) =>
      prevTransactions.filter(
        (transaction) => transaction.id !== selectedTransaction.id
      )
    );

    setSelectedTransaction(null);
    setShowTransactionModal(false);
  };

  const modalData = selectedTransaction
    ? {
        id: selectedTransaction.id,
        fecha: selectedTransaction.fecha,
        monto_total: selectedTransaction.monto_total,
        detalles: selectedTransaction.detalles,
      }
    : null;

  const renderNoProductsMessage = () => {
    return (
      <View style={styles.noProductsContainer}>
        <AntDesign name="inbox" size={60} color="#ddd" />
        <Text style={styles.noProductsText}>No hay productos disponibles</Text>
        <Text style={styles.noProductsSubText}>
          Debe crear productos en la sección configuraciones
        </Text>

        <TouchableOpacity
          style={styles.arrowContainer}
          onPress={() => router.push("/settings/products/new")}
        >
          <Text style={styles.arrowText}>Ir a configuraciones</Text>
          <Feather name="arrow-right" size={24} color="#16a34a" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderNoTransactionsMessage = () => {
    return (
      <View style={styles.noTransactionsContainer}>
        <View style={styles.iconContainerMoney}>
          <Feather name="dollar-sign" size={40} color="rgba(34,197,94,1)" />
        </View>
        <Text style={styles.noTransactionsTextTitle}>
          No hay ingresos registrados
        </Text>
        <Text style={styles.noTransactionsTextSubtitle}>
          No has registrado ningún ingreso para el día de hoy. ¡Comienza
          agregando tu primera venta!
        </Text>
        <Text style={styles.noTransactionsTextSubtitleDate}>
          <Feather name="calendar" size={16} color="rgba(209,213,219,1)" />
          {` ${getTodayFormatted()}`}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#16a34a" style={styles.loader} />
      ) : !hasProducts ? (
        renderNoProductsMessage()
      ) : (
        <>
          <Text style={styles.sectionTitle}>Seleccione Productos Vendidos</Text>

          {/* Selectores de producto y carrito */}
          <View style={styles.selectors}>
            {/* Selector de producto */}
            <TouchableOpacity
              style={[styles.selector, styles.productSelector]}
              onPress={() => setShowProductPicker(true)}
            >
              <Feather name="box" size={18} color="#16a34a" />
              <Text
                style={styles.selectorText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {selectedProduct
                  ? selectedProduct.nombre
                  : "Seleccionar producto"}
              </Text>
              <AntDesign name="down" size={14} color="#999" />
            </TouchableOpacity>

            {/* Selector de carrito */}
            <TouchableOpacity
              style={[
                styles.selector,
                styles.cartSelector,
                hasProductsInCart && styles.cartSelectorActive,
              ]}
              onPress={() => setShowCart(true)}
            >
              <AntDesign
                name="shopping-cart"
                size={18}
                color={hasProductsInCart ? "#16a34a" : "#666"}
              />
              <Text
                style={[
                  styles.selectorText,
                  hasProductsInCart && styles.cartSelectorTextActive,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {hasProductsInCart
                  ? `${cart.length} productos`
                  : "Carrito vacío"}
              </Text>
              {hasProductsInCart && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cart.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {!hasProductsInCart && !selectedProduct && (
            <View style={styles.selectors}>
              {/* Selector de producto */}
              <TouchableOpacity
                style={[styles.selectorAdd]}
                onPress={() => router.replace("/settings/products/new")}
              >
                <AntDesign name="plus" size={18} color="#16a34a" />
                <Text
                  style={styles.selectorText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Añadir Producto
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Panel de información del producto seleccionado */}
          {selectedProduct && (
            <View style={styles.productPanel}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{selectedProduct.nombre}</Text>
                <Text style={styles.productPrice}>
                  {formatPriceToColombianPrice(selectedProduct.precio_unitario)}
                </Text>
              </View>

              <View style={styles.cantidadControls}>
                <Text style={styles.cantidadLabel}>Cantidad:</Text>
                <View style={styles.cantidadSelector}>
                  <TouchableOpacity
                    style={styles.cantidadButton}
                    onPress={() => setCantidad(Math.max(1, cantidad - 1))}
                  >
                    <Text style={styles.cantidadButtonText}>-</Text>
                  </TouchableOpacity>

                  <Text style={styles.cantidadValue}>{cantidad}</Text>

                  <TouchableOpacity
                    style={styles.cantidadButton}
                    onPress={() => setCantidad(cantidad + 1)}
                  >
                    <Text style={styles.cantidadButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={handleAddToCart}
              >
                <AntDesign name="shopping-cart" size={18} color="white" />
                <Text style={styles.addToCartButtonText}>
                  Agregar al carrito
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Resumen del carrito (mini versión) */}
          {!selectedProduct && hasProductsInCart && (
            <View style={styles.cartSummary}>
              <Text style={styles.cartSummaryTitle}>
                Resumen del carrito ({cart.length}{" "}
                {cart.length === 1 ? "producto" : "productos"})
              </Text>

              {/* Mostramos hasta 6 productos en el resumen */}
              {cart.slice(0, 6).map((item) => (
                <View key={item.id} style={styles.cartSummaryItem}>
                  <Text style={styles.cartSummaryItemName} numberOfLines={1}>
                    {item.nombre}
                  </Text>
                  <Text style={styles.cartSummaryItemCantidad}>
                    {item.cantidad}x{" "}
                    {formatPriceToColombianPrice(item.precio_unitario)}
                  </Text>
                </View>
              ))}

              {/* Botón "Ver más" solo si hay más de 6 productos */}
              {cart.length > 6 && (
                <TouchableOpacity
                  style={styles.viewMoreButton}
                  onPress={() => setShowCart(true)}
                >
                  <Text style={styles.viewMoreButtonText}>
                    Ver {cart.length - 6} más...
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Botón de guardar transacción */}
          {hasProductsInCart && (
            <TouchableOpacity
              style={[
                styles.saveButton,
                !hasProductsInCart && styles.disabledButton,
              ]}
              onPress={handleSaveTransaction}
              disabled={!hasProductsInCart}
            >
              <Text style={styles.saveButtonText}>Guardar Transacción</Text>
            </TouchableOpacity>
          )}

          {/* Total de transaccion */}
          {hasProductsInCart && (
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Monto total:</Text>
              <Text style={styles.totalAmount}>{calculateTotal()}</Text>
            </View>
          )}

          {/* Sección de transacciones recientes */}
          {!hasProductsInCart && !selectedProduct && (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContentContainer}
            >
              <Text style={styles.titleTransactions}>Ingresos de Hoy</Text>

              {todayTransactions.length === 0 ? (
                renderNoTransactionsMessage()
              ) : (
                <View>
                  {todayTransactions.map(
                    (transaction: TransactionWithDetails, index: any) => (
                      <TransactionCard
                        transactionData={transaction}
                        key={index}
                        onPress={handleTransactionPress}
                      />
                    )
                  )}
                </View>
              )}
            </ScrollView>
          )}

          {/* ✅ UN solo modal compartido para transacciones */}
          {modalData && (
            <IncomeModal
              isModalVisible={showTransactionModal}
              setIsModalVisible={setShowTransactionModal}
              transactionData={modalData}
              onTransactionDeleted={handleTransactionDeleted}
            />
          )}

          {/* Modal de selección de producto */}
          <Modal
            visible={showProductPicker}
            transparent={true}
            animationType="fade"
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setShowProductPicker(false)}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Seleccionar producto</Text>
                  <TouchableOpacity onPress={() => setShowProductPicker(false)}>
                    <AntDesign name="close" size={20} color="#333" />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={products}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.productOption}
                      onPress={() => {
                        setSelectedProduct(item);
                        setShowProductPicker(false);
                      }}
                    >
                      <View style={styles.productOptionInfo}>
                        <Text style={styles.productOptionName}>
                          {item.nombre}
                        </Text>
                        <Text style={styles.productOptionPrice}>
                          {formatPriceToColombianPrice(item.precio_unitario)}
                        </Text>
                      </View>
                      {selectedProduct?.id === item.id && (
                        <AntDesign name="check" size={18} color="#16a34a" />
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            </Pressable>
          </Modal>

          {/* Modal del carrito */}
          <Modal visible={showCart} transparent={true} animationType="slide">
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setShowCart(false)}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Productos en carrito</Text>
                  <TouchableOpacity onPress={() => setShowCart(false)}>
                    <AntDesign name="close" size={20} color="#333" />
                  </TouchableOpacity>
                </View>

                {cart.length === 0 ? (
                  <View style={styles.emptyCartMessage}>
                    <AntDesign
                      name="shopping-cart"
                      size={18}
                      color={hasProductsInCart ? "#16a34a" : "#666"}
                    />
                    <Text style={styles.emptyCartText}>
                      No hay productos en el carrito
                    </Text>
                  </View>
                ) : (
                  <>
                    <FlatList
                      data={cart}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={({ item }) => (
                        <View style={styles.cartItem}>
                          <View style={styles.cartItemDetails}>
                            <Text style={styles.cartItemName}>
                              {item.nombre}
                            </Text>
                            <Text style={styles.cartItemPrice}>
                              {formatPriceToColombianPrice(
                                item.precio_unitario
                              )}
                            </Text>
                          </View>

                          <View style={styles.cartItemActions}>
                            <View style={styles.cartItemCantidad}>
                              <TouchableOpacity
                                style={styles.cantidadSmallButton}
                                onPress={() =>
                                  handleUpdateCantidad(
                                    item.id,
                                    item.cantidad - 1
                                  )
                                }
                              >
                                <Text style={styles.cantidadButtonText}>-</Text>
                              </TouchableOpacity>

                              <Text style={styles.cartItemCantidadText}>
                                {item.cantidad}
                              </Text>

                              <TouchableOpacity
                                style={styles.cantidadSmallButton}
                                onPress={() =>
                                  handleUpdateCantidad(
                                    item.id,
                                    item.cantidad + 1
                                  )
                                }
                              >
                                <Text style={styles.cantidadButtonText}>+</Text>
                              </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                              style={styles.removeItemButton}
                              onPress={() => handleRemoveFromCart(item.id)}
                            >
                              <AntDesign
                                name="delete"
                                size={18}
                                color="#ff4d4f"
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    />

                    <View style={styles.cartFooter}>
                      <View style={styles.cartTotal}>
                        <Text style={styles.cartTotalLabel}>Total:</Text>
                        <Text style={styles.cartTotalAmount}>
                          {calculateTotal()}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.closeCartButton}
                        onPress={() => setShowCart(false)}
                      >
                        <Text style={styles.closeCartButtonText}>
                          Seguir comprando
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </Pressable>
          </Modal>

          {/* Total de Hoy - Siempre visible en la parte inferior */}
          <View style={styles.totalContainerFixed}>
            <Text style={styles.totalLabel}>Total de Hoy:</Text>
            <Text style={styles.totalAmount}>{calculateTotalToday()}</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  titleTransactions: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  transactionCard: {
    height: 40,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "rgba(187,247,208,1)",
    borderRadius: 5,
  },
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 60,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#16a34a",
    marginBottom: 16,
    textAlign: "center",
  },
  // Estado sin productos
  noProductsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noProductsText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
  },
  noProductsSubText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  arrowContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f7f0",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  arrowText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#16a34a",
    marginRight: 8,
  },
  // Estado sin transacciones
  iconContainerMoney: {
    backgroundColor: "rgba(220,252,231,1)",
    height: 70,
    width: 70,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 35,
  },
  noTransactionsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 12,
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "rgba(209,213,219,1)",
  },
  noTransactionsTextTitle: {
    marginTop: 12,
    fontSize: 16,
    color: "black",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 10,
  },
  noTransactionsTextSubtitle: {
    color: "#999",
    textAlign: "center",
    marginBottom: 25,
  },
  noTransactionsTextSubtitleDate: {
    color: "rgba(156, 163, 175,1)",
  },
  // Selectores
  selectors: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },
  selector: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectorAdd: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  productSelector: {
    flex: 1.5,
  },
  cartSelector: {
    flex: 1,
  },
  cartSelectorActive: {
    borderColor: "#16a34a",
    backgroundColor: "#e6f7f0",
  },
  selectorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  cartSelectorTextActive: {
    color: "#16a34a",
    fontWeight: "500",
  },
  cartBadge: {
    backgroundColor: "#16a34a",
    borderRadius: 12,
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  // Panel de producto seleccionado
  productPanel: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  productInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#16a34a",
  },
  cantidadControls: {
    marginBottom: 16,
  },
  cantidadLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  cantidadSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  cantidadButton: {
    backgroundColor: "#16a34a",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  cantidadButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  cantidadValue: {
    width: 50,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "500",
  },
  addToCartButton: {
    backgroundColor: "#16a34a",
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  addToCartButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  // Resumen del carrito
  cartSummary: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  cartSummaryTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  cartSummaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cartSummaryItemName: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  cartSummaryItemCantidad: {
    fontSize: 14,
    color: "#666",
  },
  viewMoreButton: {
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
  },
  viewMoreButtonText: {
    color: "#16a34a",
    fontSize: 14,
  },
  // Botón de guardar y total
  saveButton: {
    backgroundColor: "#16a34a",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: "#a0d8b8",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  totalContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  // Total fijo en la parte inferior
  totalContainerFixed: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#16a34a",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#16a34a",
  },
  // Modales
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  // Opciones de productos en modal
  productOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  productOptionInfo: {
    flex: 1,
  },
  productOptionName: {
    fontSize: 16,
    color: "#333",
  },
  productOptionPrice: {
    fontSize: 14,
    color: "#16a34a",
    marginTop: 4,
  },
  // Modal del carrito
  emptyCartMessage: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyCartText: {
    marginTop: 12,
    fontSize: 16,
    color: "#999",
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    color: "#333",
  },
  cartItemPrice: {
    fontSize: 14,
    color: "#16a34a",
    marginTop: 4,
  },
  cartItemActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  cartItemCantidad: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  cartItemCantidadText: {
    width: 30,
    textAlign: "center",
    fontSize: 16,
  },
  cantidadSmallButton: {
    backgroundColor: "#e6f7f0",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  removeItemButton: {
    padding: 6,
  },
  cartFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  cartTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cartTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  cartTotalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#16a34a",
  },
  closeCartButton: {
    backgroundColor: "#16a34a",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  closeCartButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
export default IncomeComponent;
