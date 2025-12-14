import { API_BASE_URL } from '../config';

// DTOs matching backend
export interface OrderDto {
  orderID: number;
  userID: number;
  orderNumber?: string;
  totalAmount: number;
  status: string;
  shippingAddress?: string;
  shippingMethodID?: number;
  paymentMethodID?: number;
  providerRef?: string;
  createdAt: string;
  orderItems?: OrderItemDto[];
}

export interface OrderItemDto {
  orderItemID: number;
  orderID: number;
  productID: number;
  quantity: number;
  price: number;
  productName?: string;
}

export interface CreateOrderDto {
  shippingAddress?: string;
  shippingMethodID?: number;
  paymentMethodID?: number;
  providerRef?: string;
}

export interface UpdateOrderStatusDto {
  status: string;
}

// Frontend Order type (mapped from OrderDto)
export interface Order {
  id: number;
  orderID: number;
  userID: number;
  orderNumber: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled';
  shippingAddress?: string;
  shippingMethodID?: number;
  paymentMethodID?: number;
  providerRef?: string;
  createdAt: string;
  items?: OrderItem[];
  itemsCount?: number;
}

export interface OrderItem {
  orderItemID: number;
  orderID: number;
  productID: number;
  quantity: number;
  price: number;
  productName?: string;
}

/**
 * Convert OrderDto to Order (frontend format)
 */
export function orderDtoToOrder(dto: OrderDto): Order {
  const statusMap: Record<string, Order['status']> = {
    'Pending': 'pending',
    'Processing': 'processing',
    'Shipping': 'shipping',
    'Completed': 'completed',
    'Cancelled': 'cancelled',
  };

  return {
    id: dto.orderID,
    orderID: dto.orderID,
    userID: dto.userID,
    orderNumber: dto.orderNumber || `ORD-${dto.orderID.toString().padStart(6, '0')}`,
    totalAmount: dto.totalAmount,
    status: statusMap[dto.status] || 'pending',
    shippingAddress: dto.shippingAddress,
    shippingMethodID: dto.shippingMethodID,
    paymentMethodID: dto.paymentMethodID,
    providerRef: dto.providerRef,
    createdAt: dto.createdAt,
    items: dto.orderItems?.map(item => ({
      orderItemID: item.orderItemID,
      orderID: item.orderID,
      productID: item.productID,
      quantity: item.quantity,
      price: item.price,
      productName: item.productName,
    })),
    itemsCount: dto.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0,
  };
}

/**
 * Get all orders
 */
export async function getAllOrders(): Promise<Order[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    const dtos: OrderDto[] = await response.json();
    return dtos.map(orderDtoToOrder);
  } catch (error) {
    console.error('Error fetching orders:', error);
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
      body: JSON.stringify({ status }),
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



