import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Dimensions,
} from "react-native";
import {
  Svg,
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../hooks/useAuthStore";
import useBusinessStore from "../../hooks/useBusinessStore";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

function Login() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();
  const { businesses, fetchBusinesses, isLoading: isLoadingBusiness } = useBusinessStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formState, setFormState] = useState("login");
  const [rememberMe, setRememberMe] = useState(false);

  // Animations
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const opacityAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const formTranslateY = useState(new Animated.Value(0))[0];
  const formOpacity = useState(new Animated.Value(1))[0];
  const successScale = useState(new Animated.Value(0))[0];
  const successOpacity = useState(new Animated.Value(0))[0];
  const loadingSpinValue = useState(new Animated.Value(0))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];
  const floatingAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Start floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Entry animations
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.1)),
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Por favor ingrese usuario y contraseña");
      startErrorAnimation();
      return;
    }

    setIsLoading(true);
    setError("");
    startLoadingAnimation();

    try {
      await login(username, password);

      console.log('✅ Login exitoso, cargando negocios...');
      await fetchBusinesses();

      Animated.parallel([
        Animated.timing(formTranslateY, {
          toValue: -30,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(formOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(successScale, {
          toValue: 1,
          delay: 400,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 600,
          delay: 400,
          useNativeDriver: true,
        }),
      ]).start();

      setFormState("success");

      // 4. Esperar a que termine la animación y luego redirigir
      setTimeout(() => {
        // Obtener el estado actualizado de businesses
        const currentBusinesses = useBusinessStore.getState().businesses;
        
        if (currentBusinesses.length === 0) {
          console.log('🏢 No hay negocios, redirigiendo a crear negocio');
          router.replace("/(main)/business-register");
        } else {
          console.log('🏠 Negocio encontrado, redirigiendo a home');
          router.replace("/(main)/home");
        }
      }, 2500);

    } catch (error: any) {
      let errorMessage = "";
      let debugInfo = "";

      const requestUrl = error.requestUrl || "URL no disponible";
      debugInfo = `\nURL: ${requestUrl}`;

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Usuario o contraseña incorrectos";
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = "Error de autenticación";
        }
        debugInfo += `\nStatus: ${error.response.status}`;
      } else if (error.request) {
        errorMessage =
          "No se pudo conectar con el servidor. Verifique su conexión.";
      } else {
        errorMessage = "Error al iniciar sesión. Intente nuevamente.";
      }

      console.error('Error completo de login:', {
        url: requestUrl,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
    
      if (__DEV__) {
        setError(`${errorMessage}${debugInfo}`);
      } else {
        setError(errorMessage);
      }

      startErrorAnimation();
    } finally {
      setIsLoading(false);
    }
  };

  const startLoadingAnimation = () => {
    Animated.loop(
      Animated.timing(loadingSpinValue, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const startErrorAnimation = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleForgotPassword = () => {
    setFormState("recover");
    setError("");
  };

  const handleRecoverSubmit = () => {
    if (username) {
      setIsLoading(true);
      startLoadingAnimation();

      setTimeout(() => {
        alert(
          "Se han enviado instrucciones de recuperación al correo registrado"
        );
        setFormState("login");
        setIsLoading(false);
      }, 1500);
    } else {
      setError("Por favor ingrese su nombre de usuario");
      startErrorAnimation();
    }
  };

  const handleBackToLogin = () => {
    setFormState("login");
    setError("");
  };

  const spin = loadingSpinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const floatingTransform = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 8],
  });

  const handleBackgroundPress = () => {
    if (Platform.OS !== "web") {
      Keyboard.dismiss();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={styles.containerHome}>
        <TouchableWithoutFeedback onPress={handleBackgroundPress}>
          <View style={styles.backgroundTouchable}>
            <LinearGradient
              colors={["#10b981", "#059669", "#047857"]}
              style={styles.backgroundGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            <View style={styles.backgroundDecoration}>
              <Animated.View
                style={[
                  styles.floatingCircle,
                  styles.circle1,
                  { transform: [{ translateY: floatingTransform }] },
                ]}
              />
              <Animated.View
                style={[
                  styles.floatingCircle,
                  styles.circle2,
                  { transform: [{ translateY: floatingTransform }] },
                ]}
              />
              <Animated.View
                style={[
                  styles.floatingCircle,
                  styles.circle3,
                  { transform: [{ translateY: floatingTransform }] },
                ]}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>

        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          style={styles.scrollViewAbsolute}
        >
            <Animated.View
              style={[
                styles.mainContainer,
                {
                  transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
                  opacity: opacityAnim,
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.logoContainer,
                  { transform: [{ translateY: floatingTransform }] },
                ]}
              >
                <View style={styles.logoBackground}>
                  <Image
                    source={require("../../assets/Group 475.png")}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
              </Animated.View>

              <Animated.View
                style={[
                  styles.card,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                {formState === "success" && (
                  <Animated.View
                    style={[
                      styles.successContainer,
                      {
                        transform: [{ scale: successScale }],
                        opacity: successOpacity,
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={["#d1fae5", "#a7f3d0"]}
                      style={styles.successIconContainer}
                    >
                      <Ionicons name="checkmark" size={50} color="#059669" />
                    </LinearGradient>
                    <Text style={styles.successTitle}>¡Bienvenido!</Text>
                    <Text style={styles.successText}>
                      Has iniciado sesión correctamente
                    </Text>
                    <View style={styles.progressBarContainer}>
                      <LinearGradient
                        colors={["#10b981", "#059669"]}
                        style={styles.progressBar}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      />
                    </View>
                    <Text style={styles.redirectingText}>
                      {isLoadingBusiness ? "Verificando tu negocio..." : "Redirigiendo..."}
                    </Text>
                  </Animated.View>
                )}

                <Animated.View
                  style={[
                    styles.formContainer,
                    {
                      transform: [{ translateY: formTranslateY }],
                      opacity: formOpacity,
                    },
                  ]}
                >
                  {formState === "login" && (
                    <View style={styles.loginForm}>
                      <Text style={styles.formTitle}>Iniciar Sesión</Text>

                      {error ? (
                        <Animated.View style={styles.errorContainer}>
                          <LinearGradient
                            colors={["#fef2f2", "#fee2e2"]}
                            style={styles.errorGradient}
                          />
                          <Ionicons
                            name="alert-circle"
                            size={20}
                            color="#dc2626"
                          />
                          <Text style={styles.errorText}>{error}</Text>
                        </Animated.View>
                      ) : null}

                      <View style={styles.inputWrapper}>
                        <View style={styles.inputContainer}>
                          <View style={styles.inputIconContainer}>
                            <Ionicons
                              name="person-outline"
                              size={20}
                              color="#059669"
                            />
                          </View>
                          <TextInput
                            style={styles.textInput}
                            placeholder="Nombre de usuario"
                            placeholderTextColor="#9ca3af"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                          />
                        </View>
                      </View>

                      <View style={styles.inputWrapper}>
                        <View style={styles.inputContainer}>
                          <View style={styles.inputIconContainer}>
                            <Ionicons
                              name="lock-closed-outline"
                              size={20}
                              color="#059669"
                            />
                          </View>
                          <TextInput
                            style={styles.textInput}
                            placeholder="Contraseña"
                            placeholderTextColor="#9ca3af"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                          />
                          <TouchableOpacity
                            style={styles.passwordToggle}
                            onPress={() => setShowPassword(!showPassword)}
                          >
                            <Ionicons
                              name={
                                showPassword ? "eye-off-outline" : "eye-outline"
                              }
                              size={20}
                              color="#6b7280"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>

                   {/*    <View style={styles.rememberForgotContainer}>
                        <TouchableOpacity
                          style={styles.rememberContainer}
                          onPress={() => setRememberMe(!rememberMe)}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              rememberMe && styles.checkboxActive,
                            ]}
                          >
                            {rememberMe && (
                              <Ionicons
                                name="checkmark"
                                size={14}
                                color="white"
                              />
                            )}
                          </View>
                          <Text style={styles.rememberText}>Recordarme</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleForgotPassword}>
                          <Text style={styles.forgotText}>
                            ¿Olvidó su contraseña?
                          </Text>
                        </TouchableOpacity>
                      </View> */}

                      <TouchableOpacity
                        style={[
                          styles.buttonContainer,
                          isLoading && styles.buttonDisabled,
                        ]}
                        onPress={handleLogin}
                        disabled={isLoading}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={
                            isLoading
                              ? ["#9ca3af", "#6b7280"]
                              : ["#10b981", "#059669"]
                          }
                          style={styles.buttonGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        >
                          {isLoading ? (
                            <View style={styles.loadingContainer}>
                              <Animated.View
                                style={{ transform: [{ rotate: spin }] }}
                              >
                                <Ionicons
                                  name="refresh"
                                  size={20}
                                  color="white"
                                />
                              </Animated.View>
                              <Text style={styles.buttonText}>
                                Verificando...
                              </Text>
                            </View>
                          ) : (
                            <View style={styles.buttonContent}>
                              <Text style={styles.buttonText}>Ingresar</Text>
                              <Ionicons
                                name="arrow-forward"
                                size={20}
                                color="white"
                              />
                            </View>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  )}

                  {formState === "recover" && (
                    <View style={styles.recoverForm}>
                      <Text style={styles.formTitle}>Recuperar Contraseña</Text>
                      <Text style={styles.formSubtitle}>
                        Ingrese su usuario para recibir instrucciones de
                        recuperación
                      </Text>

                      {error ? (
                        <Animated.View style={styles.errorContainer}>
                          <LinearGradient
                            colors={["#fef2f2", "#fee2e2"]}
                            style={styles.errorGradient}
                          />
                          <Ionicons
                            name="alert-circle"
                            size={20}
                            color="#dc2626"
                          />
                          <Text style={styles.errorText}>{error}</Text>
                        </Animated.View>
                      ) : null}

                      <View style={styles.inputWrapper}>
                        <View style={styles.inputContainer}>
                          <View style={styles.inputIconContainer}>
                            <Ionicons
                              name="person-outline"
                              size={20}
                              color="#059669"
                            />
                          </View>
                          <TextInput
                            style={styles.textInput}
                            placeholder="Nombre de usuario"
                            placeholderTextColor="#9ca3af"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                          />
                        </View>
                      </View>

                      <View style={styles.buttonGroup}>
                        <TouchableOpacity
                          style={styles.buttonSecondaryContainer}
                          onPress={handleBackToLogin}
                        >
                          <View style={styles.buttonSecondary}>
                            <Text style={styles.buttonSecondaryText}>
                              Cancelar
                            </Text>
                          </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.buttonContainer, styles.buttonSmall]}
                          onPress={handleRecoverSubmit}
                          disabled={isLoading}
                        >
                          <LinearGradient
                            colors={
                              isLoading
                                ? ["#9ca3af", "#6b7280"]
                                : ["#10b981", "#059669"]
                            }
                            style={styles.buttonGradient}
                          >
                            {isLoading ? (
                              <View style={styles.loadingContainer}>
                                <Animated.View
                                  style={{ transform: [{ rotate: spin }] }}
                                >
                                  <Ionicons
                                    name="refresh"
                                    size={16}
                                    color="white"
                                  />
                                </Animated.View>
                                <Text style={styles.buttonText}>
                                  Enviando...
                                </Text>
                              </View>
                            ) : (
                              <Text style={styles.buttonText}>Enviar</Text>
                            )}
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </Animated.View>

                <View style={styles.waveContainer}>
                  <Svg height="100" width="100%" viewBox="0 0 1440 320">
                    <Defs>
                      <SvgLinearGradient
                        id="waveGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <Stop
                          offset="0%"
                          stopColor="#d1fae5"
                          stopOpacity="0.8"
                        />
                        <Stop
                          offset="50%"
                          stopColor="#a7f3d0"
                          stopOpacity="0.6"
                        />
                        <Stop
                          offset="100%"
                          stopColor="#6ee7b7"
                          stopOpacity="0.4"
                        />
                      </SvgLinearGradient>
                    </Defs>
                    <Path
                      fill="url(#waveGradient)"
                      d="M0,160L48,176C96,192,192,224,288,229.3C384,235,480,213,576,186.7C672,160,768,128,864,128C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    />
                  </Svg>
                </View>
              </Animated.View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  © 2025 SENA - Servicio Nacional de Aprendizaje
                </Text>
                <Text style={styles.versionText}>Versión 2.0</Text>
              </View>
            </Animated.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  containerHome: {
    flex: 1,
    backgroundColor: "#f0fdf4",
  },
  backgroundTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollViewAbsolute: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
  },
  backgroundDecoration: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingCircle: {
    position: "absolute",
    borderRadius: 100,
    opacity: 0.1,
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: "white",
    top: 50,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: "white",
    top: 200,
    left: -30,
  },
  circle3: {
    width: 100,
    height: 100,
    backgroundColor: "white",
    bottom: 200,
    right: 50,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  mainContainer: {
    width: "100%",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
    zIndex: 10,
  },
  logoBackground: {
    backgroundColor: "white",
    borderRadius: 25,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },
  logoImage: {
    width: 160,
    height: 60,
  },
  card: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 20,
  },
  formContainer: {
    width: "100%",
  },
  loginForm: {
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  recoverForm: {
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  formTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  formSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  errorContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
  },
  errorGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  errorText: {
    marginLeft: 10,
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    height: 56,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIconContainer: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 16,
    color: "#374151",
    fontSize: 16,
    fontWeight: "500",
  },
  passwordToggle: {
    padding: 16,
  },
  rememberForgotContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  checkboxActive: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  rememberText: {
    marginLeft: 10,
    color: "#4b5563",
    fontSize: 14,
    fontWeight: "500",
  },
  forgotText: {
    color: "#059669",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonContainer: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 8,
  },
  buttonDisabled: {
    shadowOpacity: 0.1,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  buttonSecondaryContainer: {
    flex: 1,
  },
  buttonSecondary: {
    height: 56,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  buttonSecondaryText: {
    color: "#4b5563",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonSmall: {
    flex: 1,
  },
  waveContainer: {
    height: 100,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  successContainer: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  progressBarContainer: {
    width: "100%",
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressBar: {
    height: "100%",
    width: "100%",
    borderRadius: 3,
  },
  redirectingText: {
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "500",
  },
  footer: {
    marginTop: 30,
    marginBottom: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "black",
    fontWeight: "500",
  },
  versionText: {
    marginTop: 4,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
});

export default Login;