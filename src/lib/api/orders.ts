import { API_BASE_URL } from '../config';

// DTOs matching backend (PascalCase)
export interface OrderDto {
  OrderID: number;
  UserID: number;
  OrderDate: string;
  Status: string;
  ShippingAddress: string;
  TotalAmount: number;
  ShippingMethodName: string;
  OrderDetails: OrderItemDto[];
}

export interface OrderItemDto {
  OrderDetailID: number;
  ProductID: number;
  ProductName: string;
  Quantity: number;
  UnitPrice: number;
  SubTotal: number;
}

// Additional DTOs for creation/status update
export interface CreateOrderDto {
  ShippingAddress: string;
  ShippingMethodID: number;
  PaymentMethodID: number;
  ProviderRef?: string;
}

export interface UpdateOrderStatusDto {
  Status: string;
}

export interface PaymentMethodDto {
  PaymentMethodID: number;
  MethodName: string;
  IsActive: boolean;
}

export interface ShippingMethodDto {
  ShippingMethodID: number;
  MethodName: string;
  BaseFee: number;
  IsActive: boolean;
}

// Frontend Order type (mapped from OrderDto)
export interface Order {
  id: number;
  orderID: number;
  userID: number;
  orderNumber: string;
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipping' | 'Completed' | 'Cancelled';
  shippingAddress: string;
  shippingMethodName: string;
  createdAt: string;
  items: OrderItem[];
  itemsCount: number;
}

export interface OrderItem {
  orderDetailID: number;
  productID: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

/**
 * Convert OrderDto to Order (frontend format)
 */
export function orderDtoToOrder(dto: OrderDto): Order {
  return {
    id: dto.OrderID,
    orderID: dto.OrderID,
    userID: dto.UserID,
    orderNumber: `ORD-${dto.OrderID.toString().padStart(6, '0')}`,
    totalAmount: dto.TotalAmount,
    status: (dto.Status as Order['status']) || 'Pending',
    shippingAddress: dto.ShippingAddress,
    shippingMethodName: dto.ShippingMethodName,
    createdAt: dto.OrderDate,
    items: dto.OrderDetails?.map((item) => ({
      orderDetailID: item.OrderDetailID,
      productID: item.ProductID,
      productName: item.ProductName,
      quantity: item.Quantity,
      unitPrice: item.UnitPrice,
      subTotal: item.SubTotal,
    })) || [],
    itemsCount: dto.OrderDetails?.reduce((sum, item) => sum + item.Quantity, 0) || 0,
  };
}

/**
 * Get all orders
 */
export async function getAllOrders(): Promise<Order[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch orders'}`);
    }

    const dtos: OrderDto[] = await response.json();
    return dtos.map(orderDtoToOrder);
  } catch (error) {
    console.error('Error fetching orders:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Không thể kết nối đến backend. Vui lòng kiểm tra API_BASE_URL và đảm bảo backend đang chạy.');
    }
    throw error;
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(id: number): Promise<Order> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }

    const dto: OrderDto = await response.json();
    return orderDtoToOrder(dto);
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

/**
 * Get orders by user ID
 */
export async function getUserOrders(userId: number): Promise<Order[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user orders');
    }

    const dtos: OrderDto[] = await response.json();
    return dtos.map(orderDtoToOrder);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
}

/**
 * Create order
 */
export async function createOrder(userId: number, dto: CreateOrderDto): Promise<Order> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/user/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create order');
    }

    const createdDto: OrderDto = await response.json();
    return orderDtoToOrder(createdDto);
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(id: number, status: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Status: status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update order status');
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

/**
 * Get payment methods
 */
export async function getPaymentMethods(): Promise<PaymentMethodDto[]> {
  const response = await fetch(`${API_BASE_URL}/api/orders/payment-methods`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch payment methods'}`);
  }
  return response.json();
}

/**
 * Get shipping methods
 */
export async function getShippingMethods(): Promise<ShippingMethodDto[]> {
  const response = await fetch(`${API_BASE_URL}/api/orders/shipping-methods`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch shipping methods'}`);
  }
  return response.json();
}





