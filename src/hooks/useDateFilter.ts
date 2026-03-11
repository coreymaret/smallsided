// src/hooks/useDateFilter.ts
// Manages date range filter state and computes Supabase .gte/.lte values.

import { useState, useCallback } from 'react';

export type DatePreset = 'upcoming' | 'today' | 'this_week' | 'this_month' | 'last_month' | 'all';

export interface DateRange {
  from: string | null; // ISO date string YYYY-MM-DD
  to: string | null;
}

const pad = (n: number) => String(n).padStart(2, '0');

const toISO = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const getDateRange = (preset: DatePreset): DateRange => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toISO(today);

  switch (preset) {
    case 'upcoming':
      return { from: todayStr, to: null };

    case 'today':
      return { from: todayStr, to: todayStr };

    case 'this_week': {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay()); // Sunday
      const end = new Date(start);
      end.setDate(start.getDate() + 6); // Saturday
      return { from: toISO(start), to: toISO(end) };
    }

    case 'this_month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { from: toISO(start), to: toISO(end) };
    }

    case 'last_month': {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: toISO(start), to: toISO(end) };
    }

    case 'all':
    default:
      return { from: null, to: null };
  }
};

export const PRESET_LABELS: Record<DatePreset, string> = {
  upcoming:   'Upcoming',
  today:      'Today',
  this_week:  'This Week',
  this_month: 'This Month',
  last_month: 'Last Month',
  all:        'All Time',
};

interface UseDateFilterReturn {
  preset: DatePreset;
  range: DateRange;
  setPreset: (preset: DatePreset) => void;
}

export const useDateFilter = (defaultPreset: DatePreset = 'upcoming'): UseDateFilterReturn => {
  const [preset, setPresetState] = useState<DatePreset>(defaultPreset);

  const setPreset = useCallback((newPreset: DatePreset) => {
    setPresetState(newPreset);
  }, []);

  return {
    preset,
    range: getDateRange(preset),
    setPreset,
  };
};
