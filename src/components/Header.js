import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Header({ title, subtitle, connected }) {
    return (
        <View style={styles.container}>
            <View style={styles.titleRow}>
                <Text style={styles.title}>{title}</Text>
                <View style={styles.connectionStatus}>
                    <View style={[
                        styles.statusDot,
                        { backgroundColor: connected ? '#38A169' : '#E53E3E' }
                    ]} />
                    <Text style={[
                        styles.statusText,
                        { color: connected ? '#38A169' : '#E53E3E' }
                    ]}>
                        {connected ? 'Connected' : 'Offline'}
                    </Text>
                </View>
            </View>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
        backgroundColor: '#F7FBF5',
        borderBottomWidth: 1,
        borderBottomColor: '#E2EFD9',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#1A4D2E',
        letterSpacing: -0.5,
    },
    connectionStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 14,
        color: '#7B9971',
        marginTop: 4,
        fontWeight: '500',
    },
});
