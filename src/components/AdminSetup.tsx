import { useState } from 'react';
import { setDeviceMAC, checkIsAdmin } from '../lib/macDetector';
import { Package, Shield, CheckCircle, XCircle } from 'lucide-react';

interface AdminSetupProps {
  onSetupComplete: () => void;
  onCancel?: () => void;
}

export default function AdminSetup({ onSetupComplete, onCancel }: AdminSetupProps) {
  const [macAddress, setMacAddress] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');

  const handleSetMAC = () => {
    if (!macAddress.trim()) {
      setMessage('Vui lòng nhập MAC address');
      setIsValid(false);
      return;
    }

    // Normalize MAC address
    const normalized = macAddress.replace(/:/g, '-').toUpperCase().trim();
    
    // Basic validation
    const macPattern = /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/;
    if (!macPattern.test(normalized)) {
      setMessage('MAC address không hợp lệ. Ví dụ: D4-54-8B-89-FA-35');
      setIsValid(false);
      return;
    }

    // Set MAC address
    setDeviceMAC(normalized);
    setIsValid(true);
    setMessage(`Đã set MAC address: ${normalized}`);
    
    // Check if it's admin
    setTimeout(() => {
      const isAdmin = checkIsAdmin();
      if (isAdmin) {
        setMessage('✅ MAC address hợp lệ! Đang chuyển đến Admin Dashboard...');
        setTimeout(() => {
          onSetupComplete();
        }, 1500);
      } else {
        setMessage('⚠️ MAC address không phải admin. Vui lòng kiểm tra lại.');
        setIsValid(false);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Thiết lập Admin</h1>
          <p className="text-sm text-gray-600">
            Nhập MAC address để truy cập Admin Dashboard
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              MAC Address
            </label>
            <input
              type="text"
              value={macAddress}
              onChange={(e) => {
                setMacAddress(e.target.value);
                setIsValid(null);
                setMessage('');
              }}
              placeholder="D4-54-8B-89-FA-35 hoặc D4:54:8B:89:FA:35"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSetMAC();
                }
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Ví dụ: <span className="font-mono">D4-54-8B-89-FA-35</span>
            </p>
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 ${
                isValid === true
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : isValid === false
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}
            >
              {isValid === true ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : isValid === false ? (
                <XCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <Package className="w-5 h-5 flex-shrink-0" />
              )}
              <p className="text-sm">{message}</p>
            </div>
          )}

          <div className="flex gap-3">
            {onCancel && (
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
            )}
            <button
              onClick={handleSetMAC}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Xác nhận
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => {
                localStorage.removeItem('device_mac');
                setMacAddress('');
                setIsValid(null);
                setMessage('');
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Xóa MAC đã lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



