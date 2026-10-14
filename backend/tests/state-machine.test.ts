import { describe, it, expect } from 'vitest';
import {
  OrderStatus,
  isValidTransition,
  getNextSimulationStatus,
  getAllowedTransitions,
} from '../src/services/state-machine.service.js';

describe('Order State Machine', () => {
  describe('Valid forward progression', () => {
    it('allows progression from RECEIVED through to DELIVERED in order', () => {
      expect(isValidTransition(OrderStatus.RECEIVED, OrderStatus.ACCEPTED)).toBe(true);
      expect(isValidTransition(OrderStatus.ACCEPTED, OrderStatus.PREPARING)).toBe(true);
      expect(isValidTransition(OrderStatus.PREPARING, OrderStatus.READY)).toBe(true);
      expect(isValidTransition(OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY)).toBe(true);
      expect(isValidTransition(OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED)).toBe(true);
    });
  });

  describe('Cancellation rules', () => {
    it('allows cancellation from RECEIVED or ACCEPTED', () => {
      expect(isValidTransition(OrderStatus.RECEIVED, OrderStatus.CANCELLED)).toBe(true);
      expect(isValidTransition(OrderStatus.ACCEPTED, OrderStatus.CANCELLED)).toBe(true);
    });

    it('forbids cancellation once PREPARING, READY, OUT_FOR_DELIVERY, or DELIVERED', () => {
      expect(isValidTransition(OrderStatus.PREPARING, OrderStatus.CANCELLED)).toBe(false);
      expect(isValidTransition(OrderStatus.READY, OrderStatus.CANCELLED)).toBe(false);
      expect(isValidTransition(OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED)).toBe(false);
      expect(isValidTransition(OrderStatus.DELIVERED, OrderStatus.CANCELLED)).toBe(false);
    });
  });

  describe('Invalid or out-of-order transitions', () => {
    it('rejects skipping stages (e.g. RECEIVED -> READY or OUT_FOR_DELIVERY)', () => {
      expect(isValidTransition(OrderStatus.RECEIVED, OrderStatus.READY)).toBe(false);
      expect(isValidTransition(OrderStatus.RECEIVED, OrderStatus.OUT_FOR_DELIVERY)).toBe(false);
      expect(isValidTransition(OrderStatus.RECEIVED, OrderStatus.DELIVERED)).toBe(false);
      expect(isValidTransition(OrderStatus.ACCEPTED, OrderStatus.DELIVERED)).toBe(false);
    });

    it('rejects backward transitions', () => {
      expect(isValidTransition(OrderStatus.PREPARING, OrderStatus.ACCEPTED)).toBe(false);
      expect(isValidTransition(OrderStatus.READY, OrderStatus.PREPARING)).toBe(false);
      expect(isValidTransition(OrderStatus.DELIVERED, OrderStatus.OUT_FOR_DELIVERY)).toBe(false);
    });

    it('rejects any transition from terminal states DELIVERED and CANCELLED', () => {
      expect(isValidTransition(OrderStatus.DELIVERED, OrderStatus.CANCELLED)).toBe(false);
      expect(isValidTransition(OrderStatus.DELIVERED, OrderStatus.RECEIVED)).toBe(false);
      expect(isValidTransition(OrderStatus.CANCELLED, OrderStatus.ACCEPTED)).toBe(false);
      expect(isValidTransition(OrderStatus.CANCELLED, OrderStatus.RECEIVED)).toBe(false);
    });
  });

  describe('Simulation helper', () => {
    it('returns the next sequential status for active orders', () => {
      expect(getNextSimulationStatus(OrderStatus.RECEIVED)).toBe(OrderStatus.ACCEPTED);
      expect(getNextSimulationStatus(OrderStatus.ACCEPTED)).toBe(OrderStatus.PREPARING);
      expect(getNextSimulationStatus(OrderStatus.PREPARING)).toBe(OrderStatus.READY);
      expect(getNextSimulationStatus(OrderStatus.READY)).toBe(OrderStatus.OUT_FOR_DELIVERY);
      expect(getNextSimulationStatus(OrderStatus.OUT_FOR_DELIVERY)).toBe(OrderStatus.DELIVERED);
    });

    it('returns null for terminal states', () => {
      expect(getNextSimulationStatus(OrderStatus.DELIVERED)).toBeNull();
      expect(getNextSimulationStatus(OrderStatus.CANCELLED)).toBeNull();
    });
  });

  describe('getAllowedTransitions helper', () => {
    it('lists available next transitions', () => {
      expect(getAllowedTransitions(OrderStatus.RECEIVED)).toEqual([
        OrderStatus.ACCEPTED,
        OrderStatus.CANCELLED,
      ]);
      expect(getAllowedTransitions(OrderStatus.DELIVERED)).toEqual([]);
    });
  });
});
