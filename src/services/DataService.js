// AgroPulse Data Service using MQTT
// Pipeline: Soil Sensors -> ESP32 -> MQTT Broker -> This App
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateMockReading, generateHistoricalData, generateMockAlerts } from './MockData';

// Polyfill for paho-mqtt to work in Expo / React Native
if (typeof localStorage === 'undefined') {
    global.localStorage = { setItem: () => { }, getItem: () => null, removeItem: () => { } };
}
import Paho from 'paho-mqtt';

const MQTT_BROKER = '192.168.31.243';; // Your Windows PC IP
const MQTT_PORT = 9001; // WebSockets port we just configured
const MQTT_TOPIC_DATA = 'agropulse/sensors';
const MQTT_TOPIC_TRIGGER = 'agropulse/irrigate';

const STORAGE_KEY = '@agropulse_data';
const HISTORY_KEY = '@agropulse_history';
const ALERTS_KEY = '@agropulse_alerts';
const REFRESH_INTERVAL = 5000;

class DataService {
    constructor() {
        this.listeners = [];
        this.currentData = null;
        this.historicalData = [];
        this.alerts = [];
        this.isConnected = false;
        this.useMockData = false; // Set to true to test app UI without MQTT
        this.intervalId = null;

        // Setup MQTT Client
        const clientId = 'AgroPulseApp_' + Math.random().toString(16).substring(2, 10);
        this.mqttClient = new Paho.Client(MQTT_BROKER, MQTT_PORT, "/mqtt", clientId);
        this.mqttClient.onConnectionLost = this.onConnectionLost.bind(this);
        this.mqttClient.onMessageArrived = this.onMessageArrived.bind(this);
    }

    // Subscribe to data updates
    subscribe(callback) {
        this.listeners.push(callback);
        if (this.currentData) {
            callback(this.currentData, this.isConnected);
        }
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    // Notify all listeners
    notifyListeners() {
        this.listeners.forEach(cb => cb(this.currentData, this.isConnected));
    }

    // Start auto-refresh or connect MQTT
    startPolling() {
        if (!this.useMockData) {
            this.connectMQTT();
        } else {
            this.fetchMockData();
            this.intervalId = setInterval(() => this.fetchMockData(), REFRESH_INTERVAL);
        }
    }

    // Stop auto-refresh and disconnect MQTT
    stopPolling() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        if (this.mqttClient && this.mqttClient.isConnected()) {
            this.mqttClient.disconnect();
        }
    }

    // Connect to MQTT Broker
    connectMQTT() {
        console.log("Connecting to MQTT broker...");
        try {
            this.mqttClient.connect({
                onSuccess: () => {
                    console.log("MQTT Connected!");
                    this.isConnected = true;
                    this.mqttClient.subscribe(MQTT_TOPIC_DATA);
                    this.notifyListeners();
                },
                onFailure: (err) => {
                    console.warn("MQTT Connection failed:", err);
                    this.isConnected = false;
                    this.notifyListeners();
                    setTimeout(() => this.connectMQTT(), 5000); // Reconnect
                },
                useSSL: false // Change to true if using wss port like 8081
            });
        } catch (err) {
            console.error("MQTT Connect Error:", err);
        }
    }

    // MQTT Connection Lost
    onConnectionLost(responseObject) {
        if (responseObject.errorCode !== 0) {
            console.warn("MQTT Connection Lost:", responseObject.errorMessage);
        }
        this.isConnected = false;
        this.notifyListeners();
        setTimeout(() => this.connectMQTT(), 5000); // Reconnect
    }

    // Parse incoming MQTT messages
    async onMessageArrived(message) {
        try {
            if (message.destinationName === MQTT_TOPIC_DATA) {
                const data = JSON.parse(message.payloadString);

                // Normalizing payload format if it's slightly different
                this.currentData = {
                    soilMoisture: data.soilMoisture !== undefined ? data.soilMoisture : data.soil,
                    soilTemperature: data.soilTemperature !== undefined ? data.soilTemperature : data.temp,
                    humidity: data.humidity !== undefined ? data.humidity : data.hum,
                    waterLevel: data.waterLevel !== undefined ? data.waterLevel : 0,
                    pH: data.pH !== undefined ? data.pH : 7.0,
                    irrigation: data.irrigation || { status: 'Optimal', waterRequired: 0, nextIrrigationTime: 'Soon' },
                    sensorHealth: data.sensorHealth || { healthScore: 90 },
                    batteryLevel: data.batteryLevel || 85,
                    timestamp: Date.now()
                };

                this.isConnected = true;

                // Add to history and cache
                this.addToHistory(this.currentData);
                this.updateAlerts(this.currentData);
                await this.cacheData();
                this.notifyListeners();
            }
        } catch (error) {
            console.error("Error parsing MQTT data:", error);
        }
    }

