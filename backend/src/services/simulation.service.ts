import { config } from '../config/env.js';
import { OrderStatus, getNextSimulationStatus } from './state-machine.service.js';

type TransitionHandler = (
  orderId: string,
  toStatus: OrderStatus,
  note: string,
  source: 'SIMULATION'
) => Promise<any>;

export class SimulationService {
  private activeSimulations: Map<string, NodeJS.Timeout> = new Map();
  private transitionHandler: TransitionHandler | null = null;

  setTransitionHandler(handler: TransitionHandler) {
    this.transitionHandler = handler;
  }

  startSimulation(orderId: string, currentStatus: OrderStatus, delayMs?: number) {
    this.stopSimulation(orderId);

    const stepDelay = delayMs || config.SIMULATION_STEP_DELAY_MS;
    const nextStatus = getNextSimulationStatus(currentStatus);

    if (!nextStatus) {
      return; // Already terminal
    }

    const timer = setTimeout(async () => {
      this.activeSimulations.delete(orderId);
      if (!this.transitionHandler) return;

      try {
        const updatedOrder = await this.transitionHandler(
          orderId,
          nextStatus,
          `[Simulated Kitchen Progress] Order progressed to ${nextStatus}`,
          'SIMULATION'
        );

        // Schedule subsequent step if more steps remain
        if (updatedOrder && updatedOrder.status) {
          const subsequent = getNextSimulationStatus(updatedOrder.status);
          if (subsequent) {
            this.startSimulation(orderId, updatedOrder.status, stepDelay);
          }
        }
      } catch (err: any) {
        console.warn(`Simulation step failed for order ${orderId}:`, err.message);
      }
    }, stepDelay);

    this.activeSimulations.set(orderId, timer);
  }

  stopSimulation(orderId: string) {
    const timer = this.activeSimulations.get(orderId);
    if (timer) {
      clearTimeout(timer);
      this.activeSimulations.delete(orderId);
    }
  }

  isSimulating(orderId: string): boolean {
    return this.activeSimulations.has(orderId);
  }

  clearAll() {
    for (const timer of this.activeSimulations.values()) {
      clearTimeout(timer);
    }
    this.activeSimulations.clear();
  }
}

export const simulationService = new SimulationService();
