import { Response } from 'express';

interface SSEClient {
  id: string;
  res: Response;
  keys: string[];
}

export class SSEService {
  private clients: Map<string, Set<SSEClient>> = new Map();
  private keepAliveInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.keepAliveInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 15000);
  }

  addClient(identifiers: string | string[], res: Response): string {
    const clientId = Math.random().toString(36).substring(2, 9);
    const keys = Array.isArray(identifiers) ? identifiers : [identifiers];
    const client: SSEClient = { id: clientId, res, keys };

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.flushHeaders?.();

    for (const key of keys) {
      if (!this.clients.has(key)) {
        this.clients.set(key, new Set());
      }
      this.clients.get(key)!.add(client);
    }

    res.write(
      `event: connected\ndata: ${JSON.stringify({ clientId, timestamp: new Date().toISOString() })}\n\n`
    );

    res.on('close', () => {
      this.removeClient(client);
    });

    return clientId;
  }

  removeClient(client: SSEClient) {
    for (const key of client.keys) {
      const set = this.clients.get(key);
      if (set) {
        set.delete(client);
        if (set.size === 0) {
          this.clients.delete(key);
        }
      }
    }
  }

  broadcastToOrder(orderIdOrRef: string, eventName: string, data: any) {
    const clients = this.clients.get(orderIdOrRef);
    if (!clients || clients.size === 0) return;

    const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of Array.from(clients)) {
      try {
        client.res.write(payload);
      } catch (err) {
        this.removeClient(client);
      }
    }
  }

  sendHeartbeat() {
    const visitedClients = new Set<SSEClient>();
    for (const [, clientSet] of this.clients.entries()) {
      for (const client of clientSet) {
        if (!visitedClients.has(client)) {
          visitedClients.add(client);
          try {
            client.res.write(': keepalive-ping\n\n');
          } catch (err) {
            // client disconnected
          }
        }
      }
    }
  }

  getClientCount(orderId: string): number {
    return this.clients.get(orderId)?.size || 0;
  }

  destroy() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
    this.clients.clear();
  }
}

export const sseService = new SSEService();
