import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Alert, Animated, Dimensions } from 'react-native';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import dataService from '../services/DataService';

export default function IrrigationScreen() {
    const [data, setData] = useState(null);
    const [connected, setConnected] = useState(false);
    const [irrigating, setIrrigating] = useState(false);
    const [pulseAnim] = useState(new Animated.Value(1));

    useEffect(() => {
        const unsubscribe = dataService.subscribe((newData, isConnected) => {
            setData(newData);
            setConnected(isConnected);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (irrigating) {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                ])
            );
            pulse.start();
            const timeout = setTimeout(() => {
                setIrrigating(false);
                pulse.stop();
                pulseAnim.setValue(1);
            }, 5000);
            return () => {
                clearTimeout(timeout);
                pulse.stop();
            };
        }
    }, [irrigating]);

    const handleIrrigate = () => {
        Alert.alert(
            '💧 Start Irrigation',
            'Are you sure you want to start manual irrigation?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Start',
                    style: 'default',
                    onPress: async () => {
                        setIrrigating(true);
                        const success = await dataService.triggerIrrigation();
                        if (!success) {
                            Alert.alert('Error', 'Could not connect to irrigation system.');
                            setIrrigating(false);
                        }
                    },
                },
            ]
        );
    };

    const irrigation = data?.irrigation;
    const statusColor = !irrigation ? '#999' :
        irrigation.status === 'Critical' ? '#E53E3E' :
            irrigation.status === 'Needed' ? '#ED8936' : '#38A169';

    return (
        <View style={styles.container}>
            <Header
                title="🤖 AI Irrigation"
                subtitle="Predictions from Raspberry Pi Pico W"
                connected={connected}
            />
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                {!data ? (
                    <View style={styles.loadingCard}>
                        <Text style={styles.loadingIcon}>🤖</Text>
                        <Text style={styles.loadingText}>Loading AI predictions...</Text>
                    </View>
                ) : (
                    <>
                        {/* Status Card */}
                        <View style={[styles.statusCard, { borderColor: statusColor }]}>
                            <Text style={styles.statusIcon}>
                                {irrigation.status === 'Critical' ? '🚨' :
                                    irrigation.status === 'Needed' ? '💧' : '✅'}
                            </Text>
                            <Text style={styles.statusTitle}>Irrigation Status</Text>
                            <StatusBadge status={irrigation.status} size="large" />
                            <Text style={styles.statusDescription}>
                                {irrigation.status === 'Critical' ? 'Soil is very dry! Immediate irrigation recommended.' :
                                    irrigation.status === 'Needed' ? 'Plants could use water soon.' :
                                        'Soil moisture levels are healthy. No irrigation needed.'}
                            </Text>
                        </View>

                        {/* Prediction Cards */}
                        <View style={styles.row}>
                            <View style={styles.predictionCard}>
                                <Text style={styles.predIcon}>💧</Text>
                                <Text style={styles.predLabel}>Water Required</Text>
                                <Text style={[styles.predValue, { color: statusColor }]}>
                                    {irrigation.waterRequired}
                                </Text>
                                <Text style={styles.predUnit}>liters</Text>
                            </View>
                            <View style={styles.predictionCard}>
                                <Text style={styles.predIcon}>⏰</Text>
                                <Text style={styles.predLabel}>Next Irrigation</Text>
                                <Text style={styles.predValue}>
                                    {irrigation.nextIrrigationTime}
                                </Text>
                                <Text style={styles.predUnit}>estimated</Text>
                            </View>
                        </View>

                        {/* Current Moisture Context */}
                        <View style={styles.contextCard}>
                            <View style={styles.contextRow}>
                                <Text style={styles.contextIcon}>🌱</Text>
                                <View style={styles.contextInfo}>
                                    <Text style={styles.contextLabel}>Current Soil Moisture</Text>
                                    <Text style={[styles.contextValue, { color: statusColor }]}>
                                        {data.soilMoisture}%
                                    </Text>
                                </View>
                                <View style={styles.moistureBar}>
                                    <View style={[
                                        styles.moistureFill,
                                        {
                                            width: (80 * Math.min(100, data.soilMoisture)) / 100,
                                            backgroundColor: statusColor,
                                        }
                                    ]} />
                                </View>
                            </View>
                        </View>

                        {/* Manual Trigger Button */}
                        <Animated.View style={{ transform: [{ scale: irrigating ? pulseAnim : 1 }] }}>
                            <TouchableOpacity
                                style={[
                                    styles.irrigateButton,
                                    irrigating && styles.irrigatingButton,
                                ]}
                                onPress={handleIrrigate}
                                disabled={irrigating}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.irrigateIcon}>
                                    {irrigating ? '🌊' : '💧'}
                                </Text>
                                <Text style={styles.irrigateText}>
                                    {irrigating ? 'Irrigating...' : 'Start Irrigation'}
                                </Text>
                                {irrigating && (
                                    <Text style={styles.irrigateSubtext}>Water is flowing to fields</Text>
                                )}
                            </TouchableOpacity>
                        </Animated.View>

                        <View style={styles.aiNote}>
                            <Text style={styles.aiNoteIcon}>🧠</Text>
                            <Text style={styles.aiNoteText}>
                                Predictions from Pico W edge AI → sent via ESP32 WiFi → displayed here in AgroPulse.
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

    statusCard: {
        backgroundColor: '#FFF', borderRadius: 20, padding: 28,
        alignItems: 'center', marginBottom: 16,
        borderWidth: 2, shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1,
        shadowRadius: 12, elevation: 5,
    },
    statusIcon: { fontSize: 48, marginBottom: 12 },
    statusTitle: { fontSize: 14, color: '#888', fontWeight: '600', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
    statusDescription: { fontSize: 16, color: '#555', textAlign: 'center', marginTop: 14, lineHeight: 24 },

    row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    predictionCard: {
        flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 20,
        alignItems: 'center', shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06,
        shadowRadius: 6, elevation: 2,
    },
    predIcon: { fontSize: 32, marginBottom: 8 },
    predLabel: { fontSize: 13, color: '#888', fontWeight: '500', marginBottom: 6 },
    predValue: { fontSize: 32, fontWeight: '800', color: '#2D5A3D' },
    predUnit: { fontSize: 13, color: '#AAA', fontWeight: '500', marginTop: 2 },

    contextCard: {
        backgroundColor: '#FFF', borderRadius: 16, padding: 18,
        marginBottom: 20, shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06,
        shadowRadius: 6, elevation: 2,
    },
    contextRow: { flexDirection: 'row', alignItems: 'center' },
    contextIcon: { fontSize: 28, marginRight: 14 },
    contextInfo: { flex: 1 },
    contextLabel: { fontSize: 13, color: '#888', fontWeight: '500' },
    contextValue: { fontSize: 22, fontWeight: '700' },
    moistureBar: {
        width: 80, height: 10, backgroundColor: '#E2E8F0',
        borderRadius: 5, overflow: 'hidden',
    },
    moistureFill: { height: 10, borderRadius: 5 },

    irrigateButton: {
        backgroundColor: '#2D8A4E', borderRadius: 20, paddingVertical: 22,
        alignItems: 'center', marginBottom: 16,
        shadowColor: '#2D8A4E', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
    },
    irrigatingButton: { backgroundColor: '#3182CE' },
    irrigateIcon: { fontSize: 36, marginBottom: 6 },
    irrigateText: { fontSize: 22, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },
    irrigateSubtext: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

    aiNote: {
        flexDirection: 'row', backgroundColor: '#E6F4EA', borderRadius: 14,
        padding: 16, alignItems: 'center',
    },
    aiNoteIcon: { fontSize: 22, marginRight: 12 },
    aiNoteText: { flex: 1, fontSize: 13, color: '#2D5A3D', lineHeight: 19 },
});
