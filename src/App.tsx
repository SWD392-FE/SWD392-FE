import { useState, useEffect } from 'react';
import FaceLogin from './components/FaceLogin';
import POSSystem from './components/POSSystem';
import AdminDashboard from './components/AdminDashboard';
import AdminSetup from './components/AdminSetup';
import { UserAccount } from './lib/data';
import { checkIsAdmin, getClientMAC, clearDeviceMAC } from './lib/macDetector';

function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [showAdminSetup, setShowAdminSetup] = useState(false);

  useEffect(() => {
    // Check if current device is admin (synchronous, không cần async)
    const mac = getClientMAC();
    const admin = checkIsAdmin();
    
    setIsAdmin(admin);
    setIsCheckingAdmin(false);
    
    // Nếu có MAC nhưng không phải admin, hoặc không có MAC -> có thể hiển thị setup
    // Nhưng mặc định chỉ hiển thị setup nếu user muốn (có thể thêm button)
  }, []);

  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    // Nếu đang là admin, xóa MAC để đăng xuất khỏi admin mode
    if (isAdmin) {
      clearDeviceMAC();
      setIsAdmin(false);
    }
    // Xóa user session
    setCurrentUser(null);
  };

  const handleAdminSetupComplete = () => {
    const admin = checkIsAdmin();
    setIsAdmin(admin);
    setShowAdminSetup(false);
  };

  // Show loading while checking admin status
  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Show admin setup if needed
  if (showAdminSetup) {
    return (
      <AdminSetup
        onSetupComplete={handleAdminSetupComplete}
        onCancel={() => setShowAdminSetup(false)}
      />
    );
  }

  // If admin, show AdminDashboard (no login required)
  if (isAdmin) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  // If not admin, show normal user flow (FaceLogin -> POSSystem)
  // Thêm button để vào admin setup (chỉ hiển thị khi chưa login)
  return (
    <>
      {!currentUser ? (
        <div className="relative">
          <FaceLogin onLogin={handleLogin} />
          {/* Button để vào admin setup - hiển thị ở góc dưới bên phải */}
          <button
            onClick={() => setShowAdminSetup(true)}
            className="fixed bottom-6 right-6 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg z-50 transition-colors"
            title="Thiết lập Admin"
          >
            Admin Setup
          </button>
        </div>
      ) : (
        <POSSystem user={currentUser} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;
