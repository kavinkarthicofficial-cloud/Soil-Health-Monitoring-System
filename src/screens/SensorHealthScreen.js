import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, Dimensions } from 'react-native';
import Header from '../components/Header';
import dataService from '../services/DataService';

export default function SensorHealthScreen() {
    const [data, setData] = useState(null);
    const [connected, setConnected] = useState(false);
    const [progressBarWidth, setProgressBarWidth] = useState(Dimensions.get('window').width - 100);

    useEffect(() => {
        const unsubscribe = dataService.subscribe((newData, isConnected) => {
            setData(newData);
            setConnected(isConnected);
        });
        return unsubscribe;
    }, []);

    const health = data?.sensorHealth;
    const healthScore = health?.healthScore || 0;
    const healthColor = healthScore >= 70 ? '#38A169' : healthScore >= 40 ? '#ED8936' : '#E53E3E';
    const healthLabel = healthScore >= 70 ? 'Good' : healthScore >= 40 ? 'Fair' : 'Poor';

    return (
        <View style={styles.container}>
            <Header
                title="📡 Sensor Health"
                subtitle="Predictive maintenance from Pico W AI"
                connected={connected}
            />
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                {!data ? (
                    <View style={styles.loadingCard}>
                        <Text style={styles.loadingIcon}>📡</Text>
                        <Text style={styles.loadingText}>Loading sensor data...</Text>
                    </View>
                ) : (
                    <>
                        {/* Health Score Gauge */}
                        <View style={styles.gaugeCard}>
                            <Text style={styles.gaugeTitle}>OVERALL HEALTH</Text>
                            <View style={styles.gaugeContainer}>
                                <View style={[styles.gaugeOuter, { borderColor: healthColor }]}>
                                    <Text style={[styles.gaugeValue, { color: healthColor }]}>
                                        {healthScore}
                                    </Text>
                                    <Text style={styles.gaugePercent}>%</Text>
                                </View>
                            </View>
                            <View style={[styles.healthBadge, { backgroundColor: healthColor + '20', borderColor: healthColor }]}>
                                <Text style={[styles.healthBadgeText, { color: healthColor }]}>{healthLabel}</Text>
                            </View>
                            {/* Progress bar */}
                            <View style={styles.progressContainer}
                                onLayout={(e) => setProgressBarWidth(e.nativeEvent.layout.width)}
                            >
                                <View style={styles.progressBg}>
                                    <View style={[styles.progressFill, { width: (progressBarWidth * healthScore) / 100, backgroundColor: healthColor }]} />
                                </View>
                                <View style={styles.progressLabels}>
                                    <Text style={styles.progressLabel}>0%</Text>
                                    <Text style={styles.progressLabel}>50%</Text>
                                    <Text style={styles.progressLabel}>100%</Text>
                                </View>
                            </View>
                        </View>

                        {/* Drift Detection */}
                        <View style={styles.metricCard}>
                            <View style={styles.metricRow}>
                                <View style={styles.metricLeft}>
                                    <Text style={styles.metricIcon}>🔄</Text>
                                    <View>
                                        <Text style={styles.metricLabel}>Drift Detected</Text>
                                        <Text style={styles.metricDesc}>Sensor reading deviation from baseline</Text>
                                    </View>
                                </View>
                                <View style={[
                                    styles.yesNoBadge,
                                    { backgroundColor: health.driftDetected ? '#FED7D7' : '#C6F6D5' }
                                ]}>
                                    <Text style={[
                                        styles.yesNoText,
                                        { color: health.driftDetected ? '#E53E3E' : '#38A169' }
                                    ]}>
                                        {health.driftDetected ? 'YES' : 'NO'}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Calibration Needed */}
                        <View style={styles.metricCard}>
                            <View style={styles.metricRow}>
                                <View style={styles.metricLeft}>
                                    <Text style={styles.metricIcon}>🔧</Text>
                                    <View>
                                        <Text style={styles.metricLabel}>Calibration Needed In</Text>
                                        <Text style={styles.metricDesc}>Days until next calibration due</Text>
                                    </View>
                                </View>
                                <View style={styles.daysContainer}>
                                    <Text style={[
                                        styles.daysValue,
                                        { color: health.calibrationDays < 7 ? '#E53E3E' : health.calibrationDays < 30 ? '#ED8936' : '#38A169' }
                                    ]}>
                                        {health.calibrationDays}
                                    </Text>
                                    <Text style={styles.daysUnit}>days</Text>
                                </View>
                            </View>
                        </View>

                        {/* Replace Sensor Alert */}
                        {health.replaceAlert && (
                            <View style={styles.replaceAlert}>
                                <Text style={styles.replaceIcon}>⚠️</Text>
                                <View style={styles.replaceContent}>
                                    <Text style={styles.replaceTitle}>Sensor Replacement Required</Text>
                                    <Text style={styles.replaceMsg}>
                                        Health score is below 40%. The sensor may provide inaccurate readings.
                                        Please replace the sensor as soon as possible.
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Sensor Details */}
                        <View style={styles.detailsCard}>
                            <Text style={styles.detailsTitle}>Sensor Details</Text>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Type</Text>
                                <Text style={styles.detailValue}>Capacitive Soil Moisture</Text>
                            </View>
                            <View style={styles.separator} />
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Model</Text>
                                <Text style={styles.detailValue}>SEN-SOIL-V3</Text>
                            </View>
                            <View style={styles.separator} />
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>AI Model</Text>
                                <Text style={styles.detailValue}>Raspberry Pi Pico (TFLite)</Text>
                            </View>
                            <View style={styles.separator} />
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Communication</Text>
                                <Text style={styles.detailValue}>ESP32 → Pico (I2C)</Text>
                            </View>
                        </View>

                        <View style={styles.infoNote}>
                            <Text style={styles.infoIcon}>🧠</Text>
                            <Text style={styles.infoText}>
                                Degradation predictions computed by Pico W AI → relayed via ESP32 → displayed in AgroPulse.
                            </Text>
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
    loadingCard: {
        backgroundColor: '#FFF', borderRadius: 20, padding: 40,
        alignItems: 'center', marginTop: 40,
    },
    loadingIcon: { fontSize: 48, marginBottom: 16 },
    loadingText: { fontSize: 20, fontWeight: '700', color: '#2D5A3D' },

    gaugeCard: {
        backgroundColor: '#FFF', borderRadius: 20, padding: 28,
        alignItems: 'center', marginBottom: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1, shadowRadius: 12, elevation: 5,
    },
    gaugeTitle: {
        fontSize: 13, fontWeight: '700', color: '#888',
        letterSpacing: 1.5, marginBottom: 20,
    },
    gaugeContainer: { marginBottom: 16 },
    gaugeOuter: {
        width: 140, height: 140, borderRadius: 70,
        borderWidth: 8, justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#FAFAFA',
    },
    gaugeValue: { fontSize: 48, fontWeight: '800' },
    gaugePercent: { fontSize: 20, color: '#999', marginTop: -8 },
    healthBadge: {
        paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20,
        borderWidth: 1.5, marginBottom: 20,
    },
    healthBadgeText: { fontSize: 16, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    progressContainer: { alignSelf: 'stretch' },
    progressBg: {
        height: 10, backgroundColor: '#E2E8F0', borderRadius: 5,
        overflow: 'hidden',
    },
    progressFill: { height: 10, borderRadius: 5 },
    progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
    progressLabel: { fontSize: 11, color: '#AAA' },

    metricCard: {
        backgroundColor: '#FFF', borderRadius: 16, padding: 18,
        marginBottom: 12, shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06,
        shadowRadius: 6, elevation: 2,
    },
    metricRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    metricLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
    metricIcon: { fontSize: 28, marginRight: 14 },
    metricLabel: { fontSize: 17, fontWeight: '700', color: '#333' },
    metricDesc: { fontSize: 12, color: '#999', marginTop: 2 },
    yesNoBadge: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14 },
    yesNoText: { fontSize: 18, fontWeight: '800' },
    daysContainer: { alignItems: 'center' },
    daysValue: { fontSize: 32, fontWeight: '800' },
    daysUnit: { fontSize: 12, color: '#999', fontWeight: '500' },

    replaceAlert: {
        flexDirection: 'row', backgroundColor: '#FFF5F5', borderRadius: 16,
        padding: 18, marginBottom: 12, borderLeftWidth: 5, borderLeftColor: '#E53E3E',
    },
    replaceIcon: { fontSize: 32, marginRight: 14 },
    replaceContent: { flex: 1 },
    replaceTitle: { fontSize: 18, fontWeight: '800', color: '#E53E3E', marginBottom: 6 },
    replaceMsg: { fontSize: 14, color: '#666', lineHeight: 21 },

    detailsCard: {
        backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    },
    detailsTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 16 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
    detailLabel: { fontSize: 14, color: '#888', fontWeight: '500' },
    detailValue: { fontSize: 14, color: '#333', fontWeight: '600' },
    separator: { height: 1, backgroundColor: '#F0F0F0' },

    infoNote: {
        flexDirection: 'row', backgroundColor: '#E6F4EA', borderRadius: 14,
        padding: 16, alignItems: 'center',
    },
    infoIcon: { fontSize: 22, marginRight: 12 },
    infoText: { flex: 1, fontSize: 13, color: '#2D5A3D', lineHeight: 19 },
});
