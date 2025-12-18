import { useState } from 'react';
import { Thermometer, Sun, Wind, Droplets, Settings } from 'lucide-react';

interface GaugeProps {
  title: string;
  value: number;
  unit: string;
  status: string;
  min: number;
  max: number;
  dangerThreshold1: number;
  dangerThreshold2: number;
  icon: 'temperature' | 'light' | 'humidity' | 'soilMoisture' | 'waterLevel';
  onThresholdChange?: (min: number, max: number) => void;
}

export function Gauge({
  title,
  value,
  unit,
  status,
  min,
  max,
  dangerThreshold1,
  dangerThreshold2,
  icon,
  onThresholdChange,
}: GaugeProps) {
  const [showModal, setShowModal] = useState(false);
  const [formValues, setFormValues] = useState({ min, max });

  // Icon mapping
  const icons = {
    temperature: <Thermometer className="w-9 h-9" />,
    light: <Sun className="w-9 h-9" />,
    humidity: <Wind className="w-9 h-9" />,
    soilMoisture: <Droplets className="w-9 h-9" />,
    waterLevel: <Droplets className="w-9 h-9" />,
  };

  // Tính góc kim chỉ (-90° to 90°)
  const valuePercentage = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const needleAngle = valuePercentage * 180 - 90;

  // Tính màu status badge
  let statusColor = 'text-green-400';
  let statusBg = 'bg-green-400/20';
  let statusBorder = 'border-green-400/30';

  if (value < dangerThreshold1 || value > dangerThreshold2) {
    statusColor = 'text-red-400';
    statusBg = 'bg-red-400/20';
    statusBorder = 'border-red-400/30';
  } else if (
    value <= dangerThreshold1 + (dangerThreshold2 - dangerThreshold1) * 0.15 ||
    value >= dangerThreshold2 - (dangerThreshold2 - dangerThreshold1) * 0.15
  ) {
    statusColor = 'text-yellow-400';
    statusBg = 'bg-yellow-400/20';
    statusBorder = 'border-yellow-400/30';
  }

  // Handle save thresholds
  const handleSave = () => {
    if (onThresholdChange) {
      onThresholdChange(formValues.min, formValues.max);
    }
    setShowModal(false);
  };

  // Handle cancel
  const handleCancel = () => {
    setFormValues({ min, max }); // Reset to current values
    setShowModal(false);
  };

  return (
    <>
      {/* Main Gauge Card */}
      <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 hover:border-slate-600 transition-colors">
        {/* Header with title and settings icon */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-red-400">{icons[icon]}</div>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="text-slate-400 hover:text-slate-200 transition-colors p-2 hover:bg-slate-800 rounded-lg"
            title="Setup thresholds"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Gauge SVG */}
        <div className="relative w-full max-w-[260px] h-32 mx-auto mb-6">
          <svg viewBox="0 0 260 130" className="w-full h-full">            
            {/* Colored arc (gradient) */}
            <path
              d="M 20 110 A 110 110 0 0 1 130 20 A 110 110 0 0 1 240 110"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="20"
              strokeLinecap="round"
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="10%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#22c55e" />
                <stop offset="90%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            
            {/* Needle (white line) */}
            <line
              x1="130"
              y1="110"
              x2="130"
              y2="30"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${needleAngle} 130 110)`}
              style={{ transition: 'transform 0.5s ease-out' }}
            />
            
            {/* Center circle */}
            <circle cx="130" cy="110" r="8" fill="white" />
          </svg>
          
          {/* Labels - Min/Max values */}
          <div className="absolute bottom-2 left-0 text-white text-sm font-medium">
            {min}
          </div>
          <div className="absolute bottom-2 right-0 text-white text-sm font-medium">
            {max}
          </div>
          
          {/* Labels - Danger thresholds */}
          <div className="absolute top-0 left-0 text-white text-xs font-medium">
            {Math.round(dangerThreshold1)}
          </div>
          <div className="absolute top-0 right-0 text-white text-xs font-medium">
            {Math.round(dangerThreshold2)}
          </div>
        </div>

        {/* Current Value Display */}
        <div className="text-center">
          <div className="text-5xl font-bold text-white mb-2">
            {Math.round(value)}{unit}
          </div>
          
          {/* Status Badge */}
          <div className={`inline-block px-4 py-1 rounded-full border ${statusBg} ${statusBorder}`}>
            <span className={`text-sm font-medium ${statusColor}`}>{status}</span>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-md w-full shadow-2xl">
            <h3 className="text-xl text-slate-100 font-semibold mb-4">
              Setup thresholds - {title}
            </h3>

            <div className="space-y-4">
              {/* Min Input */}
              <div>
                <label className="block text-slate-300 mb-2 text-sm font-medium">
                  Min
                </label>
                <input
                  type="number"
                  value={formValues.min}
                  onChange={(e) =>
                    setFormValues({ ...formValues, min: Number(e.target.value) })
                  }
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>

              {/* Max Input */}
              <div>
                <label className="block text-slate-300 mb-2 text-sm font-medium">
                  Max
                </label>
                <input
                  type="number"
                  value={formValues.max}
                  onChange={(e) =>
                    setFormValues({ ...formValues, max: Number(e.target.value) })
                  }
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>

              {/* Info note */}
              <div className="bg-slate-700/50 rounded-lg p-3 text-sm text-slate-400">
                <p>Danger threshold will be calculated automatically based on Min and Max.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancel}
                className="flex-1 bg-slate-700 hover:bg-slate-600 transition-colors text-slate-100 py-2.5 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 transition-colors text-white py-2.5 rounded-lg font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}