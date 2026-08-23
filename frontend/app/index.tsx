import { useEffect, useState } from 'react';
import { Redirect, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../hooks/useAuthStore';
import useBusinessStore from '../hooks/useBusinessStore';
import api from '../api/apiConfig';

export default function Index() {
  const { isAuthenticated, logout } = useAuthStore();
  const { businesses, fetchBusinesses, isLoading } = useBusinessStore();
  const segments = useSegments();
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (!isAuthenticated) {
          setRedirectTo('/(auth)/login');
          setChecking(false);
          return;
        }

        // Verificar que el token sea válido
        try {
          await api.get('/auth/check');
        } catch (err: any) {
          // Token inválido, limpiar todo
          await logout();
          setRedirectTo('/(auth)/login');
          setChecking(false);
          return;
        }

        // Token válido, cargar negocios
        if (businesses.length === 0 && !isLoading) {
          await fetchBusinesses();
        }

      } catch (error) {
        console.error('Error al inicializar:', error);
        await logout();
        setRedirectTo('/(auth)/login');
      } finally {
        setChecking(false);
      }
    };

    initializeApp();
  }, [isAuthenticated]);

  useEffect(() => {
    if (checking) return;
    if (!isAuthenticated) return;
    if (isLoading) return;

    const inMainGroup = segments[0] === '(main)';
    if (inMainGroup) return;

    if (businesses.length === 0) {
      setRedirectTo('/(main)/business-register');
    } else {
      setRedirectTo('/(main)/home');
    }
  }, [checking, isAuthenticated, isLoading, businesses, segments]);

  if (checking || !redirectTo) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#fff'
      }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return <Redirect href={redirectTo as any} />;
}