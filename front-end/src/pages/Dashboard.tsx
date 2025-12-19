// DASHBOARD: PAGE CHINH, HIEN THI THONG CAC SENSOR
import { useState, useEffect } from "react";
import Gauge from "../components/Dashboard/Gauge"
import DeviceController from "../components/Dashboard/DeviceController";
import Chart from "../components/Dashboard/Chart";
import LogTable from "../components/Dashboard/LogTable";
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

  const fetchLatestSensorRecord = async () => {
    try {
      const response = await fetch('/api/sensors/latest', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Server error');
      if (data.isSuccess && data.data) 
        setSensorRecords(prevSensorRecords => {
        // Kiểm tra kỹ để tránh trùng lặp và lỗi mảng rỗng
          if (prevSensorRecords.length === 0) return [data.data];
          if (prevSensorRecords[0].recorded_at !== data.data.recorded_at)
              return [data.data, ...prevSensorRecords];
          return prevSensorRecords;
        });
    } catch (e) {
      console.error('Failed to fetch sensor data:', e);
      setError("Failed to load sensor records");
    }
  };

  // fetch devices data
  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/log/all', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Server error');
      if (data.isSuccess && data.data) {
        setLogs(data.data);
        console.log(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch logs:', e);
      setError('Failed to fetch logs');
    }
  };

  const fetchLatestLog = async () => {
    try {
      const response = await fetch('/api/log/latest', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Server error');
      if (data.isSuccess && data.data) 
        setLogs(prevLogs => {
        // Kiểm tra kỹ để tránh trùng lặp và lỗi mảng rỗng
          if (prevLogs.length === 0) return [data.data];
          if (prevLogs[0].created_at !== data.data.created_at)
              return [data.data, ...prevLogs];
          return prevLogs;
        });
    } catch (e) {
      console.error('Lấy log mới nhất thất bại:', e);
      setError('Lấy log mới nhất thất bại');
    }
  };
  
  const initDashboard = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSensorLimit(),
        fetchSensorRecords(),
        fetchLogs(),
      ]);
    } catch(e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initDashboard();

    const intervalId = setInterval(() => {
      fetchLatestSensorRecord();
      fetchLatestLog();
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);


  // 3. user actions handle
  const updateLimitAndSave = async (updatedFields: Partial<SensorLimit>) => {
    if (!sensorLimit) return;

    const newLimit = { ...sensorLimit, ...updatedFields };

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
    <div className="min-h-screen text-slate-100">

      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">

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
          unit="Lux"
          min={sensorLimit?.light_min ?? 0}
          max={sensorLimit?.light_max ?? 100}
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


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DeviceController deviceType="PUMP"/>
        <DeviceController deviceType="GROW_LIGHT"/>
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