    // Fetch mock data (used when useMockData = true)
    async fetchMockData() {
        try {
            this.currentData = generateMockReading();
            this.isConnected = true;

            this.addToHistory(this.currentData);
            this.updateAlerts(this.currentData);
            await this.cacheData();
            this.notifyListeners();
        } catch (error) {
            this.isConnected = false;
            await this.loadCachedData();
            this.notifyListeners();
        }
    }

    // Add reading to historical data
    addToHistory(reading) {
        const point = {
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now(),
            moisture: reading.soilMoisture,
            temperature: reading.soilTemperature,
            humidity: reading.humidity || 0,
            pH: reading.pH || 0,
            irrigated: false,
            sensorHealth: reading.sensorHealth?.healthScore || 0,
        };

        this.historicalData.push(point);

        // Keep only last 24h of data (cap at 500 for performance)
        if (this.historicalData.length > 500) {
            this.historicalData = this.historicalData.slice(-500);
        }
    }

    // Update alerts based on current readings
    updateAlerts(data) {
        const now = Date.now();
        const newAlerts = [];

        if (data.soilMoisture < 35) {
            newAlerts.push({
                id: `moisture_${now}`,
                type: 'moisture',
                title: 'Low Soil Moisture',
                message: `Moisture at ${data.soilMoisture}%. Irrigation needed!`,
                severity: 'critical',
                time: new Date(now).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                timestamp: now,
                read: false,
            });
        }

        if (data.sensorHealth?.healthScore < 40) {
            newAlerts.push({
                id: `sensor_${now}`,
                type: 'sensor',
                title: 'Sensor Replacement Needed',
                message: `Sensor health at ${data.sensorHealth.healthScore}%. Replace sensor.`,
                severity: 'critical',
                time: new Date(now).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                timestamp: now,
                read: false,
            });
        }

        if (data.batteryLevel < 25) {
            newAlerts.push({
                id: `battery_${now}`,
                type: 'battery',
                title: 'Battery Low',
                message: `Battery at ${data.batteryLevel}%. Charge or replace.`,
                severity: 'warning',
                time: new Date(now).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                timestamp: now,
                read: false,
            });
        }

        // Add new alerts avoiding duplicates (same type within 60s)
        newAlerts.forEach(alert => {
            const isDuplicate = this.alerts.some(
                a => a.type === alert.type && (now - a.timestamp) < 60000
            );
            if (!isDuplicate) {
                this.alerts.unshift(alert);
            }
        });

        if (this.alerts.length > 50) {
            this.alerts = this.alerts.slice(0, 50);
        }
    }

    // Cache data to AsyncStorage
    async cacheData() {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentData));
            await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(this.historicalData.slice(-100)));
            await AsyncStorage.setItem(ALERTS_KEY, JSON.stringify(this.alerts));
        } catch (e) {
            console.warn('Failed to cache data:', e);
        }
    }

    // Load cached data from AsyncStorage
    async loadCachedData() {
        try {
            const cached = await AsyncStorage.getItem(STORAGE_KEY);
            if (cached) {
                this.currentData = JSON.parse(cached);
            }
            const history = await AsyncStorage.getItem(HISTORY_KEY);
            if (history) {
                this.historicalData = JSON.parse(history);
            }
            const alerts = await AsyncStorage.getItem(ALERTS_KEY);
            if (alerts) {
                this.alerts = JSON.parse(alerts);
            }
        } catch (e) {
            console.warn('Failed to load cached data:', e);
        }
    }

    getHistoricalData(hours = 24) {
        if (this.historicalData.length < 10) {
            return generateHistoricalData(hours);
        }
        const cutoff = Date.now() - hours * 3600000;
        return this.historicalData.filter(d => d.timestamp > cutoff);
    }

    getAlerts() {
        if (this.alerts.length === 0) {
            this.alerts = generateMockAlerts();
        }
        return this.alerts;
    }

    getUnreadAlertCount() {
        return this.alerts.filter(a => !a.read).length;
    }

    markAlertRead(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.read = true;
            this.cacheData();
        }
    }

    // Trigger manual irrigation via MQTT
    async triggerIrrigation() {
        try {
            if (!this.useMockData && this.mqttClient && this.mqttClient.isConnected()) {
                const message = new Paho.Message(JSON.stringify({ command: "irrigate", intensity: 100 }));
                message.destinationName = MQTT_TOPIC_TRIGGER;
                this.mqttClient.send(message);
            }

            // Add alert for UI feedback
            const now = Date.now();
            this.alerts.unshift({
                id: `irrigate_${now}`,
                type: 'moisture',
                title: 'Manual Irrigation Sent',
                message: 'Irrigation command dispatched via MQTT.',
                severity: 'info',
                time: new Date(now).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                timestamp: now,
                read: false,
            });
            return true;
        } catch (error) {
            console.error("Failed to send irrigation command", error);
            return false;
        }
    }

    // Initialize service with cached data
    async initialize() {
        await this.loadCachedData();
        this.startPolling();
    }
}

// Singleton instance
const dataService = new DataService();
export default dataService;
