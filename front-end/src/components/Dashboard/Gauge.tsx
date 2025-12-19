import { useState, useEffect } from 'react';
import GaugeComponent from 'react-gauge-component';

interface GaugeProps {
  title: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  // Thay đổi: onSave sẽ trả về min và max mới
  onSave: (newMin: number, newMax: number) => void;
}

export default function Gauge ({ title, value, min, max, unit, onSave } : GaugeProps ) {
  const [editMin, setEditMin] = useState(min.toString());
  const [editMax, setEditMax] = useState(max.toString());

// 2. Đồng bộ: Khi props min/max từ API thay đổi, cập nhật lại input
  useEffect(() => {
    setEditMin(min.toString());
    setEditMax(max.toString());
  }, [min, max]);

  const delta = max - min;
  // Xử lý edge case khi delta <= 0 để tránh lỗi render
  const safeDelta = delta <= 0 ? 100 : delta;
  
  const gaugeMin = 0
  const gaugeMax = (() => {
    if (unit === "%" || unit === "Lux") return 100;
    if (unit === "°C") return 50;
    return 1600;
  })()

  const handleSave = () => {
    const numMin = parseFloat(editMin);
    const numMax = parseFloat(editMax);
    // Validate cơ bản: Min phải nhỏ hơn Max

    if (isNaN(numMin) || isNaN(numMax)) {
      alert("Vui lòng nhập số hợp lệ!");
      return;
    }

    if (numMin >= numMax) {
      alert("Giá trị Min phải nhỏ hơn Max!");
      return;
    }

    if (numMin < gaugeMin) {
      alert("Giá trị Min phải lớn hơn hoặc bằng " + gaugeMin.toString());
      return;
    }

    if (numMax > gaugeMax) {
      alert("Giá trị Max phải nhỏ hơn hoặc bằng " + gaugeMax.toString());
      return;
    }

    onSave(numMin, numMax);
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 flex flex-col items-center justify-center">
      {/* Title & Value */}
      <h1 className="text-slate-400 text-xl text-sm font-medium mb-1">{title} ({unit})</h1>

      {/* Gauge Library */}
      <div className="w-[300px] md:w-[220px]">
        <GaugeComponent 
          marginInPercent={0.05}
          type="radial"
          value={value}
          minValue={gaugeMin}
          maxValue={gaugeMax}
          arc={{
            gradient: false,
            colorArray: ['#EA4228', '#ffea00ff', '#5BE12C', '#ffea00ff', '#EA4228'], // Đỏ -> Xanh -> Đỏ
            subArcs: [
              { limit: min},
              { limit: min + delta/ 4 },
              { limit: min + delta * 0.75 },
              { limit: max},
              {},
            ],
            padding: 0,
            width: 0.5,
            cornerRadius: 0
          }}
          pointer={{
            type: "arrow",
            color: "#94a3b8", // Màu kim xám cho hợp dark mode
            elastic: true,
            animationDelay: 0
          }}
          labels={{
            valueLabel: { 
              hide: false ,
              style: {
                fontSize: 30,
                fontWeight: "Bold",
              }
            },
            tickLabels: {
              type: "outer",
              ticks: [
                {value: min},
                {value: max}
              ],
              defaultTickValueConfig: { 
                formatTextValue: (val: any) => Math.round(val).toString(),
                style: { fontSize: 13, fill: '#64748b'} 
              }
            },
          }}
        />
      </div>
      {/* Footer Info (Optional) */}
      <div className="mt-2 flex items-end gap-2 text-medium md:text-xs">
        <div className="flex flex-col gap-1">
          <label className="text-slate-500">Min</label>
          <input
            type="number"
            className="w-16 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-blue-500"
            value={editMin}
            onChange={(e) => setEditMin(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-slate-500">Max</label>
          <input
            type="number"
            className="w-16 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-blue-500"
            value={editMax}
            onChange={(e) => setEditMax(e.target.value)}
          />
        </div>

        <button
          onClick={handleSave}
          className="mt-4 bg-green-600 hover:bg-green-900 text-white px-3 py-1 rounded font-medium transition-colors"
        >
          Lưu
        </button>
      </div>
    </div>
  );
};