export enum OrderStatus {
  RECEIVED = 'RECEIVED',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency?: string;
  category: string;
  imageUrl: string;
  isAvailable: boolean;
  dietary: string[];
  preparationTimeMinutes: number;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export interface OrderItemSnapshot {
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  itemTotal: number;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  deliveryAddress: string;
  notes?: string;
}

export interface OrderPricing {
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  tax: number;
  total: number;
  currency?: string;
}

export interface OrderStatusEvent {
  _id?: string;
  orderId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  timestamp: string;
  note: string;
  source: 'SYSTEM' | 'KITCHEN' | 'CUSTOMER' | 'SIMULATION';
}

export interface Order {
  _id: string;
  orderReference: string;
  customer: CustomerDetails;
  items: OrderItemSnapshot[];
  pricing: OrderPricing;
  paymentMethod?: 'CASH_ON_DELIVERY' | 'UPI' | 'CARD';
  status: OrderStatus;
  version: number;
  isSimulated: boolean;
  estimatedDeliveryMinutes: number;
  createdAt: string;
  updatedAt: string;
  events?: OrderStatusEvent[];
  allowedTransitions?: OrderStatus[];
  isSimulating?: boolean;
}

export interface User {
  _id: string;
  phone: string;
  name: string;
}

