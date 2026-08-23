import { AntDesign, Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    ScrollView,
    View,
    TouchableOpacity,
    Text
} from "react-native";

function ModalDailyReport({
    showModal,
    setShowModal,
}: any) {
    const [loading, setLoading] = useState(false);

    const dailyMetrics = [
        {
            label: 'Ventas',
            value: '$920K',
            color: '#10B981'
        },
        {
            label: 'Gastos',
            value: '$630K',
            color: '#EF4444'
        },
        {
            label: 'Margen',
            value: '31.5%',
            color: '#3B82F6'
        }
    ];

    const topProducts = [
        {
            rank: 1,
            name: 'Jugos naturales',
            units: '28 unidades',
            margin: '62% margen',
            value: '$420K',
            color: '#F97316'
        },
        {
            rank: 2,
            name: 'Empanadas',
            units: '24 unidades',
            margin: '58% margen',
            value: '$350K',
            color: '#10B981'
        },
        {
            rank: 3,
            name: 'Café',
            units: '18 unidades',
            margin: '45% margen',
            value: '$140K',
            color: '#EAB308'
        }
    ];

    const yesterdayComparison = [
        {
            label: 'Ventas',
            percentage: '+8%',
            color: '#10B981'
        },
        {
            label: 'Gastos',
            percentage: '+9%',
            color: '#EF4444'
        },
        {
            label: 'Utilidad',
            percentage: '+7%',
            color: '#3B82F6'
        }
    ];

    const operationalMetrics = [
        {
            label: 'Transacciones totales',
            value: '47'
        },
        {
            label: 'Productos vendidos',
            value: '156'
        },
        {
            label: 'Ticket promedio',
            value: '$19.6K'
        },
        {
            label: 'Clientes atendidos',
            value: '42'
        }
    ];

    const observations = [
        'Jugos naturales superaron expectativas (+28 unidades)',
        'Gastos en transporte ligeramente altos ($45K)'
    ];

    const renderDailyMetric = (metric: any, index: any) => {
        return (
            <View key={index} style={styles.dailyMetricCard}>
                <Text style={[styles.metricValue, { color: metric.color }]}>{metric.value}</Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>
        );
    };

    const renderTopProduct = (product: any, index: any) => {
        return (
            <View key={index} style={styles.productItem}>
                <View style={styles.productRank}>
                    <View style={[styles.rankCircle, { backgroundColor: product.color }]}>
                        <Text style={styles.rankNumber}>{product.rank}</Text>
                    </View>
                </View>
                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productDetails}>{product.units} • {product.margin}</Text>
                </View>
                <Text style={styles.productValue}>{product.value}</Text>
            </View>
        );
    };

    const renderYesterdayComparison = (comparison: any, index: any) => {
        return (
            <View key={index} style={styles.comparisonItem}>
                <Text style={[styles.comparisonPercentage, { color: comparison.color }]}>
                    {comparison.percentage}
                </Text>
                <Text style={styles.comparisonLabel}>{comparison.label}</Text>
            </View>
        );
    };

    const renderOperationalMetric = (metric: any, index: any) => {
        return (
            <View key={index} style={styles.operationalItem}>
                <Text style={styles.operationalLabel}>{metric.label}</Text>
                <Text style={styles.operationalValue}>{metric.value}</Text>
            </View>
        );
    };

    const renderObservation = (observation: any, index: any) => {
        return (
            <View key={index} style={styles.observationItem}>
                <View style={styles.observationDot} />
                <Text style={styles.observationText}>{observation}</Text>
            </View>
        );
    };

    return (
        <Modal visible={showModal} transparent={true} animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <Text style={styles.headerTitle}>Reporte Diario</Text>
                            <Text style={styles.headerSubtitle}>Miércoles, 19 Junio 2025</Text>

                            <View style={styles.headerStats}>
                                <AntDesign name="clock-circle" size={24} color="rgba(255,255,255,0.9)" />
                                <View style={styles.mainMetric}>
                                    <Text style={styles.mainValue}>$290K</Text>
                                    <Text style={styles.mainLabel}>Utilidad del día</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Scrollable content */}
                    <ScrollView
                        style={styles.scrollContent}
                        contentContainerStyle={styles.scrollContentContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.contentPadding}>
                            {/* Daily Metrics */}
                            <View style={styles.metricsContainer}>
                                {dailyMetrics.map((metric, index) => renderDailyMetric(metric, index))}
                            </View>

                            {/* Top Products */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <MaterialIcons name="emoji-events" size={16} color="#F59E0B" />
                                    <Text style={styles.sectionTitle}>Productos del Día</Text>
                                </View>
                                <View style={styles.productsList}>
                                    {topProducts.map((product, index) => renderTopProduct(product, index))}
                                </View>
                            </View>

                            {/* Yesterday Comparison */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <AntDesign name="arrow-up" size={14} color="#6B7280" />
                                    <Text style={styles.sectionTitle}>vs Ayer</Text>
                                </View>
                                <View style={styles.comparisonContainer}>
                                    {yesterdayComparison.map((comparison, index) => renderYesterdayComparison(comparison, index))}
                                </View>
                            </View>

                            {/* Operational Metrics */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Métricas Operativas</Text>
                                <View style={styles.operationalList}>
                                    {operationalMetrics.map((metric, index) => renderOperationalMetric(metric, index))}
                                </View>
                            </View>

                            {/* Observations */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <MaterialIcons name="visibility" size={16} color="#6B7280" />
                                    <Text style={styles.sectionTitle}>Observaciones</Text>
                                </View>
                                <View style={styles.observationsList}>
                                    {observations.map((observation, index) => renderObservation(observation, index))}
                                </View>
                            </View>

                            {/* Action buttons */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.exportButton}>
                                    <MaterialIcons name="description" size={20} color="white" />
                                    <Text style={styles.exportButtonText}>Exportar PDF</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.shareButton}>
                                    <MaterialIcons name="share" size={20} color="#10B981" />
                                    <Text style={styles.shareButtonText}>Compartir</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowModal(false)}
                            >
                                <MaterialIcons name="close" size={20} color="#64748B" />
                                <Text style={styles.closeButtonText}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
    },
    modalContent: {
        backgroundColor: "#F8FAFC",
        borderRadius: 16,
        width: "100%",
        height: "90%",
        flexDirection: 'column'
    },
    header: {
        backgroundColor: '#FF5722',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingTop: 20,
        paddingBottom: 25,
        paddingHorizontal: 20
    },
    headerContent: {
        alignItems: 'flex-start'
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: 'white',
        marginBottom: 4
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 20
    },
    headerStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16
    },
    mainMetric: {
        alignItems: 'flex-start'
    },
    mainValue: {
        fontSize: 24,
        fontWeight: '700',
        color: 'white',
        marginBottom: 4
    },
    mainLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)'
    },
    scrollContent: {
        flex: 1
    },
    scrollContentContainer: {
        paddingTop: 0
    },
    contentPadding: {
        paddingHorizontal: 20,
        paddingBottom: 20
    },
    metricsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 16,
        marginBottom: 20
    },
    dailyMetricCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center'
    },
    metricValue: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4
    },
    metricLabel: {
        fontSize: 12,
        color: '#6B7280'
    },
    section: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginLeft: 8
    },
    productsList: {
        gap: 12
    },
    productItem: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    productRank: {
        marginRight: 12
    },
    rankCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    rankNumber: {
        fontSize: 12,
        fontWeight: '700',
        color: 'white'
    },
    productInfo: {
        flex: 1
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2
    },
    productDetails: {
        fontSize: 12,
        color: '#6B7280'
    },
    productValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937'
    },
    comparisonContainer: {
        flexDirection: 'row',
        gap: 16
    },
    comparisonItem: {
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
    operationalList: {
        gap: 8
    },
    operationalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4
    },
    operationalLabel: {
        fontSize: 14,
        color: '#6B7280'
    },
    operationalValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937'
    },
    observationsList: {
        gap: 8
    },
    observationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    observationDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10B981',
        marginTop: 6,
        marginRight: 8
    },
    observationText: {
        fontSize: 13,
        color: '#4B5563',
        flex: 1,
        lineHeight: 18
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 10,
        marginTop: 10
    },
    exportButton: {
        backgroundColor: '#10B981',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        flex: 1
    },
    exportButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    },
    shareButton: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        flex: 1,
        borderWidth: 1,
        borderColor: '#10B981'
    },
    shareButtonText: {
        color: '#10B981',
        fontSize: 16,
        fontWeight: '600'
    },
    closeButton: {
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8
    },
    closeButtonText: {
        color: '#64748B',
        fontSize: 16,
        fontWeight: '600'
    }
});

export default ModalDailyReport;