import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const SEVERITY_CONFIG = {
    critical: { bg: '#FFF5F5', border: '#FC8181', icon: '🔴', color: '#E53E3E' },
    warning: { bg: '#FFFFF0', border: '#F6E05E', icon: '🟡', color: '#D69E2E' },
    info: { bg: '#F0FFF4', border: '#68D391', icon: '🟢', color: '#38A169' },
};

const TYPE_ICONS = {
    moisture: '💧',
    sensor: '📡',
    battery: '🔋',
    system: '⚙️',
};

export default function AlertItem({ alert, onPress }) {
    const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
    const typeIcon = TYPE_ICONS[alert.type] || '⚠️';

    return (
        <TouchableOpacity
            onPress={() => onPress?.(alert.id)}
            activeOpacity={0.7}
        >
            <View style={[
                styles.container,
                { backgroundColor: config.bg, borderLeftColor: config.border },
                alert.read && styles.read,
            ]}>
                <View style={styles.iconCol}>
                    <Text style={styles.typeIcon}>{typeIcon}</Text>
                </View>
                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.title, { color: config.color }]}>{alert.title}</Text>
                        {!alert.read && <View style={[styles.unreadDot, { backgroundColor: config.color }]} />}
                    </View>
                    <Text style={styles.message}>{alert.message}</Text>
                    <Text style={styles.time}>{alert.time}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
        borderLeftWidth: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    read: {
        opacity: 0.65,
    },
    iconCol: {
        marginRight: 14,
        justifyContent: 'center',
    },
    typeIcon: {
        fontSize: 28,
    },
    content: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        flex: 1,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
    },
    message: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
        marginBottom: 6,
    },
    time: {
        fontSize: 12,
        color: '#999',
        fontWeight: '500',
    },
});
