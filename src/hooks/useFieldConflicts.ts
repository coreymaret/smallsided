// src/hooks/useFieldConflicts.ts
// Detects time overlaps between field rental bookings on the same field and date.
// Returns a Map of booking id → conflict info for any booking that has a conflict.

export interface ConflictInfo {
  conflictingBookingId: string;
  conflictingCustomerName: string;
  conflictingStartTime: string | null;
  conflictingEndTime: string | null;
}

interface BookingForConflict {
  id: string;
  booking_date: string;
  start_time: string | null;
  end_time: string | null;
  field_id: string | null;
  customer_name: string;
  booking_status: string;
}

// Normalize field_id so field_1, field-1, Field 1 all compare equal
const normalizeFieldId = (id: string | null): string => {
  if (!id) return 'unassigned';
  return id.toLowerCase().replace(/[\s_-]/g, '');
};

// Convert HH:MM time string to minutes since midnight for easy comparison
const toMinutes = (time: string | null): number | null => {
  if (!time) return null;
  const parts = time.split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
};

// Returns true if two time ranges overlap
// A booking with no end time is assumed to last 1 hour
const timesOverlap = (
  start1: string | null,
  end1: string | null,
  start2: string | null,
  end2: string | null,
): boolean => {
  const s1 = toMinutes(start1);
  const s2 = toMinutes(start2);

  // If either booking has no start time we can't determine overlap
  if (s1 === null || s2 === null) return false;

  const e1 = toMinutes(end1) ?? s1 + 60;
  const e2 = toMinutes(end2) ?? s2 + 60;

  // Overlap when one starts before the other ends (exclusive boundary)
  return s1 < e2 && s2 < e1;
};

export const useFieldConflicts = (
  bookings: BookingForConflict[]
): Map<string, ConflictInfo> => {
  // Only consider active bookings — cancelled bookings don't block the field
  const active = bookings.filter(
    b => b.booking_status !== 'cancelled' && b.booking_status !== 'completed'
  );

  const conflictMap = new Map<string, ConflictInfo>();

  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i];
      const b = active[j];

      // Must be same date
      if (a.booking_date !== b.booking_date) continue;

      // Must be same field (normalized)
      if (normalizeFieldId(a.field_id) !== normalizeFieldId(b.field_id)) continue;

      // Check time overlap
      if (!timesOverlap(a.start_time, a.end_time, b.start_time, b.end_time)) continue;

      // Both bookings are in conflict with each other
      if (!conflictMap.has(a.id)) {
        conflictMap.set(a.id, {
          conflictingBookingId: b.id,
          conflictingCustomerName: b.customer_name,
          conflictingStartTime: b.start_time,
          conflictingEndTime: b.end_time,
        });
      }
      if (!conflictMap.has(b.id)) {
        conflictMap.set(b.id, {
          conflictingBookingId: a.id,
          conflictingCustomerName: a.customer_name,
          conflictingStartTime: a.start_time,
          conflictingEndTime: a.end_time,
        });
      }
    }
  }

  return conflictMap;
};
