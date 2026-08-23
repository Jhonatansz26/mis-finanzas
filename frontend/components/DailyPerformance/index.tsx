import { AntDesign, Feather, FontAwesome6, MaterialIcons } from '@expo/vector-icons'
import React, { useEffect, useRef } from 'react'
import { StyleSheet, Text, View, Animated } from 'react-native'

// Interfaces para los datos
interface MainMetric {
    label: string;
    value: string;
    color: string;
    dotColor: string;
}

interface Comparison {
    label: string;
    percentage: string;
    color: string;
    backgroundColor: string;
}

interface Insight {
    label: string;
    value: string;
}

interface DailyPerformanceData {
    mainMetrics: MainMetric[];
    comparisons: Comparison[];
    insights: Insight[];
}

interface DailyPerformanceProps {
    data: DailyPerformanceData | null;
    loading: boolean;
}

const DailyPerformance = ({ data, loading }: DailyPerformanceProps) => {
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

    // Datos por defecto cuando no hay datos disponibles
    const defaultData: DailyPerformanceData = {
        mainMetrics: [
            {
                label: 'Ventas registradas',
                value: '$0',
                color: '#10B981',
                dotColor: '#10B981'
            },
            {
                label: 'Gastos registrados',
                value: '$0',
                color: '#EF4444',
                dotColor: '#EF4444'
            },
            {
                label: 'Utilidad del día',
                value: '$0',
                color: '#3B82F6',
                dotColor: '#3B82F6'
            }
        ],
        comparisons: [
            {
                label: 'Ventas',
                percentage: '0%',
                color: '#10B981',
                backgroundColor: 'rgba(240,253,244,1)'
            },
            {
                label: 'Gastos',
                percentage: '0%',
                color: '#F97316',
                backgroundColor: 'rgba(255,247,237,1)'
            },
            {
                label: 'Utilidad',
                percentage: '0%',
                color: '#3B82F6',
                backgroundColor: 'rgba(239,246,255,1)'
            }
        ],
        insights: [
            {
                label: 'Transacciones realizadas',
                value: '0'
            },
            {
                label: 'Productos vendidos',
                value: '0'
            },
            {
                label: 'Ticket promedio',
                value: '$0'
            },
            {
                label: 'Margen del día',
                value: '0%'
            }
        ]
    };

    const currentData = data || defaultData;

    const renderMainMetric = (metric: MainMetric, index: number) => {
        if (loading) {
            return (
                <View key={index} style={styles.mainMetricItem}>
                    <View style={styles.metricLeft}>
                        <SkeletonBox width={8} height={8} style={{ borderRadius: 4 }} />
                        <SkeletonBox width={120} height={14} style={{ marginLeft: 8 }} />
                    </View>
                    <SkeletonBox width={60} height={16} />
                </View>
            );
        }

        return (
            <View key={index} style={styles.mainMetricItem}>
                <View style={styles.metricLeft}>
                    <View style={[styles.dot, { backgroundColor: metric.dotColor }]} />
                    <Text style={styles.metricLabel}>{metric.label}</Text>
                </View>
                <Text style={[styles.metricValue, { color: metric.color }]}>{metric.value}</Text>
            </View>
        )
    }

    const renderComparison = (comparison: Comparison, index: number) => {
        if (loading) {
            return (
                <View key={index} style={[styles.comparisonCard, { backgroundColor: '#F3F4F6' }]}>
                    <SkeletonBox width={40} height={16} style={{ marginBottom: 4 }} />
                    <SkeletonBox width={50} height={12} />
                </View>
            );
        }

        return (
            <View key={index} style={[styles.comparisonCard, { backgroundColor: comparison.backgroundColor }]}>
                <Text style={[styles.comparisonPercentage, { color: comparison.color }]}>
                    {comparison.percentage}
                </Text>
                <Text style={styles.comparisonLabel}>{comparison.label}</Text>
            </View>
        )
    }

    const renderInsight = (insight: Insight, index: number) => {
        if (loading) {
            return (
                <View key={index} style={styles.insightItem}>
                    <SkeletonBox width={140} height={14} />
                    <SkeletonBox width={60} height={14} />
                </View>
            );
        }

        return (
            <View key={index} style={styles.insightItem}>
                <Text style={styles.insightLabel}>{insight.label}</Text>
                <Text style={styles.insightValue}>{insight.value}</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                {loading ? (
                    <SkeletonBox width={140} height={16} />
                ) : (
                    <Text style={styles.title}>Rendimiento de Hoy</Text>
                )}
                {loading ? (
                    <SkeletonBox width={20} height={20} />
                ) : (
                    <Feather name="eye" size={20} color="#9CA3AF" />
                )}
            </View>

            {/* Main Metrics */}
            <View style={styles.mainMetrics}>
                {currentData.mainMetrics.map((metric, index) => renderMainMetric(metric, index))}
            </View>

            {/* Comparison Section */}
            <View style={styles.comparisonSection}>
                <View style={styles.comparisonHeader}>
                    {loading ? (
                        <SkeletonBox width={120} height={14} />
                    ) : (
                        <>
                            <FontAwesome6 name="arrow-trend-up" size={14} color="#6B7280" />
                            <Text style={styles.comparisonTitle}>Comparación con ayer</Text>
                        </>
                    )}
                </View>
                <View style={styles.comparisonGrid}>
                    {currentData.comparisons.map((comparison, index) => renderComparison(comparison, index))}
                </View>
            </View>

            {/* Insights Section */}
            <View style={styles.insightsSection}>
                <View style={styles.insightsHeader}>
                    {loading ? (
                        <SkeletonBox width={120} height={14} />
                    ) : (
                        <>
                            <AntDesign name="bar-chart" size={14} color="#6B7280" />
                            <Text style={styles.insightsTitle}>Desglose del día</Text>
                        </>
                    )}
                </View>
                <View style={styles.insightsList}>
                    {currentData.insights.map((insight, index) => renderInsight(insight, index))}
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginTop: 5,
        padding: 16,
        marginBottom: 20,
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
        color: '#1F2937'
    },
    mainMetrics: {
        marginBottom: 20
    },
    mainMetricItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8
    },
    metricLeft: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8
    },
    metricLabel: {
        fontSize: 14,
        color: '#6B7280'
    },
    metricValue: {
        fontSize: 16,
        fontWeight: '600'
    },
    comparisonSection: {
        marginBottom: 20
    },
    comparisonHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },
    comparisonTitle: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 6
    },
    comparisonGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8
    },
    comparisonCard: {
        flex: 1,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center'
    },
    comparisonPercentage: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4
    },
    comparisonLabel: {
        fontSize: 12,
        color: '#6B7280'
    },
    insightsSection: {
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 16
    },
    insightsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },
    insightsTitle: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 6
    },
    insightsList: {
        gap: 8
    },
    insightItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6
    },
    insightLabel: {
        fontSize: 14,
        color: '#6B7280'
    },
    insightValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937'
    }
})

export default DailyPerformance