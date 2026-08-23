import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const DailyPerformanceChart = () => {
    const dailyData = [
        { day: 'Lun', value: '$320K', progress: 0.6, color: '#EF4444' },
        { day: 'Mar', value: '$380K', progress: 0.75, color: '#F97316' },
        { day: 'Mié', value: '$420K', progress: 0.85, color: '#EAB308' },
        { day: 'Jue', value: '$450K', progress: 0.9, color: '#10B981' },
        { day: 'Vie', value: '$480K', progress: 0.95, color: '#3B82F6' },
        { day: 'Sáb', value: '$440K', progress: 0.88, color: '#6366F1' },
        { day: 'Dom', value: '$360K', progress: 0.72, color: '#8B5CF6' }
    ]

    return (
        <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
                <MaterialIcons name="calendar-today" size={20} color="#1E293B" />
                <Text style={styles.chartTitle}>Rendimiento Diario</Text>
            </View>
            
            <View style={styles.chartContent}>
                {dailyData.map((item, index) => (
                    <View key={index} style={styles.chartRow}>
                        <View style={styles.dayIndicator}>
                            <View 
                                style={[
                                    styles.colorDot, 
                                    { backgroundColor: item.color }
                                ]} 
                            />
                            <Text style={styles.dayText}>{item.day}</Text>
                        </View>
                        
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBackground}>
                                <View 
                                    style={[
                                        styles.progressBar,
                                        { 
                                            width: `${item.progress * 100}%`,
                                            backgroundColor: item.color
                                        }
                                    ]} 
                                />
                            </View>
                        </View>
                        
                        <Text style={styles.valueText}>{item.value}</Text>
                    </View>
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    chartContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20
    },
    chartHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        marginLeft: 8
    },
    chartContent: {
        gap: 12
    },
    chartRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    dayIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 60
    },
    colorDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8
    },
    dayText: {
        fontSize: 14,
        color: '#1E293B',
        fontWeight: '500'
    },
    progressContainer: {
        flex: 1,
        marginHorizontal: 12
    },
    progressBackground: {
        height: 6,
        backgroundColor: '#F1F5F9',
        borderRadius: 3
    },
    progressBar: {
        height: 6,
        borderRadius: 3
    },
    valueText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
        minWidth: 60,
        textAlign: 'right'
    }
})

export default DailyPerformanceChart