import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddDeviceForm () {
  const [espId, setEspId] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (!espId.trim()) return;

    setStatus('loading');
    setMessage('');

    try {
      // Gọi API Backend
      const response = await fetch('/api/esp/bind', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            esp_id: espId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra');
      }

      setStatus('success');
      setMessage(data.message);
      setEspId(''); // Reset ô nhập liệu
      
      // Tự động tắt thông báo sau 3s
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
        navigate("/dashboard")
      }, 3000);      
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message);
    } finally {
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-lg mt-10 border border-gray-100">
      <div className="p-8">
        <div className="flex items-center gap-2 mb-4">
          {/* Icon SVG đơn giản */}
          <div className="p-2 bg-green-500 rounded-full text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Kết nối ESP</h2>
        </div>
        
        <p className="text-gray-500 mb-6 text-sm">
          Nhập mã ESP ID được in trên vỏ thiết bị để bắt đầu điều khiển.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="esp_id" className="block text-sm font-medium text-gray-700 mb-1">
              Mã thiết bị (ESP ID)
            </label>
            <input
              type="text"
              id="esp_id"
              value={espId}
              onChange={(e) => setEspId(e.target.value)}
              placeholder="Ví dụ: esp32_1307557"
              className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              disabled={status === 'loading'}
            />
          </div>

          {/* Khu vực thông báo lỗi/thành công */}
          {status === 'error' && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-pulse">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {message}
            </div>
          )}

          {status === 'success' && (
            <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading' || !espId}
            className={`w-full py-2.5 px-4 rounded-lg font-medium text-white transition-colors duration-200 
              ${status === 'loading' 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg'}`}
          >
            {status === 'loading' ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang kết nối...
              </span>
            ) : (
              'Kết nối thiết bị'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};