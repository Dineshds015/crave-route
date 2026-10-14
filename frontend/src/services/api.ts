import { MenuItem, Order, OrderStatus, CustomerDetails, User } from '@/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchMenu(availableOnly = false): Promise<MenuItem[]> {
  const query = availableOnly ? '?availableOnly=true' : '';
  const res = await fetch(`${API_BASE_URL}/api/menu${query}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch menu: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

export async function fetchOrder(idOrRef: string): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}/api/orders/${encodeURIComponent(idOrRef)}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Order #${idOrRef} was not found.`);
    }
    throw new Error(`Failed to fetch order: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

export async function fetchOrders(
  refs?: string[],
  status?: OrderStatus,
  phone?: string
): Promise<Order[]> {
  const params = new URLSearchParams();
  if (refs && refs.length > 0) {
    params.set('refs', refs.join(','));
  }
  if (status) {
    params.set('status', status);
  }
  if (phone) {
    params.set('phone', phone);
  }

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/api/orders${query}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch orders: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

export async function sendOtp(phone: string): Promise<{ phone: string; otp: string; message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to send OTP');
  }
  return json.data;
}

export async function verifyOtp(phone: string, otp: string): Promise<{ user: User; token: string }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, otp }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Invalid OTP');
  }
  return json.data;
}

export async function fetchDemoUsers(): Promise<{ phone: string; name: string; defaultOtp: string }[]> {
  const res = await fetch(`${API_BASE_URL}/api/auth/demo-users`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export async function createOrder(payload: {
  customer: CustomerDetails;
  items: { menuItemId: string; quantity: number }[];
  paymentMethod?: 'CASH_ON_DELIVERY' | 'UPI' | 'CARD';
  idempotencyKey?: string;
  isSimulated?: boolean;
}): Promise<Order> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (payload.idempotencyKey) {
    headers['Idempotency-Key'] = payload.idempotencyKey;
  }

  const res = await fetch(`${API_BASE_URL}/api/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    const errorMsg = json.error || (json.errors ? json.errors.map((e: any) => e.message).join(', ') : 'Order creation failed');
    throw new Error(errorMsg);
  }

  return json.data;
}

export async function transitionOrderStatus(
  idOrRef: string,
  status: OrderStatus,
  note?: string,
  expectedVersion?: number
): Promise<Order> {
  const res = await fetch(
    `${API_BASE_URL}/api/orders/${encodeURIComponent(idOrRef)}/status`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note, expectedVersion }),
    }
  );

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || `Failed to transition status to ${status}`);
  }

  return json.data;
}

export async function deleteOrder(idOrRef: string): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/api/orders/${encodeURIComponent(idOrRef)}`,
    {
      method: 'DELETE',
    }
  );

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to delete order');
  }
}

export async function triggerSimulation(
  idOrRef: string,
  delayMs = 3500
): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/api/orders/${encodeURIComponent(idOrRef)}/simulate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delayMs }),
    }
  );
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error || 'Failed to trigger simulation');
  }
}

export function getOrderEventStreamUrl(idOrRef: string): string {
  return `${API_BASE_URL}/api/orders/${encodeURIComponent(idOrRef)}/events`;
}
