// netlify/functions/send-reminders.ts
// Scheduled function — runs daily to send day-before reminders and follow-ups
// Set up in netlify.toml as a scheduled function

import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { reminderEmail, followUpEmail, type BookingData } from './email-templates';

const handler: Handler = async () => {
  const supabaseUrl  = process.env.VITE_SUPABASE_URL  ?? process.env.SUPABASE_URL ?? '';
  const supabaseKey  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  const resendKey    = process.env.RESEND_API_KEY ?? '';

  if (!supabaseUrl || !supabaseKey || !resendKey) {
    console.error('Missing env vars');
    return { statusCode: 500, body: 'Missing configuration' };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const resend   = new Resend(resendKey);

  const today    = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

  const toISO = (d: Date) => {
    const y  = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dy = String(d.getDate()).padStart(2, '0');
    return `${y}-${mo}-${dy}`;
  };

  let sent = 0;
  let errors = 0;

  // ── Day-before reminders ──────────────────────────────────────────────────
  const { data: tomorrowBookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('booking_date', toISO(tomorrow))
    .eq('booking_status', 'confirmed')
    .eq('reminder_sent', false); // requires reminder_sent column (added below)

  for (const b of tomorrowBookings ?? []) {
    const booking: BookingData = {
      id:             b.id,
      customerName:   b.customer_name,
      customerEmail:  b.customer_email,
      service:        b.booking_type,
      bookingDate:    b.booking_date,
      startTime:      b.start_time,
      endTime:        b.end_time,
      fieldId:        b.field_id,
      participants:   b.participants,
      totalAmount:    Number(b.total_amount),
      specialRequests: b.special_requests,
      metadata:       b.metadata,
    };

    try {
      const template = reminderEmail(booking);
      await resend.emails.send({
        from:    'Small Sided <bookings@smallsided.com>',
        to:      [booking.customerEmail],
        subject: template.subject,
        html:    template.html,
      });

      // Mark reminder as sent
      await supabase.from('bookings')
        .update({ reminder_sent: true })
        .eq('id', b.id);

      console.log(`Reminder sent: ${booking.customerEmail}`);
      sent++;
    } catch (err) {
      console.error(`Failed reminder for ${booking.customerEmail}:`, err);
      errors++;
    }
  }

  // ── Follow-up emails (1 day after booking) ────────────────────────────────
  const { data: yesterdayBookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('booking_date', toISO(yesterday))
    .eq('booking_status', 'completed')
    .eq('followup_sent', false);

  for (const b of yesterdayBookings ?? []) {
    const booking: BookingData = {
      id:            b.id,
      customerName:  b.customer_name,
      customerEmail: b.customer_email,
      service:       b.booking_type,
      bookingDate:   b.booking_date,
      totalAmount:   Number(b.total_amount),
    };

    try {
      const template = followUpEmail(booking);
      await resend.emails.send({
        from:    'Small Sided <bookings@smallsided.com>',
        to:      [booking.customerEmail],
        subject: template.subject,
        html:    template.html,
      });

      await supabase.from('bookings')
        .update({ followup_sent: true })
        .eq('id', b.id);

      console.log(`Follow-up sent: ${booking.customerEmail}`);
      sent++;
    } catch (err) {
      console.error(`Failed follow-up for ${booking.customerEmail}:`, err);
      errors++;
    }
  }

  console.log(`Email job complete: ${sent} sent, ${errors} errors`);
  return {
    statusCode: 200,
    body: JSON.stringify({ sent, errors }),
  };
};

export { handler };
