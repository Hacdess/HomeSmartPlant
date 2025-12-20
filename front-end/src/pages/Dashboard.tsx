// DASHBOARD: PAGE CHINH, HIEN THI THONG CAC SENSOR
import { useState, useEffect, useRef } from "react";
import Gauge from "../components/Dashboard/Gauge"
import DeviceController from "../components/Dashboard/DeviceController";
import Chart from "../components/Dashboard/Chart";
import LogTable from "../components/Dashboard/LogTable";
import type { LogData } from "src/types/logs.type";
import type { SensorRecord, SensorLimit } from "src/types/sensors.type";
import { useAuth } from "../contexts/AuthContext";

// format date dạng: HH:MM:SS DD/MM/YYYY
export const formatDateTime = (inputDate: string): string => {
  const normalizedDate = inputDate.endsWith('Z') ? inputDate : inputDate + 'Z';

  const date = new Date(normalizedDate);  return date.toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
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

  const { user } = useAuth()
  const userRef = useRef(user);
  const lastAlertRef = useRef(0); // Dùng Ref thay cho state lastAlert để tránh render lại không cần thiết
  
  const ALERT_COOLDOWN = 60 * 1000; // 1 phút (Sửa lại 10000 thành 1000 cho đúng logic giây)

  // 3. Luôn cập nhật userRef mỗi khi user thay đổi
  useEffect(() => {
    userRef.current = user;
  }, [user]);

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
        console.log('Đã tải giới hạn cảm biến:', data.data);
      }
    } catch (e) {
      console.error('Không thể tải dữ liệu cảm biến:', e);
      setError("Không thể tải giới hạn cảm biến");
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
        console.log('Đã tải dữ liệu cảm biến:', data.data);
      }
    } catch (e) {
      console.error('Không thể tải dữ liệu cảm biến:', e);
      setError("Không thể load sensor records");
    }
  };

  const sendMail = async(content: string) => {
    try {
      const response = await fetch('/api/mail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( {content : content })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Lỗi server');
      if (data.isSuccess) {
        console.log('Đã gửi mail thành công');
      }
    } catch (e: any) {
      console.log(e);
    }
  }

  const sendTelegram = async(content: string) => {
    try {
      const response = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( {content : content })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Lỗi server');
      if (data.isSuccess) {
        console.log('Đã gửi telegram thành công');
      }
    } catch (e: any) {
      console.log(e);
    }
  }

  const writeLog = async(content: string) => {
    try {
      const response = await fetch('/api/log/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( {type: "WARNING", content : content })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Lỗi server');
      if (data.isSuccess) {
        console.log('Đã ghi log thành công');
      }
    } catch (e: any) {
      console.log(e);
    }
  }

  const fetchLatestSensorRecord = async () => {
    try {
      const response = await fetch('/api/sensors/latest', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const jsonResponse = await response.json();
      if (!response.ok) throw new Error(jsonResponse.message || 'Server error');

      if (jsonResponse.isSuccess && jsonResponse.data) { 

        const currentUser = userRef.current;
        const now = Date.now();
        if (
          currentUser?.notify && // Check notify từ Ref
          jsonResponse.data.alerts &&
          jsonResponse.data.alerts.length > 0 && 
          now - lastAlertRef.current > ALERT_COOLDOWN
        ) {
          const alertContent = jsonResponse.data.alerts.join("\n");
          sendMail(alertContent);
          sendTelegram(alertContent);
          writeLog(alertContent);
          alert(alertContent)

          lastAlertRef.current = now;
        }

        setSensorRecords(prevSensorRecords => {
        // Kiểm tra kỹ để tránh trùng lặp và lỗi mảng rỗng
          if (prevSensorRecords.length === 0) return [jsonResponse.data.data];
          if (prevSensorRecords[0].recorded_at !== jsonResponse.data.data.recorded_at)
              return [...prevSensorRecords, jsonResponse.data.data];
          return prevSensorRecords;
        });
      }
    } catch (e) {
      console.error('Không thể fetch sensor data mới nhất:', e);
      setError("Không thể tải sensor record mới nhất");
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
        console.log('Đã tải log:', data.data);
      }
    } catch (e) {
      console.error('Không thể tải log:', e);
      setError('Không thể tải log');
    }
  };

  const fetchLatestLog = async () => {
    try {
      const response = await fetch('/api/log/latest', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      console.log(data)
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
      const currentUser = userRef.current;
      if (currentUser && currentUser.esp_id && currentUser.esp_id !== '') {
        fetchLatestSensorRecord();
        fetchLatestLog();
      }

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
      alert("Cập nhật thành công")
      console.log('Cập nhật thành công');
      // toast.success("Đã cập nhật ngưỡng!"); 
    } catch (e) {
      console.error('Không thể cập nhật giới hạn cảm biến:', e);
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
          <div className="text-slate-400 text-lg">Đang tải...</div>
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
          value={sensorRecords?.at(-1)?.temperature ?? 0}
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
          value={sensorRecords?.at(-1)?.humid ?? 0}
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
          value={sensorRecords?.at(-1)?.light ?? 0}
          unit="%"
          min={sensorLimit?.light_min ?? 0}
          max={sensorLimit?.light_max ?? 100}
          onSave={(newMin, newMax) => 
            updateLimitAndSave({ light_min: newMin, light_max: newMax })
          }
        />
  
        {/* Soil Moisture Gauge */}
        <Gauge
          title="Độ ẩm đất"
          value={sensorRecords?.at(-1)?.soil_moisture ?? 0}
          unit="%"
          min={sensorLimit?.soil_min ?? 30}
          max={sensorLimit?.soil_max ?? 70}
          onSave={(newMin, newMax) => 
            updateLimitAndSave({ soil_min: newMin, soil_max: newMax })
          }
        />

        <Gauge
          title="Mực nước"
          value={sensorRecords?.at(-1)?.water_level ?? 0}
          unit="mm"
          min={sensorLimit?.water_level_min ?? 0}
          max={sensorLimit?.water_level_max ?? 400}
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