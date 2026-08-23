import { MaterialCommunityIcons } from '@expo/vector-icons'
import React, { useEffect, useRef } from 'react'
import { StyleSheet, Text, View, Animated, ScrollView } from 'react-native'

// Interfaz unificada para productos bestseller (compatible con daily y weekly)
interface BestSellerProduct {
    cantidad_total_vendida: string;
    ganancia_total_producto: string;
    ingresos_formatted: string;
    ingresos_generados: string;
    porcentaje_cantidad: string;
    producto_id: number;
    producto_nombre: string;
    ranking_por_cantidad: number;
    
    // Campos opcionales para compatibilidad con datos semanales
    fin_semana?: string;
    inicio_semana?: string;
    
    // Campos opcionales para compatibilidad con datos diarios
    costo_unitario?: number;
    dia_semana?: string;
    fecha_formateada?: string;
    ganancia_por_unidad?: number;
    precio_unitario?: number;
}

interface BestSellersProps {
    data: BestSellerProduct[];
    loading: boolean;
}

const BestSellers = ({ data, loading }: BestSellersProps) => {
    const shimmerAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (loading) {
            const animation = Animated.loop(
                Animated.sequence([
                    Animated.timing(shimmerAnimation, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(shimmerAnimation, {
                        toValue: 0,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            );
            animation.start();
            return () => animation.stop();
        }
    }, [loading]);

    const shimmerOpacity = shimmerAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    // Componente Skeleton
    const SkeletonBox = ({ width, height, style }: any) => (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    backgroundColor: "#E1E9EE",
                    borderRadius: 6,
                    opacity: shimmerOpacity,
                },
                style,
            ]}
        />
    );

    // Colores para los diferentes rankings
    const getColorByRanking = (ranking: number): string => {
        const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280'];
        return colors[ranking - 1] || '#6B7280';
    };

    // Componente de skeleton para cada producto
    const renderSkeletonItem = (index: number) => {
        return (
            <View key={index} style={styles.productItem}>
                {/* Header skeleton */}
                <View style={styles.productHeader}>
                    <View style={styles.leftHeader}>
                        <SkeletonBox width={10} height={10} style={{ borderRadius: 5 }} />
                        <SkeletonBox width={120} height={14} style={{ marginLeft: 6 }} />
                    </View>
                    <SkeletonBox width={50} height={16} />
                </View>

                {/* Progress bar skeleton */}
                <View style={styles.progressBarWrapper}>
                    <SkeletonBox width="100%" height={4} style={{ borderRadius: 2 }} />
                </View>

                {/* Footer skeleton */}
                <View style={styles.productFooter}>
                    <SkeletonBox width={35} height={12} />
                    <SkeletonBox width={120} height={12} />
                </View>
            </View>
        );
    };

    const renderProductItem = (product: BestSellerProduct, index: number) => {
        const color = getColorByRanking(product.ranking_por_cantidad);
        const percentage = parseFloat(product.porcentaje_cantidad);
        const unitsFormatted = `${parseFloat(product.cantidad_total_vendida).toFixed(0)} unidades vendidas`;
        
        return (
            <View key={product.producto_id} style={styles.productItem}>
                {/* Header con dot, nombre y valor */}
                <View style={styles.productHeader}>
                    <View style={styles.leftHeader}>
                        <View style={[styles.dot, { backgroundColor: color }]} />
                        <Text style={styles.productName} numberOfLines={1}>
                            {product.producto_nombre}
                        </Text>
                    </View>
                    <Text style={styles.valueText}>
                        {product.ingresos_formatted}
                    </Text>
                </View>

                {/* Progress bar */}
                <View style={styles.progressBarWrapper}>
                    <View style={styles.progressBarBackground} />
                    <View
                        style={[
                            styles.progressBarFill,
                            {
                                width: `${percentage}%`,
                                backgroundColor: color
                            }
                        ]}
                    />
                </View>

                {/* Footer con porcentaje y unidades */}
                <View style={styles.productFooter}>
                    <Text style={styles.percentageText}>
                        {parseFloat(product.porcentaje_cantidad).toFixed(1)}%
                    </Text>
                    <Text style={styles.unitsText}>
                        {unitsFormatted}
                    </Text>
                </View>
            </View>
        );
    };

    // Mostrar skeleton mientras carga
    if (loading) {
        return (
            <View style={styles.bestSellers}>
                {/* Header */}
                <View style={styles.header}>
                    <SkeletonBox width={140} height={16} />
                    <SkeletonBox width={24} height={24} style={{ borderRadius: 12 }} />
                </View>

                {/* Products List Skeleton */}
                <ScrollView 
                    style={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <View style={styles.productsList}>
                        {Array.from({ length: 3 }, (_, index) => renderSkeletonItem(index))}
                    </View>
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={styles.bestSellers}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>
                    Productos Estrella
                </Text>
                <MaterialCommunityIcons name="medal-outline" size={24} color="#EAB308" />
            </View>

            {/* Products List */}
            <ScrollView 
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                <View style={styles.productsList}>
                    {data.length > 0 ? (
                        data.map((product, index) => renderProductItem(product, index))
                    ) : (
                        <View style={styles.noDataContainer}>
                            <Text style={styles.noDataText}>No hay datos disponibles</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    bestSellers: {
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginTop: 5,
        padding: 16,
        backgroundColor: 'white',
        marginBottom: 20,
        minHeight: 310,
        paddingBottom:20
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000'
    },
    scrollContainer: {
        flex: 1,
        maxHeight: 250,
        paddingHorizontal:10
    },
    productsList: {
        gap: 12,
        paddingBottom: 10
    },
    productItem: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    leftHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    dot: {
        height: 10,
        width: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
        flex: 1,
    },
    valueText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#00D4AA',
    },
    progressBarWrapper: {
        height: 4,
        marginBottom: 6,
        position: 'relative',
    },
    progressBarBackground: {
        height: 4,
        width: '100%',
        backgroundColor: '#E5E7EB',
        borderRadius: 2
    },
    progressBarFill: {
        height: 4,
        borderRadius: 2,
        position: 'absolute',
        top: 0,
        left: 0,
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    percentageText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    unitsText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '400',
    },
    noDataContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20
    },
    noDataText: {
        fontSize: 14,
        color: '#6B7280',
        fontStyle: 'italic'
    }
});

export default BestSellers;