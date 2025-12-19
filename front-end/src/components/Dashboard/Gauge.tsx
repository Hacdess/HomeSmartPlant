// import { useState } from 'react';
// import { Thermometer, Sun, Wind, Droplets, Settings } from 'lucide-react';

// interface GaugeProps {
//   title: string;
//   value: number;
//   unit: string;
//   status: string;
//   min: number;
//   max: number;
//   dangerThreshold1: number;
//   dangerThreshold2: number;
//   icon: 'temperature' | 'light' | 'humidity' | 'soilMoisture' | 'waterLevel';
//   onThresholdChange?: (min: number, max: number) => void;
// }

// export function Gauge({
//   title,
//   value,
//   unit,
//   status,
//   min,
//   max,
//   dangerThreshold1,
//   dangerThreshold2,
//   icon,
//   onThresholdChange,
// }: GaugeProps) {
//   const delta = max - min;
//   const minGauge = min - delta * 0.2;
//   const maxGauge = max + delta * 0.2;

//   const [showModal, setShowModal] = useState(false);
//   const [formValues, setFormValues] = useState({ min, max });

//   // Icon mapping
//   const icons = {
//     temperature: <Thermometer className="w-9 h-9" />,
//     light: <Sun className="w-9 h-9" />,
//     humidity: <Wind className="w-9 h-9" />,
//     soilMoisture: <Droplets className="w-9 h-9" />,
//     waterLevel: <Droplets className="w-9 h-9" />,
//   };

//   // Tính góc kim chỉ (-90° to 90°)
//   const valuePercentage = (value - minGauge) / (maxGauge - minGauge);
//   const needleAngle = valuePercentage * 180 - 90;

//   // Tính màu status badge
//   let statusColor = 'text-green-400';
//   let statusBg = 'bg-green-400/20';
//   let statusBorder = 'border-green-400/30';

//   if (value < min || value > max) {
//     statusColor = 'text-red-400';
//     statusBg = 'bg-red-400/20';
//     statusBorder = 'border-red-400/30';
//   } 
//   else if ( value <= min + delta * 0.2 || value >= max - delta * 0.2) {
//     statusColor = 'text-yellow-400';
//     statusBg = 'bg-yellow-400/20';
//     statusBorder = 'border-yellow-400/30';
//   }

//   // Handle save thresholds
//   const handleSave = () => {
//     if (onThresholdChange) {
//       onThresholdChange(formValues.min, formValues.max);
//     }
//     setShowModal(false);
//   };

//   // Handle cancel
//   const handleCancel = () => {
//     setFormValues({ min, max }); // Reset to current values
//     setShowModal(false);
//   };

//   return (
//     <>
//       {/* Main Gauge Card */}
//       <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 hover:border-slate-600 transition-colors">
//         {/* Header with title and settings icon */}
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-3">
//             <div className="text-red-400">{icons[icon]}</div>
//             <h3 className="text-xl font-semibold text-white">{title}</h3>
//           </div>
//           <button
//             onClick={() => setShowModal(true)}
//             className="text-slate-400 hover:text-slate-200 transition-colors p-2 hover:bg-slate-800 rounded-lg"
//             title="Setup thresholds"
//           >
//             <Settings className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Gauge SVG */}
//         <div className="relative w-full max-w-[260px] h-32 mx-auto mb-6">
//           <svg viewBox="0 0 260 130" className="w-full h-full">            
//             {/* Colored arc (gradient) */}
//             <path
//               d="M 20 110 A 110 110 0 0 1 130 20 A 110 110 0 0 1 240 110"
//               fill="none"
//               stroke="url(#gaugeGradient)"
//               strokeWidth="30"
//               strokeLinecap="square"
//             />
            
//             {/* Gradient definition */}
//             <defs>
//               <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
//                 <stop offset="0%" stopColor="#ef4444" />
//                 <stop offset="10%" stopColor="#fbbf24" />
//                 <stop offset="50%" stopColor="#22c55e" />
//                 <stop offset="90%" stopColor="#fbbf24" />
//                 <stop offset="100%" stopColor="#ef4444" />
//               </linearGradient>
//             </defs>
            
