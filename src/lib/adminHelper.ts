/**
 * Helper functions cho admin
 * Dùng để set MAC address vào localStorage
 */

import { setDeviceMAC, checkIsAdmin } from './macDetector';

/**
 * Set MAC address cho máy hiện tại
 * Gọi hàm này trên máy admin một lần duy nhất
 * 
 * Cách dùng:
 * 1. Mở Console browser (F12)
 * 2. Gõ: window.setAdminMAC('D4-54-8B-89-FA-35')
 * 3. Refresh trang
 */
export function setAdminMAC(mac: string): void {
  setDeviceMAC(mac);
  console.log(`✅ Đã set MAC address: ${mac}`);
  console.log('🔄 Vui lòng refresh trang để áp dụng thay đổi');
}

/**
 * Check xem máy hiện tại có phải admin không
 */
export function checkAdminStatus(): void {
  const isAdmin = checkIsAdmin();
  const mac = localStorage.getItem('device_mac');
  
  console.log('📊 Trạng thái Admin:');
  console.log(`   MAC hiện tại: ${mac || 'Chưa set'}`);
  console.log(`   Là admin: ${isAdmin ? '✅ Có' : '❌ Không'}`);
}

// Expose functions to window để dùng trong console
if (typeof window !== 'undefined') {
  (window as any).setAdminMAC = setAdminMAC;
  (window as any).checkAdminStatus = checkAdminStatus;
}






