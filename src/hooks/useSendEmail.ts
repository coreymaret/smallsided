// src/hooks/useSendEmail.ts

export type EmailType = 'confirmation' | 'reminder' | 'status_change' | 'follow_up';

export interface BookingEmailData {
  id: string;
  customerName: string;
  customerEmail: string;
  service: string;
  bookingDate: string;
  startTime?: string | null;
  endTime?: string | null;
  fieldId?: string | null;
  participants?: number | null;
  totalAmount: number;
  bookingStatus?: string;
  specialRequests?: string | null;
  metadata?: Record<string, any> | null;
}

interface SendEmailOptions {
  type: EmailType;
  booking: BookingEmailData;
  newStatus?: string;
  note?: string;
}

export const useSendEmail = () => {
  const sendEmail = async (opts: SendEmailOptions): Promise<boolean> => {
    try {
      // Use (import.meta.env as any) to avoid TypeScript errors on custom env vars
      const secret = (import.meta.env as any).VITE_INTERNAL_SECRET ?? '';

      const response = await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': secret,
        },
        body: JSON.stringify({
          type:      opts.type,
          booking:   opts.booking,
          newStatus: opts.newStatus,
          note:      opts.note,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        console.error('Email send failed:', err);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Email send error:', err);
      return false;
    }
  };

  return { sendEmail };
};
