import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext"; // Sửa đường dẫn nếu cần
import { GlassWater, Lightbulb, type LucideIcon } from "lucide-react";

// --- PHẦN 1: UI COMPONENTS (DeviceSwitch & DeviceCard) ---

interface DeviceSwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

const DeviceSwitch = ({ checked, onChange, disabled = false }: DeviceSwitchProps) => {
  const { user } = useAuth();
  console.log(user)

  return (
    <button
      onClick={!disabled ? onChange : undefined}
      disabled={disabled}
      className={`
        relative w-12 h-6 rounded-full transition-colors duration-300
        ${checked ? 'bg-emerald-500' : 'bg-slate-600'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-opacity-90'}
      `}
    >
      <span
        className={`
          absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300
          ${checked ? 'translate-x-6' : 'translate-x-0'}
        `}
      />
    </button>
  );
};

interface DeviceCardProps {
  label: string;
  icon: LucideIcon;
  isOn: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

const DeviceCard = ({
  label,
  icon: Icon,
  isOn,
  isLoading,
  disabled,
  onToggle,
}: DeviceCardProps) => {
  return (
    <div className={`
      flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 shadow-sm
      ${disabled ? 'opacity-75' : ''}
    `}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg transition-colors ${isOn ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
          <Icon size={20} />
        </div>
        <div>
          <h3 className="text-slate-200 font-medium">{label}</h3>
          <p className="text-xs text-slate-500">
            {isLoading ? 'Đang xử lý...' : (isOn ? 'Đang hoạt động' : 'Đang tắt')}
          </p>
        </div>
      </div>
      <DeviceSwitch 
        checked={isOn} 
        onChange={onToggle} 
        disabled={disabled || isLoading} 
      />
    </div>
  );
};

// --- PHẦN 2: LOGIC COMPONENT (DeviceController) ---

// Cấu hình để map từ "Code" sang "Giao diện"
const DEVICE_CONFIG = {
  PUMP: {
    label: "Máy bơm nước",
    apiName: "pump",
    icon: GlassWater,
  },
  GROW_LIGHT: {
    label: "Đèn quang hợp",
    apiName: "light",
    icon: Lightbulb,
  }
};

interface DeviceControllerProps {
  deviceType: "PUMP" | "GROW_LIGHT"; // Chỉ cho phép 2 giá trị này để tránh lỗi
}

export default function DeviceController({ deviceType }: DeviceControllerProps) {
  const { user } = useAuth();
  
  const [isOn, setIsOn] = useState(false);
  const [loading, setLoading] = useState(false);

  const config = DEVICE_CONFIG[deviceType];

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/device/${config.apiName}`);
      const data = await response.json();

      if (data.error) throw new Error(data.error);
      
      if (data.isSuccess && data.data) {
        // Backend trả về object device, lấy field status
        setIsOn(data.data.status); 
      }
    } catch (e) {
      console.error(`Không thể fetch ${deviceType}:`, e);
    }
  };

  // 2. Gọi fetch khi component được mount hoặc đổi ESP ID
  useEffect(() => {
    fetchStatus();
  }, []);

  // 3. Hàm xử lý Toggle (Bật/Tắt)
  const handleToggle = async () => {
    if (!user || !user.esp_id || user.esp_id === '') {
      alert("Không tìm thấy user hoặc chưa kết nối ESP")
      return;
    }

    setLoading(true);
    const newStatus = !isOn; // Trạng thái dự kiến

    try {
      // Gọi API Control
      const response = await fetch('/api/device', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          esp_id: user.esp_id,
          name: deviceType, // "PUMP" hoặc "GROW_LIGHT"
          status: newStatus
        }),
      });

      const data = await response.json();

      if (data.isSuccess) {
        console.log("Bật / tắt thành công")
        setIsOn(newStatus)
      } else {
        // Nếu lỗi thì không làm gì (hoặc hiện thông báo)
        console.error('Lỗi:', data.message);
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
    } finally {
      setLoading(false);
    }
  };

  // Logic kiểm tra xem có bị Disable bởi chế độ Auto không
  const isAutoMode = user?.is_auto === true;
  // Render ra UI Card đã định nghĩa ở trên
  return (
    <DeviceCard
      label={config.label}
      icon={config.icon}
      isOn={isOn}
      isLoading={loading}
      disabled={isAutoMode} // Disable nếu đang Auto
      onToggle={handleToggle}
    />
  );
}