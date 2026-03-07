import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SEVERITY_COLORS = {
    critical: { bg: '#FED7D7', text: '#E53E3E', border: '#FC8181' },
    warning: { bg: '#FEFCBF', text: '#D69E2E', border: '#F6E05E' },
    info: { bg: '#C6F6D5', text: '#38A169', border: '#68D391' },
};

export default function StatusBadge({ status, size = 'medium' }) {
    const colors = SEVERITY_COLORS[
        status === 'Optimal' ? 'info' :
            status === 'Needed' ? 'warning' :
                status === 'Critical' ? 'critical' : 'info'
    ] || SEVERITY_COLORS.info;

    const isLarge = size === 'large';

    return (
        <View style={[
            styles.badge,
            { backgroundColor: colors.bg, borderColor: colors.border },
            isLarge && styles.badgeLarge,
        ]}>
            <Text style={[
                styles.text,
                { color: colors.text },
                isLarge && styles.textLarge,
            ]}>
                {status}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1.5,
        alignSelf: 'flex-start',
    },
    badgeLarge: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 30,
    },
    text: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    textLarge: {
        fontSize: 20,
    },
});
