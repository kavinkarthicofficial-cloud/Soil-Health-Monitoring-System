import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Header from '../components/Header';
import dataService from '../services/DataService';

const screenWidth = Dimensions.get('window').width - 48;

const RANGES = [
    { label: '6h', hours: 6 },
    { label: '12h', hours: 12 },
    { label: '24h', hours: 24 },
];

const chartConfig = {
    backgroundColor: '#FFF',
    backgroundGradientFrom: '#FFF',
    backgroundGradientTo: '#FFF',
    decimalCount: 1,
    color: (opacity = 1) => `rgba(74, 155, 94, ${opacity})`,
    labelColor: () => '#999',
    propsForDots: { r: '3', strokeWidth: '1', stroke: '#4A9B5E' },
    propsForBackgroundLines: { stroke: '#F0F0F0' },
    style: { borderRadius: 16 },
};

const sampleData = (data, maxPoints = 12) => {
    if (data.length <= maxPoints) return data;
    const step = Math.ceil(data.length / maxPoints);
    return data.filter((_, i) => i % step === 0);
};

export default function HistoryScreen() {
    const [data, setData] = useState([]);
    const [connected, setConnected] = useState(false);
    const [range, setRange] = useState(24);

    useEffect(() => {
        const unsubscribe = dataService.subscribe((_, isConnected) => {
            setConnected(isConnected);
            const history = dataService.getHistoricalData(range);
            setData(history);
        });
        return unsubscribe;
    }, [range]);

    const sampled = sampleData(data);
    const labels = sampled.map(d => d.time || '');
    const moistureValues = sampled.map(d => d.moisture || 0);
    const tempValues = sampled.map(d => d.temperature || 0);
    const humidityValues = sampled.map(d => d.humidity || 0);
    const pHValues = sampled.map(d => d.pH || 0);
    const healthValues = sampled.map(d => d.sensorHealth || 0);
    const irrigationValues = sampled.map(d => d.irrigated ? 1 : 0);

    const renderChart = (title, icon, values, color, suffix = '', yMin, yMax) => {
        if (values.length === 0) return null;
        const config = {
            ...chartConfig,
            color: (opacity = 1) => color.replace('1)', `${opacity})`),
            propsForDots: { r: '3', strokeWidth: '1', stroke: color },
        };
        return (
            <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                    <Text style={styles.chartIcon}>{icon}</Text>
                    <Text style={styles.chartTitle}>{title}</Text>
                </View>
                <LineChart
                    data={{
                        labels: labels.filter((_, i) => i % 3 === 0),
                        datasets: [{ data: values.length > 0 ? values : [0] }],
                    }}
                    width={screenWidth}
                    height={180}
                    chartConfig={config}
                    bezier
                    style={styles.chart}
                    withInnerLines={false}
                    withOuterLines={true}
                    fromZero={yMin === 0}
                    yAxisSuffix={suffix}
                />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Header
                title="📊 History"
                subtitle="Sensor data trends over time"
                connected={connected}
            />
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                {/* Time Range Selector */}
                <View style={styles.rangeSelector}>
                    {RANGES.map(r => (
                        <TouchableOpacity
                            key={r.hours}
                            style={[styles.rangeBtn, range === r.hours && styles.rangeBtnActive]}
                            onPress={() => setRange(r.hours)}
                        >
                            <Text style={[styles.rangeBtnText, range === r.hours && styles.rangeBtnTextActive]}>
                                {r.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {data.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyIcon}>📈</Text>
                        <Text style={styles.emptyText}>No history data yet</Text>
                        <Text style={styles.emptySubtext}>Data will appear as readings are collected</Text>
                    </View>
                ) : (
                    <>
                        {renderChart('Soil Moisture', '💧', moistureValues, 'rgba(56, 161, 105, 1)', '%', 0, 100)}
                        {renderChart('Temperature', '🌡️', tempValues, 'rgba(237, 137, 54, 1)', '°', null, null)}
                        {renderChart('Humidity', '💨', humidityValues, 'rgba(99, 179, 237, 1)', '%', 0, 100)}
                        {renderChart('Soil pH', '🧪', pHValues, 'rgba(159, 122, 234, 1)', '', null, null)}
                        {renderChart('Sensor Health', '📡', healthValues, 'rgba(66, 153, 225, 1)', '%', 0, 100)}

                        {/* Irrigation Events */}
                        <View style={styles.chartCard}>
                            <View style={styles.chartHeader}>
                                <Text style={styles.chartIcon}>🚿</Text>
                                <Text style={styles.chartTitle}>Irrigation Events</Text>
                            </View>
                            <View style={styles.irrigationTimeline}>
                                {sampled.map((d, i) => (
                                    <View key={i} style={styles.timelineItem}>
                                        <View style={[
                                            styles.timelineDot,
                                            { backgroundColor: d.irrigated ? '#38A169' : '#E2E8F0' }
                                        ]} />
                                        {d.irrigated && <Text style={styles.timelineLabel}>{d.time}</Text>}
                                    </View>
                                ))}
                            </View>
                            <Text style={styles.timelineHint}>Green dots = irrigation events</Text>
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F7EC' },
    scroll: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 30 },

    rangeSelector: {
        flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 14,
        padding: 4, marginBottom: 16, shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06,
        shadowRadius: 6, elevation: 2,
    },
    rangeBtn: {
        flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
    },
    rangeBtnActive: { backgroundColor: '#2D8A4E' },
    rangeBtnText: { fontSize: 16, fontWeight: '700', color: '#888' },
    rangeBtnTextActive: { color: '#FFF' },

    chartCard: {
        backgroundColor: '#FFF', borderRadius: 16, padding: 18,
        marginBottom: 14, shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06,
        shadowRadius: 6, elevation: 2,
    },
    chartHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    chartIcon: { fontSize: 22, marginRight: 10 },
    chartTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
    chart: { borderRadius: 12, marginLeft: -10 },

    irrigationTimeline: {
        flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
        paddingVertical: 16, gap: 6,
    },
    timelineItem: { alignItems: 'center' },
    timelineDot: { width: 14, height: 14, borderRadius: 7 },
    timelineLabel: { fontSize: 9, color: '#38A169', marginTop: 4, fontWeight: '600' },
    timelineHint: { fontSize: 12, color: '#AAA', textAlign: 'center', marginTop: 4 },

    emptyCard: {
        backgroundColor: '#FFF', borderRadius: 20, padding: 40,
        alignItems: 'center', marginTop: 30,
    },
    emptyIcon: { fontSize: 48, marginBottom: 16 },
    emptyText: { fontSize: 20, fontWeight: '700', color: '#2D5A3D', marginBottom: 8 },
    emptySubtext: { fontSize: 14, color: '#888', textAlign: 'center' },
});
