import { ADMIN_MAC_ADDRESSES } from './config';

/**
 * Normalize MAC address format (convert : to - and uppercase)
 */
function normalizeMAC(mac: string): string {
  return mac.replace(/:/g, '-').toUpperCase();
}

/**
 * Check if MAC address is admin
 */
export function isAdminMAC(mac: string): boolean {
  const normalized = normalizeMAC(mac);
  return ADMIN_MAC_ADDRESSES.some(adminMAC => normalizeMAC(adminMAC) === normalized);
}

/**
 * Get MAC address from localStorage
 * Admin cần set cứng MAC vào localStorage một lần duy nhất
 * Có thể set bằng cách: localStorage.setItem('device_mac', 'D4-54-8B-89-FA-35')
 */
export function getClientMAC(): string | null {
  // Lấy từ localStorage (admin sẽ set cứng một lần)
  const mac = localStorage.getItem('device_mac');
  return mac;
}

/**
 * Set MAC address manually (dùng cho admin để set cứng)
 * Gọi hàm này một lần trên máy admin: setDeviceMAC('D4-54-8B-89-FA-35')
 */
export function setDeviceMAC(mac: string): void {
  localStorage.setItem('device_mac', mac);
}

/**
 * Clear MAC address (dùng khi đăng xuất admin)
 */
export function clearDeviceMAC(): void {
  localStorage.removeItem('device_mac');
}

/**
 * Check if current device is admin
 * Không cần backend, chỉ check localStorage
 */
export function checkIsAdmin(): boolean {
  const mac = getClientMAC();
  if (!mac) {
    return false;
  }
  
  return isAdminMAC(mac);
}

