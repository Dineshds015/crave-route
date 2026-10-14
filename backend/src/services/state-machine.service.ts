export enum OrderStatus {
  RECEIVED = 'RECEIVED',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export const TRANSITION_MAP: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.RECEIVED]: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
  [OrderStatus.ACCEPTED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.READY],
  [OrderStatus.READY]: [OrderStatus.OUT_FOR_DELIVERY],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

export const SIMULATION_ORDER: OrderStatus[] = [
  OrderStatus.RECEIVED,
  OrderStatus.ACCEPTED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
];

export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  const allowed = TRANSITION_MAP[from] || [];
  return allowed.includes(to);
}

export function getAllowedTransitions(from: OrderStatus): OrderStatus[] {
  return TRANSITION_MAP[from] || [];
}

export function getNextSimulationStatus(current: OrderStatus): OrderStatus | null {
  const idx = SIMULATION_ORDER.indexOf(current);
  if (idx === -1 || idx >= SIMULATION_ORDER.length - 1) {
    return null;
  }
  return SIMULATION_ORDER[idx + 1];
}

export function getDefaultEventNote(toStatus: OrderStatus): string {
  switch (toStatus) {
    case OrderStatus.RECEIVED:
      return 'Order received by the restaurant and entered into the kitchen queue.';
    case OrderStatus.ACCEPTED:
      return 'Kitchen confirmed order. Preparing workstation and fresh ingredients.';
    case OrderStatus.PREPARING:
      return 'Chef has begun hand-crafting and frying your order to golden perfection.';
    case OrderStatus.READY:
      return 'Order is freshly packed in thermal artisanal containers awaiting courier dispatch.';
    case OrderStatus.OUT_FOR_DELIVERY:
      return 'Courier picked up your order and is en route to your address.';
    case OrderStatus.DELIVERED:
      return 'Order safely handed over. Enjoy your meal!';
    case OrderStatus.CANCELLED:
      return 'Order has been cancelled.';
    default:
      return `Order status updated to ${toStatus}.`;
  }
}
