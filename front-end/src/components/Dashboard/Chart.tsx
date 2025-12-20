import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { type SensorRecord } from '../../types/sensors.type';
import { formatDateTime } from '../../pages/Dashboard';
import { useMemo } from 'react';

export default function Chart({ data }: {data : SensorRecord[]}) {
  const chartData = useMemo(() => {
    if (!data) return [];

    return data.map(record => {
      const formatedDate = formatDateTime(record.recorded_at? record.recorded_at : new Date().toLocaleDateString());
      return {
        ...record,
        date: formatedDate
      };
    });
  }, [data]);

  if(data.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 flex items-center justify-center h-80">
        <h3 className="text-slate-100 mb-4 text-xl font-semibold">Không có dữ liệu để hiển thị chart.</h3>
      </div>
    );
  }
  
  return (
    // Container
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 flex items-center justify-center h-80">
      {/* Title */}
      <h3 className="text-slate-100 mb-4 text-xl font-semibold">Biểu đồ tuần</h3>
      
      {/* Recharts LineChart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            minTickGap={30}
          />
          <YAxis 
            yAxisId="left" 
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '0.5rem',
              color: '#f1f5f9',
            }}
            labelStyle={{ color: '#f1f5f9' }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '14px' }}
          />
          
          {/* Temperature - Left axis */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="temperature"
            stroke="#ef4444"
            strokeWidth={2}
            name="Nhiệt độ (°C)"
            dot={false}
            activeDot={{ r: 5 }}
          />
          
          {/* Light - Right axis */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="light"
            stroke="#eab308"
            strokeWidth={2}
            name="Độ sáng (lux)"
            dot={false}
            activeDot={{ r: 5 }}
          />
          
          {/* Humidity - Right axis */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="humid"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Độ ẩm không khí (%)"
            dot={false}
            activeDot={{ r: 5 }}
          />
          
          {/* Soil Moisture - Left axis */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="soil_moisture"
            stroke="#22c55e"
            strokeWidth={2}
            name="Độ ẩm đất (%)"
            dot={false}
            activeDot={{ r: 5 }}
          />
          
          {/* Water Level - Left axis */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="water_level"
            stroke="#06b6d4"
            strokeWidth={2}
            name="Mực nước (cm)"
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}