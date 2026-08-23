import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const FeaturedProductsList = () => {
    const productsData = [
        {
            name: 'Papas francesas',
            units: '45 unidades',
            value: '$450K',
            rank: 1,
            color: '#10B981'
        },
        {
            name: 'Arepa de carne',
            units: '38 unidades',
            value: '$380K',
            rank: 2,
            color: '#10B981'
        },
        {
            name: 'Jugos naturales',
            units: '52 unidades',
            value: '$312K',
            rank: 3,
            color: '#10B981'
        }
    ]

    return (
        <View style={styles.productsContainer}>
            <View style={styles.productsHeader}>
                <MaterialIcons name="star" size={20} color="#EAB308" />
                <Text style={styles.productsTitle}>Productos Destacados</Text>
            </View>
            
            <View style={styles.productsList}>
                {productsData.map((product, index) => (
                    <View key={index} style={styles.productItem}>
                        <View style={styles.rankContainer}>
                            <View style={[styles.rankBadge, { backgroundColor: product.color }]}>
                                <Text style={styles.rankText}>{product.rank}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.productInfo}>
                            <Text style={styles.productName}>{product.name}</Text>
                            <Text style={styles.productUnits}>{product.units}</Text>
                        </View>
                        
                        <View style={styles.productValue}>
                            <Text style={styles.valueText}>{product.value}</Text>
                            <MaterialIcons name="trending-up" size={16} color={product.color} />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    productsContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20
    },
    productsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },
    productsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        marginLeft: 8
    },
    productsList: {
        gap: 12
    },
    productItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8
    },
    rankContainer: {
        marginRight: 12
    },
    rankBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center'
    },
    rankText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white'
    },
    productInfo: {
        flex: 1
    },
    productName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 2
    },
    productUnits: {
        fontSize: 12,
        color: '#64748B'
    },
    productValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    valueText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#10B981'
    }
})

export default FeaturedProductsList