//             {/* Needle (white line) */}
//             <line
//               x1="130"
//               y1="110"
//               x2="130"
//               y2="30"
//               stroke="white"
//               strokeWidth="3"
//               strokeLinecap="round"
//               transform={`rotate(${needleAngle} 130 110)`}
//               style={{ transition: 'transform 0.5s ease-out' }}
//             />
            
//             {/* Center circle */}
//             <circle cx="130" cy="110" r="8" fill="white" />
//           </svg>
          
//           {/* Labels - Min/Max values */}
//           <div className="absolute bottom-2 left-0 text-white text-sm font-medium">
//             {min}
//           </div>
//           <div className="absolute bottom-2 right-0 text-white text-sm font-medium">
//             {max}
//           </div>
          
//           {/* Labels - Danger thresholds */}
//           <div className="absolute top-0 left-0 text-white text-xs font-medium">
//             {Math.round(dangerThreshold1)}
//           </div>
//           <div className="absolute top-0 right-0 text-white text-xs font-medium">
//             {Math.round(dangerThreshold2)}
//           </div>
//         </div>

//         {/* Current Value Display */}
//         <div className="text-center">
//           <div className="text-5xl font-bold text-white mb-2">
//             {Math.round(value)}{unit}
//           </div>
          
//           {/* Status Badge */}
//           <div className={`inline-block px-4 py-1 rounded-full border ${statusBg} ${statusBorder}`}>
//             <span className={`text-sm font-medium ${statusColor}`}>{status}</span>
//           </div>
//         </div>
//       </div>

//       {/* Settings Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
//           <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-md w-full shadow-2xl">
//             <h3 className="text-xl text-slate-100 font-semibold mb-4">
//               Setup thresholds - {title}
//             </h3>

//             <div className="space-y-4">
//               {/* Min Input */}
//               <div>
//                 <label className="block text-slate-300 mb-2 text-sm font-medium">
//                   Min
//                 </label>
//                 <input
//                   type="number"
//                   value={formValues.min}
//                   onChange={(e) =>
//                     setFormValues({ ...formValues, min: Number(e.target.value) })
//                   }
//                   className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
//                 />
//               </div>

//               {/* Max Input */}
//               <div>
//                 <label className="block text-slate-300 mb-2 text-sm font-medium">
//                   Max
//                 </label>
//                 <input
//                   type="number"
//                   value={formValues.max}
//                   onChange={(e) =>
//                     setFormValues({ ...formValues, max: Number(e.target.value) })
//                   }
//                   className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
//                 />
//               </div>

//               {/* Info note */}
//               <div className="bg-slate-700/50 rounded-lg p-3 text-sm text-slate-400">
//                 <p>Danger threshold will be calculated automatically based on Min and Max.</p>
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex gap-3 mt-6">
//               <button
//                 onClick={handleCancel}
//                 className="flex-1 bg-slate-700 hover:bg-slate-600 transition-colors text-slate-100 py-2.5 rounded-lg font-medium"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSave}
//                 className="flex-1 bg-emerald-600 hover:bg-emerald-500 transition-colors text-white py-2.5 rounded-lg font-medium"
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

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
    onSave(numMin, numMax);
  };

  const delta = max - min;
  // Xử lý edge case khi delta <= 0 để tránh lỗi render
  const safeDelta = delta <= 0 ? 100 : delta;
  
  const gaugeMin = unit ==="%" ? 0 : min - safeDelta * 0.2;
  const gaugeMax = unit ==="%" ? 100 : max + safeDelta * 0.2;

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 flex flex-col items-center justify-center">
      {/* Title & Value */}
      <h1 className="text-slate-400 text-xl text-sm font-medium mb-1">{title} ({unit})</h1>

      {/* Gauge Library */}
      <div className=" max-w-[250px]">
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
                fontSize: 40,
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
                style: { fontSize: 13, fill: '#64748b', fontWeight: "bold" } 
              }
            },
          }}
        />
      </div>
      {/* Footer Info (Optional) */}
      <div className="mt-2 flex items-center gap-2 text-xs">
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