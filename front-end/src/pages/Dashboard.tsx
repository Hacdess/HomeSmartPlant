// DASHBOARD: PAGE CHINH, HIEN THI THONG CAC SENSOR
import { useState, useEffect } from "react";
import Gauge from "../components/Dashboard/Gauge"
import DeviceController from "../components/Dashboard/DeviceController";
import Chart from "../components/Dashboard/Chart";
import LogTable from "../components/Dashboard/LogTable";
import type { DeviceData } from "src/types/outDevices.type";
import type { LogData } from "src/types/logs.type";
import type { SensorRecord, SensorLimit } from "src/types/sensors.type";

// format date dạng: HH:MM:SS DD/MM/YYYY
export const formatDateTime = (inputDate: string): string => {
  const date = new Date(inputDate);
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
  const [sensorRecords, setSensorRecords] = useState<SensorRecord[]>([]);
  const [sensorLimit, setSensorLimit] = useState<SensorLimit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pump, setPump] = useState<DeviceData | null>(null);
  const [light, setLight] = useState<DeviceData | null>(null); 
  const [logs, setLogs] = useState<LogData[]>([]);


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

  const loadDashboard = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSensorLimit(),
        fetchSensorRecords(),
        fetchDevices(),
        fetchLogs(),
      ]);
    } catch(e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadDashboard();
  }, []);

  // 3. user actions handle
  const updateLimitAndSave = async (updatedFields: Partial<SensorLimit>) => {
    if (!sensorLimit) return;

    // 1. Tạo object limit mới
    const newLimit = { ...sensorLimit, ...updatedFields };

    // 2. Cập nhật UI ngay lập tức (Optimistic Update)
    setSensorLimit(newLimit);

    try {
      // 3. Gọi API Save
      const response = await fetch('/api/sensors/limit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLimit),
      });

      const data = await response.json();
      if (!response.ok || !data.isSuccess) {
        throw new Error(data.message || 'Update failed');
      }
      alert("Update success")
      console.log('Update success');
      // toast.success("Đã cập nhật ngưỡng!"); 
    } catch (e) {
      console.error('Failed to update sensor limits:', e);
      // Nếu lỗi, revert lại state cũ (nếu muốn kỹ tính hơn)
      alert('Lỗi khi lưu cấu hình!');
      fetchSensorLimit(); // Load lại data gốc
    }
  };

  // Toggle Device (Auto/Manual)
  const handleToggleDevice = async () => {
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
  if (error != "") {
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

        <Gauge
          title="Nhiệt độ"
          value={sensorRecords?.[0]?.temperature ?? 0}
          unit="°C"
          // Lấy giới hạn từ API, nếu chưa có thì dùng mặc định 20-35
          min={sensorLimit?.temp_min ?? 20}
          max={sensorLimit?.temp_max ?? 35}
          onSave={(newMin, newMax) => 
            updateLimitAndSave({ temp_min: newMin, temp_max: newMax })
          }
        />

        {/* Humidity Gauge */}
        <Gauge
          title="Độ ẩm không khí"
          value={sensorRecords?.[0]?.humid ?? 0}
          unit="%"
          min={sensorLimit?.humid_min ?? 40}
          max={sensorLimit?.humid_max ?? 80}
          onSave={(newMin, newMax) => 
            updateLimitAndSave({ humid_min: newMin, humid_max: newMax })
          }
        />

        {/* Light Gauge */}
        <Gauge
          title="Ánh sáng"
          value={sensorRecords?.[0]?.light ?? 0}
          unit=" Lux"
          min={sensorLimit?.light_min ?? 0}
          max={sensorLimit?.light_max ?? 3000}
          onSave={(newMin, newMax) => 
            updateLimitAndSave({ light_min: newMin, light_max: newMax })
          }
        />
  
        {/* Soil Moisture Gauge */}
        <Gauge
          title="Độ ẩm đất"
          value={sensorRecords?.[0]?.soil_moisture ?? 0}
          unit="%"
          min={sensorLimit?.soil_min ?? 30}
          max={sensorLimit?.soil_max ?? 70}
          onSave={(newMin, newMax) => 
            updateLimitAndSave({ soil_min: newMin, soil_max: newMax })
          }
        />

        <Gauge
          title="Mực nước"
          value={sensorRecords?.[0]?.water_level ?? 0}
          unit="mm"
          min={sensorLimit?.water_level_min ?? 0}
          max={sensorLimit?.water_level_max ?? 1600}
          onSave={(newMin, newMax) => 
            updateLimitAndSave({ water_level_min: newMin, water_level_max: newMax })
          }
        />
      </div>

      

      {/* Device Controllers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Grow Light Controller */}
        {light && (
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-2 mb-4 text-slate-300">
              <span className="text-yellow-400 text-2xl">☀️</span>
              <span className="text-lg font-semibold">GrowLight</span>
            </div>

            <DeviceController
              name="Auto Mode"
              description="Auto turn on/off based on environment light intensity"
              status={light?.status}
              onToggle={() => handleToggleDevice()}
            />

            {/* Manual Mode */}
            {/* <div className={light.value === 1 ? 'opacity-50 pointer-events-none' : ''}>
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
            </div> */}
          </div>
        )}
      
        {/* Water Pump Controller */}
        {pump && (
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-2 mb-4 text-slate-300">
              <span className="text-blue-400 text-2xl">💧</span>
              <span className="text-lg font-semibold">Watering system</span>
            </div>

            {/* Auto Mode */}
            <DeviceController
              name="Auto Mode"
              description="Auto turn water pump on/off based in current soil moisture"
              status={pump?.status}
              onToggle={() => handleToggleDevice()}
              />

            {/* Manual Mode */}
            {/* <div className={waterPump.value === 1 ? 'opacity-50 pointer-events-none' : ''}>
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
            </div> */}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="mb-8">
        <Chart data={sensorRecords} />
      </div>

      {/* Logs Table */}
      <div className="mb-8">
        <LogTable 
          logs={logs.map((log,) => ({
            ...log,
            formattedDateTime: formatDateTime(log.created_at? log.created_at : ""),
            typeDisplay: log.type.charAt(0).toUpperCase() + log.type.slice(1),
            relativeTime: '',
          }))} 
        />
      </div>

    </div>
  );
}