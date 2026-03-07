import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DashboardScreen from './src/screens/DashboardScreen';
import IrrigationScreen from './src/screens/IrrigationScreen';
import SensorHealthScreen from './src/screens/SensorHealthScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import AlertsScreen from './src/screens/AlertsScreen';
import dataService from './src/services/DataService';

const Tab = createBottomTabNavigator();

const TabIcon = ({ icon, label, focused, badgeCount }) => (
  <View style={tabStyles.container}>
    <View>
      <Text style={[tabStyles.icon, focused && tabStyles.iconFocused]}>{icon}</Text>
      {badgeCount > 0 && (
        <View style={tabStyles.badge}>
          <Text style={tabStyles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
        </View>
      )}
    </View>
    <Text style={[tabStyles.label, focused && tabStyles.labelFocused]}>{label}</Text>
  </View>
);

const tabStyles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingTop: 6 },
  icon: { fontSize: 24 },
  iconFocused: { fontSize: 28 },
  label: { fontSize: 11, color: '#999', marginTop: 2, fontWeight: '500' },
  labelFocused: { color: '#2D8A4E', fontWeight: '700' },
  badge: {
    position: 'absolute', top: -4, right: -10,
    backgroundColor: '#E53E3E', borderRadius: 9,
    minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
});

export default function App() {
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    dataService.initialize();

    const unsubscribe = dataService.subscribe(() => {
      setAlertCount(dataService.getUnreadAlertCount());
    });

    return () => {
      unsubscribe();
      dataService.stopPolling();
    };
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F7EC" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#FFFFFF',
              borderTopWidth: 1,
              borderTopColor: '#E8F0E3',
              height: 70,
              paddingBottom: 10,
              paddingTop: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 10,
            },
            tabBarShowLabel: false,
            tabBarActiveTintColor: '#2D8A4E',
            tabBarInactiveTintColor: '#999',
          }}
        >
          <Tab.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <TabIcon icon="🌾" label="Home" focused={focused} />
              ),
            }}
          />
          <Tab.Screen
            name="Irrigation"
            component={IrrigationScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <TabIcon icon="💧" label="Irrigate" focused={focused} />
              ),
            }}
          />
          <Tab.Screen
            name="SensorHealth"
            component={SensorHealthScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <TabIcon icon="📡" label="Sensor" focused={focused} />
              ),
            }}
          />
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <TabIcon icon="📊" label="History" focused={focused} />
              ),
            }}
          />
          <Tab.Screen
            name="Alerts"
            component={AlertsScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <TabIcon icon="⚠️" label="Alerts" focused={focused} badgeCount={alertCount} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
