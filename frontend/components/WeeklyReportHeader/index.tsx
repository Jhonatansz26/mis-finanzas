import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const WeeklyReportHeader = () => {
    return (
        <View style={styles.headerContainer}>
            <View style={styles.titleSection}>
                <Text style={styles.title}>Reporte Semanal</Text>
                <Text style={styles.dateRange}>13 - 19 Junio 2025</Text>
            </View>
            
            <View style={styles.metricsContainer}>
                <View style={styles.metricItem}>
                    <MaterialIcons name="attach-money" size={20} color="white" />
                    <Text style={styles.metricValue}>$770K</Text>
                    <Text style={styles.metricLabel}>Utilidad</Text>
                </View>
                
                <View style={styles.metricItem}>
                    <MaterialIcons name="trending-up" size={20} color="white" />
                    <Text style={styles.metricValue}>+15.3%</Text>
                    <Text style={styles.metricLabel}>Crecimiento</Text>
                </View>
                
                <View style={styles.metricItem}>
                    <MaterialIcons name="people" size={20} color="white" />
                    <Text style={styles.metricValue}>156</Text>
                    <Text style={styles.metricLabel}>Clientes</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: '#10B981',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20
    },
    titleSection: {
        marginBottom: 20
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4
    },
    dateRange: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)'
    },
    metricsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    metricItem: {
        alignItems: 'center',
        flex: 1
    },
    metricValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 4,
        marginBottom: 2
    },
    metricLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)'
    }
})

export default WeeklyReportHeader