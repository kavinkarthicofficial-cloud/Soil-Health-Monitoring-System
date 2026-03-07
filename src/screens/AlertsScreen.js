import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, RefreshControl } from 'react-native';
import Header from '../components/Header';
import AlertItem from '../components/AlertItem';
import dataService from '../services/DataService';

export default function AlertsScreen() {
    const [alerts, setAlerts] = useState([]);
    const [connected, setConnected] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const unsubscribe = dataService.subscribe((_, isConnected) => {
            setConnected(isConnected);
            setAlerts([...dataService.getAlerts()]);
        });
        return unsubscribe;
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await dataService.fetchData();
        setAlerts([...dataService.getAlerts()]);
        setRefreshing(false);
    };

    const handleAlertPress = (alertId) => {
        dataService.markAlertRead(alertId);
        setAlerts([...dataService.getAlerts()]);
    };

    const unreadCount = alerts.filter(a => !a.read).length;
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    const warningAlerts = alerts.filter(a => a.severity === 'warning');
    const infoAlerts = alerts.filter(a => a.severity === 'info');

    return (
        <View style={styles.container}>
            <Header
                title="⚠️ Alerts"
                subtitle={`${unreadCount} unread alert${unreadCount !== 1 ? 's' : ''}`}
                connected={connected}
            />
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4A9B5E']} />
                }
            >
                {alerts.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyIcon}>✅</Text>
                        <Text style={styles.emptyText}>All Clear!</Text>
                        <Text style={styles.emptySubtext}>No alerts at this time. Everything is running smoothly.</Text>
                    </View>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <View style={styles.summaryRow}>
                            <View style={[styles.summaryCard, { borderLeftColor: '#E53E3E' }]}>
                                <Text style={styles.summaryCount}>{criticalAlerts.length}</Text>
                                <Text style={styles.summaryLabel}>Critical</Text>
                            </View>
                            <View style={[styles.summaryCard, { borderLeftColor: '#ED8936' }]}>
                                <Text style={styles.summaryCount}>{warningAlerts.length}</Text>
                                <Text style={styles.summaryLabel}>Warning</Text>
                            </View>
                            <View style={[styles.summaryCard, { borderLeftColor: '#38A169' }]}>
                                <Text style={styles.summaryCount}>{infoAlerts.length}</Text>
                                <Text style={styles.summaryLabel}>Info</Text>
                            </View>
                        </View>

                        {/* Critical Alerts */}
                        {criticalAlerts.length > 0 && (
                            <>
                                <Text style={[styles.sectionTitle, { color: '#E53E3E' }]}>🔴 Critical</Text>
                                {criticalAlerts.map(alert => (
                                    <AlertItem key={alert.id} alert={alert} onPress={handleAlertPress} />
                                ))}
                            </>
                        )}

                        {/* Warning Alerts */}
                        {warningAlerts.length > 0 && (
                            <>
                                <Text style={[styles.sectionTitle, { color: '#D69E2E' }]}>🟡 Warnings</Text>
                                {warningAlerts.map(alert => (
                                    <AlertItem key={alert.id} alert={alert} onPress={handleAlertPress} />
                                ))}
                            </>
                        )}

                        {/* Info Alerts */}
                        {infoAlerts.length > 0 && (
                            <>
                                <Text style={[styles.sectionTitle, { color: '#38A169' }]}>🟢 Information</Text>
                                {infoAlerts.map(alert => (
                                    <AlertItem key={alert.id} alert={alert} onPress={handleAlertPress} />
                                ))}
                            </>
                        )}
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

    summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    summaryCard: {
        flex: 1, backgroundColor: '#FFF', borderRadius: 14, padding: 16,
        alignItems: 'center', borderLeftWidth: 4,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    },
    summaryCount: { fontSize: 28, fontWeight: '800', color: '#333' },
    summaryLabel: { fontSize: 12, fontWeight: '600', color: '#888', marginTop: 4, textTransform: 'uppercase' },

    sectionTitle: {
        fontSize: 18, fontWeight: '800', marginBottom: 10, marginTop: 6,
        letterSpacing: 0.3,
    },

    emptyCard: {
        backgroundColor: '#FFF', borderRadius: 20, padding: 40,
        alignItems: 'center', marginTop: 40,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1, shadowRadius: 12, elevation: 5,
    },
    emptyIcon: { fontSize: 48, marginBottom: 16 },
    emptyText: { fontSize: 22, fontWeight: '800', color: '#38A169', marginBottom: 8 },
    emptySubtext: { fontSize: 15, color: '#888', textAlign: 'center', lineHeight: 22 },
});
