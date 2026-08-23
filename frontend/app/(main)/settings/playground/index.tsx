import React from "react";
import { StyleSheet, Text, View } from "react-native";
import LayoutMain from "../../../../components/LayoutHome";
import BusinessForm from "../../../../forms/BusinessForm";

function Playground() {
  const handleBusinessChange = (business: any) => {
    console.log(`Negocio cambiado a: ${business.name}`);
    // Puedes hacer algo cuando cambia el negocio, como actualizar datos
  };
  return (
    <LayoutMain>
      <View style={styles.containerPlayground}>
        <View style={styles.headerBusinnesForm}>
          <Text style={styles.title}>Registra tu Negocio</Text>
          <Text style={styles.subtitle}> Completa la información de tu empresa y puntos de venta</Text>
        </View>
        <BusinessForm/>
      </View>
    </LayoutMain>
  );
}
const styles = StyleSheet.create({
  containerPlayground: {
    flex: 1
  },
  headerBusinnesForm:{
    display:'flex',
    width:'100%',
    alignItems:'center',
    marginTop:20
  },
  title:{
    fontSize:30,
    marginBottom:10,
    fontWeight:700
  },
  subtitle:{
    fontSize:20,
    textAlign:'center',
    color:'rgba(0, 0, 0, 0.48)'
  }
});
export default Playground;
