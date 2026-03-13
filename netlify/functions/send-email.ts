// netlify/functions/send-email.ts
// Unified email sending function — handles all 4 trigger types
// Called by: booking forms (confirmation), cron/webhook (reminder, follow-up), admin (status change)

import type { Handler, HandlerEvent } from '@netlify/functions';
import { Resend } from 'resend';
import {
  confirmationEmail,
  reminderEmail,
  statusChangeEmail,
  followUpEmail,
  type BookingData,
} from './email-templates';

type EmailType = 'confirmation' | 'reminder' | 'status_change' | 'follow_up';

interface SendEmailPayload {
  type:       EmailType;
  booking:    BookingData;
  newStatus?: string;   // for status_change
  note?:      string;   // for status_change
}

const handler: Handler = async (event: HandlerEvent) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin':  process.env.URL ?? '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Verify internal secret to prevent abuse
  const authHeader = event.headers['x-internal-secret'];
  const secret     = process.env.INTERNAL_SECRET;
  if (secret && authHeader !== secret) {
    return { statusCode: 401, headers: corsHeaders, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error('RESEND_API_KEY not set');
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Email service not configured' }) };
  }

  try {
    const payload: SendEmailPayload = JSON.parse(event.body ?? '{}');
    const { type, booking, newStatus, note } = payload;

    if (!type || !booking?.customerEmail) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'type and booking.customerEmail required' }) };
    }

    const resend = new Resend(resendKey);

    let template: { subject: string; html: string };
    switch (type) {
      case 'confirmation':  template = confirmationEmail(booking);                        break;
      case 'reminder':      template = reminderEmail(booking);                            break;
      case 'status_change': template = statusChangeEmail(booking, newStatus ?? '', note); break;
      case 'follow_up':     template = followUpEmail(booking);                            break;
      default:
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: `Unknown email type: ${type}` }) };
    }

    const { data, error } = await resend.emails.send({
      from:    'Small Sided <bookings@smallsided.com>',
      to:      [booking.customerEmail],
      subject: template.subject,
      html:    template.html,
    });

    if (error) {
      console.error('Resend error:', error);
      return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: error.message }) };
    }

    console.log(`Email sent: ${type} → ${booking.customerEmail} (${data?.id})`);
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ success: true, id: data?.id }) };

  } catch (err: any) {
    console.error('send-email error:', err);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) };
  }
};

export { handler };
