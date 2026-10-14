'use client';

import React from 'react';
import { CheckCircle2, Clock, Bot, User, Utensils } from 'lucide-react';
import { OrderStatusEvent, OrderStatus } from '@/types';

export function EventTimeline({
  events = [],
  currentStatus,
}: {
  events: OrderStatusEvent[];
  currentStatus: OrderStatus;
}) {
  if (!events || events.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-stone-400">
        No event history recorded yet.
      </div>
    );
  }

  // Reverse order or chronological? Image 1 shows latest on top (02/20/24 on top of 02/16/24 and 02/12/24)
  // Let's sort with latest first so the newest status is immediately visible at the top!
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const formatEventTime = (timestampStr: string) => {
    try {
      const date = new Date(timestampStr);
      return {
        date: date.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: '2-digit',
        }),
        time: date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      };
    } catch {
      return { date: '', time: '' };
    }
  };

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'SIMULATION':
        return (
          <span title="Simulated Progress">
            <Bot className="w-3 h-3 text-amber-600" />
          </span>
        );
      case 'KITCHEN':
        return (
          <span title="Kitchen Team">
            <Utensils className="w-3 h-3 text-[#C2410C]" />
          </span>
        );
      case 'CUSTOMER':
        return (
          <span title="Customer Action">
            <User className="w-3 h-3 text-[#4D7C0F]" />
          </span>
        );
      default:
        return (
          <span title="System Event">
            <Clock className="w-3 h-3 text-stone-400" />
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#E7E2D7]">
        <h4 className="text-sm font-bold text-[#1C1917] font-editorial">
          Order history
        </h4>
        <span className="text-[11px] text-[#78716C]">
          {sortedEvents.length} immutable events
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E7E2D7]">
        {sortedEvents.map((evt, idx) => {
          const isLatest = idx === 0;
          const { date, time } = formatEventTime(evt.timestamp);

          return (
            <div key={evt._id || idx} className="relative group">
              {/* Stepper node circle */}
              <div
                className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                  isLatest
                    ? 'bg-[#C2410C] text-white ring-[#FFEDD5]'
                    : 'bg-stone-200 text-stone-500'
                }`}
              >
                {isLatest ? (
                  <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-500" />
                )}
              </div>

              {/* Event Content */}
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                <div className="text-[12px] font-mono text-[#78716C] shrink-0 min-w-[70px]">
                  <span>{date}</span>
                  <span className="text-[10px] block text-stone-400">{time}</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${
                        isLatest ? 'text-[#1C1917]' : 'text-stone-600'
                      }`}
                    >
                      {evt.note}
                    </span>
                    {getSourceIcon(evt.source)}
                  </div>

                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-stone-400">
                    <span className="font-mono uppercase font-semibold text-stone-500">
                      {evt.toStatus}
                    </span>
                    {evt.source && (
                      <span className="px-1.5 py-0.2 rounded bg-stone-100 text-stone-500">
                        {evt.source}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
