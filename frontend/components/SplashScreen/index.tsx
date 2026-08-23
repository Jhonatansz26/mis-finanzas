import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onComplete }: any) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const entrepreneurQuotes = [
    {
      text: "El fracaso es simplemente la oportunidad de comenzar de nuevo, esta vez de manera más inteligente.",
      author: "Henry Ford"
    },
    {
      text: "Ama lo que haces y harás un trabajo extraordinario.",
      author: "Steve Jobs"
    },
    {
      text: "Si no estás dispuesto a arriesgar lo común, tendrás que conformarte con lo ordinario.",
      author: "Jim Rohn"
    },
    {
      text: "El éxito no es definitivo, el fracaso no es fatal: es el coraje para continuar lo que cuenta.",
      author: "Winston Churchill"
    },
    {
      text: "Los emprendedores exitosos encuentran el coraje para tomar decisiones que nadie más tomaría.",
      author: "Richard Branson"
    }
  ];

  const animateQuote = (index:any) => {
    // Resetear la opacidad
    fadeAnim.setValue(0);

    // Animación de entrada
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true
    }).start(() => {
      // Esperar un momento con la frase visible
      setTimeout(() => {
        // Animación de salida
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true
        }).start(() => {
          // Pasar a la siguiente frase o terminar
          if (index < entrepreneurQuotes.length - 1) {
            setCurrentQuoteIndex(index + 1);
          } else {
            // Cuando todas las frases se han mostrado, notifica al parent
            onComplete();
          }
        });
      }, 2000); // La frase permanece visible durante 2 segundos
    });
  };

  useEffect(() => {
    animateQuote(currentQuoteIndex);
  }, [currentQuoteIndex]);

  return (
    <LinearGradient
      colors={['#104d19', '#2e8b57', '#7fbd69', '#4CAF50']}
      style={styles.gradientContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Animated.View style={[styles.quoteContainer, { opacity: fadeAnim }]}>
        <Text style={styles.quoteText}>{entrepreneurQuotes[currentQuoteIndex].text}</Text>
        <Text style={styles.authorText}>- {entrepreneurQuotes[currentQuoteIndex].author}</Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    height: height,
  },
  quoteContainer: {
    padding: 20,
    maxWidth: '85%',
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  quoteText: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  authorText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'right',
    fontWeight: '300',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  }
});

export default SplashScreen;