// DASHBOARD: PAGE CHINH, HIEN THI THONG CAC SENSOR
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import PageLayout from "../layout/PageLayout";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { Gauge } from "../components/Dashboard/Gauge";
import DeviceController from "../components/Dashboard/DeviceController";
import Chart from "../components/Dashboard/Chart";
import LogTable from "../components/Dashboard/LogTable";
import type { SensorData } from "src/types/sensors.type";
import type { DeviceData } from "src/types/outDevices.type";
import type { LogData } from "src/types/logs.type";

// ============================================
// MOCK DATA (Comment out khi dùng API thật)
// ============================================
const MOCK_SENSOR_DATA: SensorData = {
  recId: '1',
  userId: 'user123',
  sensorId: 'sensor001',
  temperature: 78,
  humidity: 380,
  lightIntensity: 380,
  soilMoisture: 78,
  waterLevel: 50,
  timestamp: new Date().toISOString(),
  tempMin: 0,
  tempMax: 100,
  humidMin: 0,
  humidMax: 600,
  lightMin: 0,
  lightMax: 800,
  soilMin: 0,
  soilMax: 100,
  waterLevelMin: 0,
  waterLevelMax: 100,
};

const MOCK_DEVICES: DeviceData[] = [
  {
    deviceId: 'dev001',
    userId: 'user123',
    deviceName: 'growLight',
    status: true,
    value: 1, // 1 = auto mode, 0 = manual
    lastUpdated: new Date().toISOString(),
  },
  {
    deviceId: 'dev002',
    userId: 'user123',
    deviceName: 'waterPump',
    status: false,
    value: 0,
    lastUpdated: new Date().toISOString(),
  },
];

const MOCK_LOGS: LogData[] = [
  {
    logId: '1',
    userId: 'user123',
    type: 'warning',
    message: 'Too High Temperature',
    timestamp: '2025-11-14T04:30:50Z',
  },
  {
    logId: '2',
    userId: 'user123',
    type: 'success',
    message: 'Watered the plants successfully',
    timestamp: '2025-11-14T05:05:00Z',
  },
  {
    logId: '3',
    userId: 'user123',
    type: 'warning',
    message: 'Low Soil Moisture',
    timestamp: '2025-11-13T21:46:00Z',
  },
  {
    logId: '4',
    userId: 'user123',
    type: 'success',
    message: 'System is operating normally',
    timestamp: '2025-11-13T04:46:50Z',
  },
];

const MOCK_CHART_DATA = [
  { date: 'Nov 7', temperature: 60, light: 350, humidity: 450, soilMoisture: 50, waterLevel: 45 },
  { date: 'Nov 8', temperature: 65, light: 400, humidity: 470, soilMoisture: 55, waterLevel: 48 },
  { date: 'Nov 9', temperature: 62, light: 380, humidity: 460, soilMoisture: 52, waterLevel: 50 },
  { date: 'Nov 10', temperature: 68, light: 420, humidity: 490, soilMoisture: 48, waterLevel: 47 },
  { date: 'Nov 11', temperature: 64, light: 390, humidity: 480, soilMoisture: 54, waterLevel: 49 },
  { date: 'Nov 12', temperature: 70, light: 410, humidity: 500, soilMoisture: 51, waterLevel: 52 },
  { date: 'Nov 13', temperature: 67, light: 395, humidity: 485, soilMoisture: 53, waterLevel: 51 },
];


// HELPER FUNCTION
// Tính trạng thái Gauge dựa trên giá trị sensor và ngưỡng
const calculateStatus = (value: number, min: number, max: number): string => {
  const range = max - min;
  const threshold1 = min + range * 0.3;
  const threshold2 = max - range * 0.3;
  if (value < threshold1) return 'Low';
  if (value > threshold2) return 'High';
  return 'Normal';
};

