// Mock data service simulating ESP32 sensor readings
// Used for development and demo when not connected to actual ESP32

const randomInRange = (min, max) => Math.round((Math.random() * (max - min) + min) * 10) / 10;

const getTimeString = (hoursFromNow = 0) => {
  const d = new Date();
  d.setHours(d.getHours() + hoursFromNow);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const MOISTURE_BASE = 55;
const TEMP_BASE = 28;

export const generateMockReading = () => {
  const moisture = randomInRange(25, 80);
  const temperature = randomInRange(18, 42);
  const ec = randomInRange(0.5, 3.5);
  const battery = randomInRange(20, 100);
  const signal = randomInRange(-90, -30);
  const sensorHealth = randomInRange(30, 98);
  const humidity = randomInRange(30, 95);
  const waterLevel = randomInRange(10, 100);
  const pH = randomInRange(4.5, 8.5);

  // Determine statuses based on values
  let irrigationStatus = 'Optimal';
  let waterRequired = 0;
  if (moisture < 35) {
    irrigationStatus = 'Critical';
    waterRequired = randomInRange(15, 30);
  } else if (moisture < 50) {
    irrigationStatus = 'Needed';
    waterRequired = randomInRange(5, 15);
  }

  return {
    // Sensor readings
    soilMoisture: moisture,
    soilTemperature: temperature,
    electricalConductivity: ec,
    humidity: humidity,
    waterLevel: waterLevel,
    pH: pH,
    batteryLevel: battery,
    signalStrength: signal,

    // AI Irrigation prediction
    irrigation: {
      waterRequired: waterRequired,
      nextIrrigationTime: getTimeString(randomInRange(1, 8)),
      status: irrigationStatus,
    },

    // Sensor health prediction
    sensorHealth: {
      healthScore: sensorHealth,
      driftDetected: sensorHealth < 60,
      calibrationDays: Math.round(randomInRange(1, 90)),
      replaceAlert: sensorHealth < 40,
    },

    // Timestamp
    timestamp: new Date().toISOString(),
    connected: true,
  };
};

// Generate historical data points
export const generateHistoricalData = (hours = 24, pointsPerHour = 4) => {
  const data = [];
  const totalPoints = hours * pointsPerHour;
  const now = Date.now();
  const intervalMs = (hours * 3600000) / totalPoints;

  for (let i = 0; i < totalPoints; i++) {
    const time = new Date(now - (totalPoints - i) * intervalMs);
    const hourOfDay = time.getHours();

    // Simulate realistic daily patterns
    const tempVariation = Math.sin((hourOfDay - 6) * Math.PI / 12) * 8;
    const moistureDecay = Math.max(0, -0.3 * (i % 20)) + randomInRange(-2, 2);

    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: time.getTime(),
      moisture: Math.max(20, Math.min(90, MOISTURE_BASE + moistureDecay + randomInRange(-3, 3))),
      temperature: Math.round((TEMP_BASE + tempVariation + randomInRange(-1, 1)) * 10) / 10,
      humidity: Math.max(30, Math.min(95, 65 + randomInRange(-10, 10) + Math.sin(hourOfDay * Math.PI / 12) * 8)),
      pH: Math.round((6.5 + randomInRange(-0.5, 0.5)) * 10) / 10,
      irrigated: i % 24 === 0,
      sensorHealth: Math.max(30, Math.min(100, 85 + randomInRange(-5, 5) - (i * 0.05))),
    });
  }
  return data;
};

// Generate mock alerts
export const generateMockAlerts = () => {
  const now = Date.now();
  return [
    {
      id: '1',
      type: 'moisture',
      title: 'Low Soil Moisture',
      message: 'Moisture dropped below 35%. Irrigation recommended.',
      severity: 'critical',
      time: new Date(now - 300000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: now - 300000,
      read: false,
    },
    {
      id: '2',
      type: 'sensor',
      title: 'Sensor Drift Detected',
      message: 'Moisture sensor showing calibration drift. Schedule maintenance.',
      severity: 'warning',
      time: new Date(now - 1800000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: now - 1800000,
      read: false,
    },
    {
      id: '3',
      type: 'battery',
      title: 'Battery Low',
      message: 'Sensor node battery at 22%. Replace soon.',
      severity: 'warning',
      time: new Date(now - 3600000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: now - 3600000,
      read: true,
    },
    {
      id: '4',
      type: 'system',
      title: 'System Online',
      message: 'All sensors connected and transmitting normally.',
      severity: 'info',
      time: new Date(now - 7200000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: now - 7200000,
      read: true,
    },
    {
      id: '5',
      type: 'moisture',
      title: 'Irrigation Completed',
      message: 'Auto-irrigation delivered 12L of water successfully.',
      severity: 'info',
      time: new Date(now - 10800000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: now - 10800000,
      read: true,
    },
  ];
};
