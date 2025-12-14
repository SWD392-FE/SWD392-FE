import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import type { UserAccount, Product, PurchaseHistoryEntry } from '../data';

// Backend DTOs
interface BackendProductDto {
  productID: number;
  categoryID: number;
  categoryName: string;
  productName: string;
  sku: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  createdAt: string;
  productDetail?: {
    shortDescription?: string;
    fullDescription?: string;
    imageUrl?: string;
    weight?: number;
    width?: number;
    height?: number;
    depth?: number;
  };
}

interface BackendUserDto {
  userID: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  createdAt: string;
  isActive: boolean;
}

interface BackendOrderDto {
  orderID: number;
  userID: number;
  orderDate: string;
  status: string;
  shippingAddress: string;
  totalAmount: number;
  shippingMethodName: string;
  orderDetails: Array<{
    orderDetailID: number;
    productID: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    subTotal: number;
  }>;
}

// Face Login Request/Response
export interface FaceLoginRequest {
  faceDescriptor: number[];
  imageData?: string; // Base64 encoded image (optional)
}

export interface FaceLoginResponse {
  user: UserAccount;
  token?: string;
}

// Helper functions to map backend DTOs to frontend types
function mapBackendProductToFrontend(backend: BackendProductDto): Product {
  return {
    id: backend.productID.toString(),
    name: backend.productName,
    barcode: backend.sku,
    price: Number(backend.price),
    stock: backend.stockQuantity,
    location_id: '', // Will be set if location data exists
    image_url: backend.productDetail?.imageUrl || 'https://images.pexels.com/photos/164005/pexels-photo-164005.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: backend.categoryName,
    location: undefined, // Location mapping can be added later if needed
  };
}

function mapBackendUserToFrontend(backend: BackendUserDto): UserAccount {
  return {
    userID: backend.userID,
    fullName: backend.fullName,
    email: backend.email,
    passwordHash: '', // Not returned from API
    phoneNumber: backend.phoneNumber,
    createdAt: backend.createdAt,
    isActive: backend.isActive,
  };
}

function mapBackendOrderToFrontend(backend: BackendOrderDto): PurchaseHistoryEntry {
  return {
    id: backend.orderID.toString(),
    userID: backend.userID,
    orderNumber: `POS${backend.orderID.toString().padStart(8, '0')}`,
    items: backend.orderDetails.length,
    totalAmount: Number(backend.totalAmount),
    method: backend.shippingAddress ? 'delivery' : 'pickup',
    status: backend.status.toLowerCase() as 'completed' | 'preparing' | 'shipping',
    createdAt: backend.orderDate,
  };
}

// Create Order Request
export interface CreateOrderRequest {
  userId: number;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentMethod: 'cash' | 'transfer';
  fulfillmentMethod: 'pickup' | 'delivery';
  deliveryInfo?: {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    district: string;
    ward: string;
  };
}

export interface CreateOrderResponse {
  order: PurchaseHistoryEntry;
  orderNumber: string;
}

// API Services
export const authService = {
  /**
   * Đăng nhập bằng face recognition
   */
  async faceLogin(faceDescriptor: number[], imageData?: string): Promise<FaceLoginResponse | null> {
    const response = await apiClient.post<BackendUserDto>(API_ENDPOINTS.FACE_LOGIN, {
      faceDescriptor,
      imageData,
    } as FaceLoginRequest);

    if (response.success && response.data) {
      const user = mapBackendUserToFrontend(response.data);
      return { user };
    }

    console.error('Face login failed:', response.error);
    return null;
  },
};

export const productService = {
  /**
   * Lấy tất cả sản phẩm
   */
  async getAllProducts(): Promise<Product[]> {
    const response = await apiClient.get<BackendProductDto[]>(API_ENDPOINTS.PRODUCTS);

    if (response.success && response.data) {
      return Array.isArray(response.data) 
        ? response.data.map(mapBackendProductToFrontend)
        : [];
    }

    console.error('Failed to fetch products:', response.error);
    return [];
  },

  /**
   * Lấy sản phẩm theo ID
   */
  async getProductById(id: string): Promise<Product | null> {
    const response = await apiClient.get<BackendProductDto>(API_ENDPOINTS.PRODUCT_BY_ID(id));

    if (response.success && response.data) {
      return mapBackendProductToFrontend(response.data);
    }

    console.error('Failed to fetch product:', response.error);
    return null;
  },

  /**
   * Lấy sản phẩm theo barcode
   */
  async getProductByBarcode(barcode: string): Promise<Product | null> {
    const response = await apiClient.get<BackendProductDto>(API_ENDPOINTS.PRODUCT_BY_BARCODE(barcode));

    if (response.success && response.data) {
      return mapBackendProductToFrontend(response.data);
    }

    console.error('Failed to fetch product by barcode:', response.error);
    return null;
  },
};

export const orderService = {
  /**
   * Tạo đơn hàng mới
   */
  async createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse | null> {
    // Map frontend order data to backend format
    const backendOrderData = {
      items: orderData.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: orderData.totalAmount,
      paymentMethod: orderData.paymentMethod, // 'cash' or 'transfer'
      fulfillmentMethod: orderData.fulfillmentMethod, // 'pickup' or 'delivery'
      deliveryInfo: orderData.deliveryInfo ? {
        fullName: orderData.deliveryInfo.fullName,
        phone: orderData.deliveryInfo.phone,
        email: orderData.deliveryInfo.email,
        address: orderData.deliveryInfo.address,
        city: orderData.deliveryInfo.city,
        district: orderData.deliveryInfo.district,
        ward: orderData.deliveryInfo.ward,
      } : undefined,
    };

    const response = await apiClient.post<BackendOrderDto>(
      `/orders/user/${orderData.userId}/from-items`,
      backendOrderData
    );

    if (response.success && response.data) {
      const order = mapBackendOrderToFrontend(response.data);
      return {
        order,
        orderNumber: order.orderNumber,
      };
    }

    console.error('Failed to create order:', response.error);
    return null;
  },

  /**
   * Lấy đơn hàng theo ID
   */
  async getOrderById(id: string): Promise<PurchaseHistoryEntry | null> {
    const response = await apiClient.get<BackendOrderDto>(API_ENDPOINTS.ORDER_BY_ID(id));

    if (response.success && response.data) {
      return mapBackendOrderToFrontend(response.data);
    }

    console.error('Failed to fetch order:', response.error);
    return null;
  },

  /**
   * Lấy lịch sử đơn hàng của user
   */
  async getUserOrders(userId: number): Promise<PurchaseHistoryEntry[]> {
    const response = await apiClient.get<BackendOrderDto[]>(
      API_ENDPOINTS.USER_ORDERS(userId)
    );

    if (response.success && response.data) {
      return Array.isArray(response.data)
        ? response.data.map(mapBackendOrderToFrontend)
        : [];
    }

    console.error('Failed to fetch user orders:', response.error);
    return [];
  },
};

export const userService = {
  /**
   * Lấy thông tin user theo ID
   */
  async getUserById(id: number): Promise<UserAccount | null> {
    const response = await apiClient.get<BackendUserDto>(API_ENDPOINTS.USER_BY_ID(id));

    if (response.success && response.data) {
      return mapBackendUserToFrontend(response.data);
    }

    console.error('Failed to fetch user:', response.error);
    return null;
  },
};

