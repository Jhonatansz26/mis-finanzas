// api.js o api.ts
import axios from 'axios';
import { storage } from '../utils/storage';

// Crear instancia base de axios
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  async (config: any) => {
    try {
      const token = await storage.getItemAsync('auth-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error al obtener el token:', error);
      return config;
    }
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

api.interceptors.request.use(
  (config) => {
    console.log('🚀 REQUEST:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.log('❌ REQUEST ERROR:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ RESPONSE:', {
      status: response.status,
      headers: response.headers,
      data: response.data,
    });
    return response;
  },
  (error) => {
    if (error.response) {
      console.log('❌ RESPONSE ERROR:', {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data,
      });
    } else if (error.request) {
      console.log('❌ NO RESPONSE:', error.request);
    } else {
      console.log('❌ REQUEST CONFIG ERROR:', error.message);
    }
    console.log('❌ FULL ERROR:', error.config);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    if (error.response && error.response.status === 401) {
      console.warn('Sesión expirada o token inválido');
      
      // Limpiar token y estado de autenticación
      await storage.deleteItemAsync('auth-token');
      await storage.deleteItemAsync('auth-store');
      await storage.deleteItemAsync('business-store');
      
      // En web, recargar la página para volver al login
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;