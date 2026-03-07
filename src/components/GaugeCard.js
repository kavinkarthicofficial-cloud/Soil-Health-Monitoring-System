import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const getStatusColor = (status) => {
    switch (status) {
        case 'critical': return '#E53E3E';
        case 'warning': return '#ED8936';
        case 'good': return '#38A169';
        default: return '#4A9B5E';
    }
};

const getStatus = (value, thresholds) => {
    if (!thresholds) return 'good';
    if (thresholds.criticalBelow && value < thresholds.criticalBelow) return 'critical';
    if (thresholds.criticalAbove && value > thresholds.criticalAbove) return 'critical';
    if (thresholds.warningBelow && value < thresholds.warningBelow) return 'warning';
    if (thresholds.warningAbove && value > thresholds.warningAbove) return 'warning';
    return 'good';
};

export default function GaugeCard({ icon, label, value, unit, thresholds, style }) {
    const status = getStatus(value, thresholds);
    const color = getStatusColor(status);

    return (
        <View style={[styles.card, { borderLeftColor: color }, style]}>
            <View style={styles.iconRow}>
                <Text style={styles.icon}>{icon}</Text>
                <Text style={styles.label}>{label}</Text>
            </View>
            <View style={styles.valueRow}>
                <Text style={[styles.value, { color }]}>{value !== null && value !== undefined ? value : '--'}</Text>
                <Text style={styles.unit}>{unit}</Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: color }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        borderLeftWidth: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        position: 'relative',
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    icon: {
        fontSize: 24,
        marginRight: 10,
    },
    label: {
        fontSize: 15,
        color: '#666',
        fontWeight: '500',
        letterSpacing: 0.3,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    value: {
        fontSize: 38,
        fontWeight: '700',
        letterSpacing: -1,
    },
    unit: {
        fontSize: 18,
        color: '#888',
        marginLeft: 6,
        fontWeight: '500',
    },
    statusDot: {
        position: 'absolute',
        top: 18,
        right: 18,
        width: 10,
        height: 10,
        borderRadius: 5,
    },
});
