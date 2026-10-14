'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Order } from '@/types';
import { fetchOrder, getOrderEventStreamUrl } from '@/services/api';

export type SSEConnectionStatus =
  | 'CONNECTING'
  | 'CONNECTED'
  | 'RECONNECTING'
  | 'ERROR';

export function useOrderEvents(initialOrderIdOrRef: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<SSEConnectionStatus>('CONNECTING');
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);

  // Manual or fallback fetch
  const refreshOrder = useCallback(async () => {
    try {
      const latest = await fetchOrder(initialOrderIdOrRef);
      setOrder(latest);
      setError(null);
      setLastUpdated(new Date());
      return latest;
    } catch (err: any) {
      setError(err.message || 'Failed to load order');
      throw err;
    }
  }, [initialOrderIdOrRef]);

  useEffect(() => {
    let isMounted = true;

    function connectSSE() {
      if (typeof window === 'undefined') return;

      // Clean up any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      setStatus(retryCountRef.current === 0 ? 'CONNECTING' : 'RECONNECTING');

      const sseUrl = getOrderEventStreamUrl(initialOrderIdOrRef);
      const es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      es.addEventListener('connected', () => {
        if (!isMounted) return;
        setStatus('CONNECTED');
        setError(null);
        retryCountRef.current = 0;
      });

      es.addEventListener('order_snapshot', (e: MessageEvent) => {
        if (!isMounted) return;
        try {
          const snapshot = JSON.parse(e.data);
          setOrder(snapshot);
          setStatus('CONNECTED');
          setLastUpdated(new Date());
        } catch (err) {
          console.warn('Failed parsing order snapshot:', err);
        }
      });

      es.addEventListener('order_updated', (e: MessageEvent) => {
        if (!isMounted) return;
        try {
          const updated = JSON.parse(e.data);
          setOrder(updated);
          setLastUpdated(new Date());
        } catch (err) {
          console.warn('Failed parsing order update:', err);
        }
      });

      es.addEventListener('order_deleted', () => {
        if (!isMounted) return;
        setError('This order was deleted.');
        setOrder(null);
      });

      es.onerror = () => {
        if (!isMounted) return;
        es.close();
        setStatus('RECONNECTING');

        // Fallback fetch to keep UI fresh while reconnecting
        refreshOrder().catch(() => {});

        // Exponential backoff reconnect
        const delay = Math.min(1000 * Math.pow(1.5, retryCountRef.current), 10000);
        retryCountRef.current += 1;

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectTimeoutRef.current = setTimeout(() => {
          if (isMounted) {
            connectSSE();
          }
        }, delay);
      };
    }

    // Initial load then start stream
    refreshOrder()
      .then(() => {
        if (isMounted) connectSSE();
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message);
          setStatus('ERROR');
        }
      });

    return () => {
      isMounted = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [initialOrderIdOrRef, refreshOrder]);

  return {
    order,
    status,
    error,
    lastUpdated,
    refreshOrder,
  };
}
