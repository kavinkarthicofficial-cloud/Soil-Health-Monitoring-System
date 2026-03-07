import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, RefreshControl } from 'react-native';
import Header from '../components/Header';
import GaugeCard from '../components/GaugeCard';
import dataService from '../services/DataService';

export default function DashboardScreen() {
    const [data, setData] = useState(null);
    const [connected, setConnected] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState('');

    useEffect(() => {
        const unsubscribe = dataService.subscribe((newData, isConnected) => {
            setData(newData);
            setConnected(isConnected);
            setLastUpdated(new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }));
        });
        return unsubscribe;
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await dataService.fetchData();
        setRefreshing(false);
    };

    const getSignalLabel = (dbm) => {
        if (!dbm) return '--';
        if (dbm > -50) return 'Excellent';
        if (dbm > -70) return 'Good';
        if (dbm > -80) return 'Fair';
        return 'Weak';
    };

    return (
        <View style={styles.container}>
            <Header
                title="🌾 AgroPulse"
                subtitle={lastUpdated ? `Updated: ${lastUpdated}` : 'Connecting to Pico...'}
                connected={connected}
            />
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4A9B5E']} />
                }
            >
                {!data ? (
                    <View style={styles.loadingCard}>
                        <Text style={styles.loadingIcon}>📡</Text>
                        <Text style={styles.loadingText}>Connecting to AgroPulse...</Text>
                        <Text style={styles.loadingSubtext}>Make sure you're connected to ESP32 WiFi hotspot</Text>
                    </View>
                ) : (
                    <>
                        {/* Section: Soil Analysis */}
                        <Text style={styles.sectionTitle}>🌱 Soil Analysis</Text>
                        <View style={styles.row}>
                            <GaugeCard
                                icon="💧"
                                label="Soil Moisture"
                                value={data.soilMoisture}
                                unit="%"
                                thresholds={{ criticalBelow: 30, warningBelow: 45 }}
                                style={styles.halfCard}
                            />
                            <GaugeCard
                                icon="🌡️"
                                label="Temperature"
                                value={data.soilTemperature}
                                unit="°C"
                                thresholds={{ criticalAbove: 40, warningAbove: 35, criticalBelow: 10, warningBelow: 15 }}
                                style={styles.halfCard}
                            />
                        </View>
                        <View style={styles.row}>
                            <GaugeCard
                                icon="⚡"
                                label="Conductivity"
                                value={data.electricalConductivity}
                                unit="dS/m"
                                thresholds={{ criticalAbove: 4, warningAbove: 3 }}
                                style={styles.halfCard}
                            />
                            <GaugeCard
                                icon="🧪"
                                label="Soil pH"
                                value={data.pH}
                                unit=""
                                thresholds={{ criticalBelow: 5.0, warningBelow: 5.5, criticalAbove: 8.0, warningAbove: 7.5 }}
                                style={styles.halfCard}
                            />
                        </View>

                        {/* Section: Environment */}
                        <Text style={styles.sectionTitle}>🌤️ Environment</Text>
                        <View style={styles.row}>
                            <GaugeCard
                                icon="💨"
                                label="Humidity"
                                value={data.humidity}
                                unit="%"
                                thresholds={{ criticalAbove: 90, warningAbove: 80, criticalBelow: 25, warningBelow: 35 }}
                                style={styles.halfCard}
                            />
                            <GaugeCard
                                icon="🌊"
                                label="Water Level"
                                value={data.waterLevel}
                                unit="%"
                                thresholds={{ criticalBelow: 15, warningBelow: 30 }}
                                style={styles.halfCard}
                            />
                        </View>

                        {/* Section: System Status */}
                        <Text style={styles.sectionTitle}>📟 System Status</Text>
                        <View style={styles.row}>
                            <GaugeCard
                                icon="🔋"
                                label="Battery"
                                value={data.batteryLevel}
                                unit="%"
                                thresholds={{ criticalBelow: 20, warningBelow: 35 }}
                                style={styles.halfCard}
                            />
                            <View style={[styles.halfCard, styles.signalCard]}>
                                <View style={styles.signalInner}>
                                    <Text style={styles.signalIcon}>📶</Text>
                                    <Text style={styles.signalLabel}>Signal</Text>
                                    <Text style={styles.signalValue}>{data.signalStrength} dBm</Text>
                                    <Text style={styles.signalQuality}>{getSignalLabel(data.signalStrength)}</Text>
                                    <View style={styles.signalBars}>
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <View
                                                key={i}
                                                style={[
                                                    styles.bar,
                                                    { height: 6 + i * 6 },
                                                    {
                                                        backgroundColor:
                                                            data.signalStrength > -30 - i * 12
                                                                ? '#38A169'
                                                                : '#E2E8F0',
                                                    },
                                                ]}
                                            />
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.infoCard}>
                            <Text style={styles.infoIcon}>🧠</Text>
                            <Text style={styles.infoText}>
                                AgroPulse is receiving data from Raspberry Pi Pico via ESP32. Refreshing every 5s.
                            </Text>
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F7EC',
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1A4D2E',
        marginTop: 8,
        marginBottom: 10,
        marginLeft: 2,
        letterSpacing: 0.3,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfCard: {
        flex: 1,
    },
    loadingCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        marginTop: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    loadingIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    loadingText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2D5A3D',
        marginBottom: 8,
    },
    loadingSubtext: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
    },
    signalCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    signalInner: {
        padding: 18,
        alignItems: 'center',
    },
    signalIcon: {
        fontSize: 22,
        marginBottom: 4,
    },
    signalLabel: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
        marginBottom: 4,
    },
    signalValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2D5A3D',
    },
    signalQuality: {
        fontSize: 13,
        color: '#38A169',
        fontWeight: '600',
        marginBottom: 8,
    },
    signalBars: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 4,
    },
    bar: {
        width: 8,
        borderRadius: 3,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#E6F4EA',
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
        marginTop: 4,
    },
    infoIcon: {
        fontSize: 22,
        marginRight: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#2D5A3D',
        lineHeight: 20,
    },
});
