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

function ModalMonthlyReport({
    showModal,
    setShowModal,
}: any) {
    const [loading, setLoading] = useState(false);

    const monthlyComparisons = [
        {
            label: 'Ventas',
            percentage: '+15.3%',
            color: 'white'
        },
        {
            label: 'Gastos',
            percentage: '+10.2%',
            color: 'white'
        },
        {
            label: 'Utilidad',
            percentage: '+28.3%',
            color: 'white'
        }
    ];

    const evolutionData = [
        {
            category: 'Ventas',
            percentage: '+15.3%',
            startValue: '$8.5M',
            endValue: '$9.8M',
            color: '#10B981',
            barColor: '#10B981'
        },
        {
            category: 'Gastos',
            percentage: '+10.2%',
            startValue: '$6.1M',
            endValue: '$6.7M',
            color: '#F97316',
            barColor: '#F97316'
        },
        {
            category: 'Utilidad',
            percentage: '+28.3%',
            startValue: '$2.4M',
            endValue: '$3.1M',
            color: '#3B82F6',
            barColor: '#3B82F6'
        }
    ];

    const attentionPoints = [
        'Gastos en servicios aumentaron 18%',
        'Nuevo récord de ventas el viernes 14',
        'Producto "Empanadas" en declive (-12%)'
    ];

    const renderComparisonCard = (item: any, index: any) => {
        return (
            <View key={index} style={styles.comparisonCard}>
                <Text style={styles.comparisonPercentage}>{item.percentage}</Text>
                <Text style={styles.comparisonLabel}>{item.label}</Text>
            </View>
        );
    };

    const renderEvolutionItem = (item: any, index: any) => {
        return (
            <View key={index} style={styles.evolutionItem}>
                <View style={styles.evolutionHeader}>
                    <Text style={styles.evolutionCategory}>{item.category}</Text>
                    <Text style={[styles.evolutionPercentage, { color: item.color }]}>
                        {item.percentage}
                    </Text>
                </View>

                <View style={styles.evolutionBar}>
                    <View style={styles.evolutionBarBackground} />
                    <View
                        style={[
                            styles.evolutionBarFill,
                            { backgroundColor: item.barColor, width: '75%' }
                        ]}
                    />
                </View>

                <View style={styles.evolutionValues}>
                    <Text style={styles.evolutionStartValue}>{item.startValue}</Text>
                    <Text style={styles.evolutionEndValue}>{item.endValue}</Text>
                </View>
            </View>
        );
    };

    const renderAttentionPoint = (point: any, index: any) => {
        return (
            <View key={index} style={styles.attentionPoint}>
                <View style={styles.attentionDot} />
                <Text style={styles.attentionText}>{point}</Text>
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
                            <Text style={styles.headerTitle}>Comparativa Mensual</Text>
                            <Text style={styles.headerSubtitle}>Mayo vs Junio 2025</Text>

                            <View style={styles.comparisonContainer}>
                                {monthlyComparisons.map((item, index) => renderComparisonCard(item, index))}
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
                            {/* Evolution Section */}
                            <View style={styles.evolutionSection}>
                                <Text style={styles.sectionTitle}>Evolución Mensual</Text>
                                <View style={styles.evolutionList}>
                                    {evolutionData.map((item, index) => renderEvolutionItem(item, index))}
                                </View>
                            </View>

                            {/* Attention Points */}
                            <View style={styles.attentionSection}>
                                <View style={styles.attentionHeader}>
                                    <MaterialIcons name="warning" size={16} color="#F59E0B" />
                                    <Text style={styles.attentionTitle}>Puntos de Atención</Text>
                                </View>
                                <View style={styles.attentionList}>
                                    {attentionPoints.map((point, index) => renderAttentionPoint(point, index))}
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
        height: "auto",
        flexDirection: 'column'
    },
    header: {
        backgroundColor: '#8B5CF6',
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
    comparisonContainer: {
        flexDirection: 'row',
        gap: 16,
        width:"100%",
        justifyContent:'space-evenly'
    },
    comparisonCard: {
        alignItems: 'center'
    },
    comparisonPercentage: {
        fontSize: 20,
        fontWeight: '700',
        color: 'white',
        marginBottom: 4
    },
    comparisonLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)'
    },
    scrollContent: {
      
    },
    scrollContentContainer: {
        paddingTop: 0
    },
    contentPadding: {
        paddingHorizontal: 20,
        paddingBottom: 20
    },
    evolutionSection: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        marginBottom: 16
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 16
    },
    evolutionList: {
        gap: 20
    },
    evolutionItem: {

    },
    evolutionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    evolutionCategory: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937'
    },
    evolutionPercentage: {
        fontSize: 14,
        fontWeight: '600'
    },
    evolutionBar: {
        height: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 4,
        marginBottom: 8,
        position: 'relative'
    },
    evolutionBarBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#F3F4F6',
        borderRadius: 4
    },
    evolutionBarFill: {
        height: 8,
        borderRadius: 4,
        position: 'absolute',
        top: 0,
        left: 0
    },
    evolutionValues: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    evolutionStartValue: {
        fontSize: 12,
        color: '#6B7280'
    },
    evolutionEndValue: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1F2937'
    },
    attentionSection: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20
    },
    attentionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },
    attentionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginLeft: 8
    },
    attentionList: {
        gap: 8
    },
    attentionPoint: {
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    attentionDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#F59E0B',
        marginTop: 6,
        marginRight: 8
    },
    attentionText: {
        fontSize: 13,
        color: '#4B5563',
        flex: 1,
        lineHeight: 18
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 10
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

export default ModalMonthlyReport;