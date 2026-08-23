import React, { useState, useEffect } from "react";
import { 
  Image, 
  Pressable, 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  Alert,
  ActivityIndicator 
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import useBusinessStore from "../../../../../hooks/useBusinessStore";
import { useAuthStore } from "../../../../../hooks/useAuthStore";
import LayoutMain from "../../../../../components/LayoutHome";
import api from "../../../../../api/apiConfig";

interface UserData {
  nombres: string;
  apellidos: string;
  documento: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
}

interface BusinessData {
  nombre: string;
  nit: string;
  email: string;
  telefono: string;
  direccion: string;
}

function EditProfile() {
  const router = useRouter();
  const { activeBusiness, updateBusiness } = useBusinessStore();
  const { user, updateUser } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'user' | 'business'>('user');
  
  // Estados para datos del usuario
  const [userData, setUserData] = useState<UserData>({
    nombres: '',
    apellidos: '',
    documento: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
  });

  // Estados para datos del negocio
  const [businessData, setBusinessData] = useState<BusinessData>({
    nombre: '',
    nit: '',
    email: '',
    telefono: '',
    direccion: '',
  });

  // Cargar datos iniciales
  useEffect(() => {
    if (user) {
      setUserData({
        nombres: user.nombres || '',
        apellidos: user.apellidos || '',
        documento: user.documento || '',
        email: user.email || '',
        telefono: user.telefono || '',
        fecha_nacimiento: user.fecha_nacimiento ? user.fecha_nacimiento.split('T')[0] : '',
      });
    }

    if (activeBusiness) {
      setBusinessData({
        nombre: activeBusiness.nombre || '',
        nit: activeBusiness.nit || '',
        email: activeBusiness.email || '',
        telefono: activeBusiness.telefono || '',
        direccion: activeBusiness.direccion || '',
      });
    }
  }, [user, activeBusiness]);

  // Función para actualizar datos del usuario
  const handleUpdateUser = async () => {
    if (!userData.nombres.trim() || !userData.apellidos.trim()) {
      Alert.alert("Error", "El nombre y apellido son obligatorios");
      return;
    }

    if (!userData.email.includes('@')) {
      Alert.alert("Error", "Por favor ingresa un email válido");
      return;
    }

    // Validar teléfono si está presente
    if (userData.telefono && userData.telefono.length !== 10) {
      Alert.alert("Error", "El teléfono debe tener 10 dígitos");
      return;
    }

    // Validar fecha de nacimiento si está presente
    if (userData.fecha_nacimiento) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(userData.fecha_nacimiento)) {
        Alert.alert("Error", "La fecha debe estar en formato YYYY-MM-DD");
        return;
      }
    }

    setLoading(true);
    try {
      // Preparar datos para enviar (solo campos modificados y no vacíos)
      const dataToUpdate: any = {};
      
      if (userData.nombres.trim()) dataToUpdate.nombres = userData.nombres.trim();
      if (userData.apellidos.trim()) dataToUpdate.apellidos = userData.apellidos.trim();
      if (userData.email.trim()) dataToUpdate.email = userData.email.trim();
      if (userData.documento.trim()) dataToUpdate.documento = userData.documento.trim();
      if (userData.telefono.trim()) dataToUpdate.telefono = userData.telefono.trim();
      if (userData.fecha_nacimiento.trim()) dataToUpdate.fecha_nacimiento = userData.fecha_nacimiento.trim();

      // Llamada a la API
      const response = await api.patch(`/user/${user?.id}`, dataToUpdate);

      if (response.data.success) {
        // Actualizar el store local con los datos actualizados
        if (updateUser) {
          updateUser(response.data.data);
        }
        
        Alert.alert("Éxito", "Perfil actualizado correctamente", [
          { text: "OK", onPress: () => router.back() }
        ]);
      }
    } catch (error: any) {
      console.error('Error al actualizar usuario:', error);
      
      let errorMessage = "No se pudo actualizar el perfil";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar datos del negocio
  const handleUpdateBusiness = async () => {
    if (!businessData.nombre.trim()) {
      Alert.alert("Error", "El nombre del negocio es obligatorio");
      return;
    }

    if (!businessData.email.includes('@')) {
      Alert.alert("Error", "Por favor ingresa un email válido");
      return;
    }

    // Validar teléfono si está presente
    if (businessData.telefono && businessData.telefono.length !== 10) {
      Alert.alert("Error", "El teléfono debe tener 10 dígitos");
      return;
    }

    setLoading(true);
    try {
      // Preparar datos para enviar (solo campos modificados y no vacíos)
      const dataToUpdate: any = {};
      
      if (businessData.nombre.trim()) dataToUpdate.nombre = businessData.nombre.trim();
      if (businessData.nit.trim()) dataToUpdate.nit = businessData.nit.trim();
      if (businessData.email.trim()) dataToUpdate.email = businessData.email.trim();
      if (businessData.telefono.trim()) dataToUpdate.telefono = businessData.telefono.trim();
      if (businessData.direccion.trim()) dataToUpdate.direccion = businessData.direccion.trim();

      // Llamada a la API
      const response = await api.patch(`/business/${activeBusiness?.id}`, dataToUpdate);

      if (response.data.success) {
        // Actualizar el store local con los datos actualizados
        if (updateBusiness) {
          updateBusiness(response.data.data);
        }
        
        Alert.alert("Éxito", "Información del negocio actualizada correctamente", [
          { text: "OK" }
        ]);
      }
    } catch (error: any) {
      console.error('Error al actualizar negocio:', error);
      
      let errorMessage = "No se pudo actualizar la información del negocio";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderUserForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Información Personal</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nombres *</Text>
        <TextInput
          style={styles.textInput}
          value={userData.nombres}
          onChangeText={(text) => setUserData(prev => ({...prev, nombres: text}))}
          placeholder="Ingresa tus nombres"
          placeholderTextColor="#9ca3af"
          editable={!loading}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Apellidos *</Text>
        <TextInput
          style={styles.textInput}
          value={userData.apellidos}
          onChangeText={(text) => setUserData(prev => ({...prev, apellidos: text}))}
          placeholder="Ingresa tus apellidos"
          placeholderTextColor="#9ca3af"
          editable={!loading}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Documento</Text>
        <TextInput
          style={styles.textInput}
          value={userData.documento}
          onChangeText={(text) => setUserData(prev => ({...prev, documento: text}))}
          placeholder="Número de documento"
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
          editable={!loading}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email *</Text>
        <TextInput
          style={styles.textInput}
          value={userData.email}
          onChangeText={(text) => setUserData(prev => ({...prev, email: text}))}
          placeholder="correo@ejemplo.com"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Teléfono</Text>
        <TextInput
          style={styles.textInput}
          value={userData.telefono}
          onChangeText={(text) => setUserData(prev => ({...prev, telefono: text}))}
          placeholder="3001234567"
          placeholderTextColor="#9ca3af"
          keyboardType="phone-pad"
          maxLength={10}
          editable={!loading}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Fecha de Nacimiento</Text>
        <TextInput
          style={styles.textInput}
          value={userData.fecha_nacimiento}
          onChangeText={(text) => setUserData(prev => ({...prev, fecha_nacimiento: text}))}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#9ca3af"
          editable={!loading}
        />
      </View>

      <Pressable 
        style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
        onPress={handleUpdateUser}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <Feather name="save" size={18} color="white" />
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
          </>
        )}
      </Pressable>
    </View>
  );

  const renderBusinessForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Información del Negocio</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nombre del Negocio *</Text>
        <TextInput
          style={styles.textInput}
          value={businessData.nombre}
          onChangeText={(text) => setBusinessData(prev => ({...prev, nombre: text}))}
          placeholder="Nombre de tu negocio"
          placeholderTextColor="#9ca3af"
          editable={!loading}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>NIT</Text>
        <TextInput
          style={styles.textInput}
          value={businessData.nit}
          onChangeText={(text) => setBusinessData(prev => ({...prev, nit: text}))}
          placeholder="123456789-0"
          placeholderTextColor="#9ca3af"
          editable={!loading}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email del Negocio *</Text>
        <TextInput
          style={styles.textInput}
          value={businessData.email}
          onChangeText={(text) => setBusinessData(prev => ({...prev, email: text}))}
          placeholder="negocio@ejemplo.com"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Teléfono del Negocio</Text>
        <TextInput
          style={styles.textInput}
          value={businessData.telefono}
          onChangeText={(text) => setBusinessData(prev => ({...prev, telefono: text}))}
          placeholder="3001234567"
          placeholderTextColor="#9ca3af"
          keyboardType="phone-pad"
          maxLength={10}
          editable={!loading}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Dirección</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={businessData.direccion}
          onChangeText={(text) => setBusinessData(prev => ({...prev, direccion: text}))}
          placeholder="Dirección completa del negocio"
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
          editable={!loading}
        />
      </View>

      <Pressable 
        style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
        onPress={handleUpdateBusiness}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <Feather name="save" size={18} color="white" />
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
          </>
        )}
      </Pressable>
    </View>
  );

  return (
    <LayoutMain>
      <View style={styles.headerHome}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#16a34a" />
        </Pressable>
        <Text style={styles.titleHeader}>Editar Perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <Pressable 
          style={[styles.tab, activeTab === 'user' && styles.activeTab]}
          onPress={() => setActiveTab('user')}
        >
          <Feather name="user" size={18} color={activeTab === 'user' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.tabText, activeTab === 'user' && styles.activeTabText]}>
            Personal
          </Text>
        </Pressable>

        {activeBusiness && (
          <Pressable 
            style={[styles.tab, activeTab === 'business' && styles.activeTab]}
            onPress={() => setActiveTab('business')}
          >
            <Feather name="briefcase" size={18} color={activeTab === 'business' ? '#16a34a' : '#64748b'} />
            <Text style={[styles.tabText, activeTab === 'business' && styles.activeTabText]}>
              Negocio
            </Text>
          </Pressable>
        )}
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {activeTab === 'user' ? renderUserForm() : renderBusinessForm()}
        
        {/* Espaciado inferior */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </LayoutMain>
  );
}

const styles = StyleSheet.create({
  headerHome: {
    height: 75,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  backButton: {
    padding: 4,
  },
  titleHeader: {
    color: "black",
    fontSize: 20,
    fontWeight: "700",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#16a34a',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  activeTabText: {
    color: '#16a34a',
    fontWeight: '600',
  },
  formContainer: {
    padding: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 10,
    gap: 8,
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfile;