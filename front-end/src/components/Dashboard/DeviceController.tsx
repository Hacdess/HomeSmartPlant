import { useState } from "react";

interface DeviceControlProps {
  name: string;
  description?: string;
  status: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

/**
 * DeviceControl - Toggle switch component
 * Hiển thị tên thiết bị, mô tả và toggle switch
 */
export default function DeviceController({
  name,
  description,
  status,
  onToggle,
  disabled = false,
}: DeviceControlProps) {
  return (
    //Container 
    <div className={`flex items-center justify-between py-3 ${disabled ? 'opacity-50' : ''}`}>
        {/* Name and Description */}
      <div>
        <div className="text-slate-100">{name}</div>
        {description && (
          <div className="text-sm text-slate-400">{description}</div>
        )}
      </div>
      {/* Toggle Switch */}
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`w-12 h-6 rounded-full transition-all ${
          status ? 'bg-emerald-500' : 'bg-slate-600'
        } ${disabled ? 'cursor-not-allowed' : 'hover:brightness-110'}`}
      >
        {/* Switch Knob */}
        <div
          className={`w-5 h-5 bg-white rounded-full transition-transform ${
            status ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}