// format date dạng: HH:MM:SS DD/MM/YYYY
const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default function Dashboard() {
  // 1. state management
  const [sensorRecords, setSensorRecords] = useState([]);
  const [sensorLimit, setSensorLimit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("null");
  const [pump, setPump] = useState<DeviceData | null>(null);
  const [light, setLight] = useState<DeviceData | null>(null); 
  const [logs, setLogs] = useState<LogData[]>([]);


  const [sensorData, setSensorData] = useState<SensorData>(MOCK_SENSOR_DATA);
  const [chartData, setChartData] = useState(MOCK_CHART_DATA);

  // 2. API 
  // fectch sensor data
  const fetchSensorLimit = async () => {
    try {
      const response = await fetch('/api/sensors/limit', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Server error');
      if (data.isSuccess) {
        setSensorLimit(data.data);
        console.log(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch sensor data:', e);
      setError("Failed to load sensor limit");
    }
  };

  const fetchSensorRecords = async () => {
    try {
      const response = await fetch('/api/sensors/all', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Server error');
      if (data.isSuccess) {
        setSensorRecords(data.data);
        console.log(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch sensor data:', e);
      setError("Failed to load sensor records");
    }
  };

  // fetch devices data
  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/device/get', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Server error');
      if (data.isSuccess) {
        setPump(data.data.rest_pump);
        setLight(data.data.rest_light);
        console.log(data.data.rest_pump);
        console.log(data.data.rest_light);
      }
    } catch (e) {
      console.error('Failed to fetch devices:', e);
      setError('Failed to fetch devices');
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/log/all', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Server error');
      if (data.isSuccess) {
        setLogs(data.data);
        console.log(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch logs:', e);
      setError('Failed to fetch logs');
    }
  };

  // fetch chart data
  const fetchChartData = async () => {
    try {
      // TODO: Uncomment khi có API thật
      /*
      const response = await fetch('/api/sensors/history?days=7', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Server error');
      if (data.isSuccess) {
        // Transform data to chart format
        const chartData = data.data.map((record: SensorData) => ({
          date: new Date(record.timestamp).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
          temperature: record.temperature,
          light: record.lightIntensity,
          humidity: record.humidity,
          soilMoisture: record.soilMoisture,
          waterLevel: record.waterLevel,
        }));
        setChartData(chartData);
      }
      */

      // MOCK DATA
      setChartData(MOCK_CHART_DATA);
    } catch (e) {
      console.error('Failed to fetch chart data:', e);
    }
  };
   // Load All Data on Mount
  useEffect(() => {
    fetchSensorLimit();
    fetchSensorRecords();
    fetchDevices();
    fetchLogs();
  }, []);

  // 3. user actions handle
  const handleUpdateSensorLimits = async (
    sensorType: 'temperature' | 'humidity' | 'light' | 'soilMoisture' | 'waterLevel',
    min: number,
    max: number
  ) => {
    try {
      // Build payload
      const fieldMap = {
        temperature: { min: 'tempMin', max: 'tempMax' },
        humidity: { min: 'humidMin', max: 'humidMax' },
        light: { min: 'lightMin', max: 'lightMax' },
        soilMoisture: { min: 'soilMin', max: 'soilMax' },
        waterLevel: { min: 'waterLevelMin', max: 'waterLevelMax' },
      };

      const fields = fieldMap[sensorType];
      const payload = {
        [fields.min]: min,
        [fields.max]: max,
      };

      // TODO: Uncomment khi có API thật
      /*
      const response = await fetch('/api/sensors/limits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Update failed');
      if (data.isSuccess) {
        console.log('Limits updated successfully');
        await fetchSensorData(); // Reload data
      }
      */

      // MOCK - Optimistic update
      if (sensorData) {
        setSensorData({
          ...sensorData,
          [fields.min]: min,
          [fields.max]: max,
        });
      }
      console.log('Updated limits:', sensorType, min, max);
    } catch (e) {
      console.error('Failed to update sensor limits:', e);
      alert('Failed to update sensor limits');
    }
  };

  // Toggle Device (Auto/Manual)
  const handleToggleDevice = async (deviceId: string, mode?: 'auto' | 'manual') => {
    try {
      // const device = devices.find((d) => d.deviceId === deviceId);
      // if (!device) return;

      // let newStatus = device.status;
      // let newValue = device.value;

      // if (mode === 'auto') { // mode = 1 là auto
      //   newStatus = device.value !== 1;
      //   newValue = newStatus ? 1 : 0;
      // } else if (mode === 'manual') { // mode = 0 là manual
      //   newStatus = !device.status;
      //   newValue = 0;
      // } else { // Toggle status only
      //   newStatus = !device.status;
      // }

      // const payload = {
      //   deviceId,
      //   status: newStatus,
      //   value: newValue,
      // };

      // // TODO: Uncomment khi có API thật
      // /*
      // const response = await fetch(`/api/devices/${deviceId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message || 'Update failed');
      // if (data.isSuccess) {
      //   console.log('Device updated successfully');
      //   await fetchDevices(); // Reload
      // }
      // */

      // // MOCK - Optimistic update
      // setDevices(
      //   devices.map((d) =>
      //     d.deviceId === deviceId
      //       ? { ...d, status: newStatus, value: newValue }
      //       : d
      //   )
      // );
      // console.log('Toggled device:', deviceId, mode, newStatus, newValue);
    } catch (e) {
      console.error('Failed to toggle device:', e);
      alert('Không thể điều khiển thiết bị');
    }
  };

  // 4. render
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <div className="flex items-center justify-center h-96">
          <div className="text-slate-400 text-lg">Loading...</div>
        </div>
      </div>
    );
  }
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950">
        <div className="flex items-center justify-center h-96">
          <div className="text-red-500 text-lg">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* Title */}
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Dashboard & Controller</h1>
      </div>

      {/* 4 Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Temperature */}
        <Gauge
          title="Temperature"
          value={sensorData.temperature}
          unit="°C"
          status={calculateStatus(
            sensorData.temperature,
            sensorData.tempMin,
            sensorData.tempMax
          )}
          min={sensorData.tempMin}
          max={sensorData.tempMax}
          dangerThreshold1={
            sensorData.tempMin + (sensorData.tempMax - sensorData.tempMin) * 0.3
          }
          dangerThreshold2={
            sensorData.tempMin + (sensorData.tempMax - sensorData.tempMin) * 0.8
          }
          icon="temperature"
          onThresholdChange={(min, max) =>
            handleUpdateSensorLimits('temperature', min, max)
          }
        />
        {/* Light */}
        <Gauge
          title="Light Intensity"
          value={sensorData.lightIntensity}
          unit="lux"
          status={calculateStatus(
            sensorData.lightIntensity,
            sensorData.lightMin,
            sensorData.lightMax
          )}
          min={sensorData.lightMin}
          max={sensorData.lightMax}
          dangerThreshold1={
            sensorData.lightMin + (sensorData.lightMax - sensorData.lightMin) * 0.25
          }
          dangerThreshold2={
            sensorData.lightMin + (sensorData.lightMax - sensorData.lightMin) * 0.75
          }
          icon="light"
          onThresholdChange={(min, max) =>
            handleUpdateSensorLimits('light', min, max)
          }
        />

        {/* Humidity */}
        <Gauge
          title="Humidity"
          value={sensorData.humidity}
          unit="ppm"
          status={calculateStatus(
            sensorData.humidity,
            sensorData.humidMin,
            sensorData.humidMax
          )}
          min={sensorData.humidMin}
          max={sensorData.humidMax}
          dangerThreshold1={
            sensorData.humidMin + (sensorData.humidMax - sensorData.humidMin) * 0.3
          }
          dangerThreshold2={
            sensorData.humidMin + (sensorData.humidMax - sensorData.humidMin) * 0.8
          }
          icon="humidity"
          onThresholdChange={(min, max) =>
            handleUpdateSensorLimits('humidity', min, max)
          }
        />

        {/* Soil Moisture */}
        <Gauge
          title="Độ ẩm đất"
          value={sensorData.soilMoisture}
          unit="%"
          status={calculateStatus(
            sensorData.soilMoisture,
            sensorData.soilMin,
            sensorData.soilMax
          )}
          min={sensorData.soilMin}
          max={sensorData.soilMax}
          dangerThreshold1={
            sensorData.soilMin + (sensorData.soilMax - sensorData.soilMin) * 0.3
          }
          dangerThreshold2={
            sensorData.soilMin + (sensorData.soilMax - sensorData.soilMin) * 0.7
          }
          icon="soilMoisture"
          onThresholdChange={(min, max) =>
            handleUpdateSensorLimits('soilMoisture', min, max)
          }
        />
      </div>

      {/* Device Controllers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Grow Light Controller */}
        {growLight && (
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-2 mb-4 text-slate-300">
              <span className="text-yellow-400 text-2xl">☀️</span>
              <span className="text-lg font-semibold">GrowLight</span>
            </div>

            {/* Auto Mode */}
            <DeviceController
              name="Auto Mode"
              description="Auto turn on/off based on environment light intensity"
              enabled={growLight.value === 1}
              onToggle={() => handleToggleDevice(growLight.deviceId, 'auto')}
            />

            {/* Manual Mode */}
            <div className={growLight.value === 1 ? 'opacity-50 pointer-events-none' : ''}>
              <DeviceController
                name="Turn On/Off"
                description={
                  growLight.value === 1
                    ? 'Disabled auto mode first'
                    : 'Manual control of the light'
                }
                enabled={growLight.status && growLight.value === 0}
                onToggle={() => handleToggleDevice(growLight.deviceId, 'manual')}
                disabled={growLight.value === 1}
              />
            </div>
          </div>
        )}
      
        {/* Water Pump Controller */}
        {waterPump && (
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-2 mb-4 text-slate-300">
              <span className="text-blue-400 text-2xl">💧</span>
              <span className="text-lg font-semibold">Watering system</span>
            </div>

            {/* Auto Mode */}
            <DeviceController
              name="Auto Mode"
              description="Auto turn water pump on/off based in current soil moisture"
              enabled={waterPump.value === 1}
              onToggle={() => handleToggleDevice(waterPump.deviceId, 'auto')}
              />

            {/* Manual Mode */}
            <div className={waterPump.value === 1 ? 'opacity-50 pointer-events-none' : ''}>
              <DeviceController
                name="Turn On/Off"
                description={
                  waterPump.value === 1
                    ? 'Disabled auto mode first'
                    : 'Manual control of the water pump'
                }
                enabled={waterPump.status && waterPump.value === 0}
                onToggle={() => handleToggleDevice(waterPump.deviceId, 'manual')}
                disabled={waterPump.value === 1}
              />
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="mb-8">
        <Chart data={chartData} />
      </div>

      {/* Logs Table */}
      <div className="mb-8">
        <LogTable 
          logs={logs.map((log,) => ({
            ...log,
            formattedDateTime: formatDateTime(log.timestamp),
            typeDisplay: log.type.charAt(0).toUpperCase() + log.type.slice(1),
            relativeTime: '',
          }))} 
        />
      </div>

    </div>
  );
}