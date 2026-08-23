import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const WeeklySummaryCards = () => {
    return (
        <View style={styles.cardsContainer}>
            <View style={[styles.card, { backgroundColor: 'rgba(230,246,270,1)' }]}>
                <View style={styles.cardIcon}>
                    <MaterialIcons name="shopping-cart" size={24} color="#3B82F6" />
                </View>
                <Text style={styles.cardValue}>423</Text>
                <Text style={styles.cardLabel}>Productos vendidos</Text>
            </View>

            <View style={[styles.card, { backgroundColor: 'rgba(250,237,260,1)' }]}>
                <View style={styles.cardIcon}>
                    <MaterialIcons name="track-changes" size={24} color="#8B5CF6" />
                </View>
                <Text style={styles.cardValue}>156</Text>
                <Text style={styles.cardLabel}>Transacciones</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    cardsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20
    },
    card: {
        flex: 1,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center'
    },
    cardIcon: {
        marginBottom: 8
    },
    cardValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 4
    },
    cardLabel: {
        fontSize: 12,
        color: '#64748B',
        textAlign: 'center'
    }
})

export default WeeklySummaryCards