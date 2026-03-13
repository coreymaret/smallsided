// netlify/functions/email-templates.ts
// Shared HTML email templates for all Small Sided transactional emails

const BRAND = {
  dark:   '#15141a',
  green:  '#98ED66',
  light:  '#f8f9fa',
  text:   '#374151',
  muted:  '#6b7280',
  border: '#e5e7eb',
};

const FACILITY = {
  name:    'Small Sided',
  address: 'Tampa, Florida',
  hours:   '10:00 AM – 12:00 AM daily',
  phone:   '(813) 555-0100',
  email:   'bookings@smallsided.com',
  website: 'https://smallsided.com',
  contact: 'https://smallsided.com/contact',
};

const SERVICE_LABELS: Record<string, string> = {
  field_rental: 'Field Rental',
  training:     'Personal Training',
  camp:         'Soccer Camp',
  birthday:     'Birthday Party',
  league:       'League Registration',
  pickup:       'Pickup Game',
};

const FIELD_NAMES: Record<string, string> = {
  'field-1': 'Camp Nou',
  'field-2': 'Old Trafford',
  'field-3': 'San Siro',
  'field_1': 'Camp Nou',
  'field_2': 'Old Trafford',
  'field_3': 'San Siro',
};

export interface BookingData {
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

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmtDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

const fmtTime = (t: string | null | undefined): string => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
};

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

// ─── Base layout ──────────────────────────────────────────────────────────────

const baseLayout = (preheader: string, body: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${FACILITY.name}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <!-- Preheader -->
  <span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:${BRAND.dark};border-radius:12px 12px 0 0;padding:28px 40px;text-align:center;">
            <div style="font-size:28px;font-weight:900;color:${BRAND.green};letter-spacing:-0.5px;">
              ⚽ Small Sided
            </div>
            <div style="font-size:13px;color:rgba(255,255,255,0.5);margin-top:4px;">
              Indoor Soccer · Tampa, Florida
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:40px;">
            ${body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:${BRAND.light};border-radius:0 0 12px 12px;padding:24px 40px;border-top:1px solid ${BRAND.border};">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:13px;color:${BRAND.muted};line-height:1.6;">
                  <strong style="color:${BRAND.text};">${FACILITY.name}</strong><br/>
                  ${FACILITY.address}<br/>
                  Hours: ${FACILITY.hours}<br/>
                  <a href="tel:${FACILITY.phone}" style="color:${BRAND.muted};text-decoration:none;">${FACILITY.phone}</a> ·
                  <a href="mailto:${FACILITY.email}" style="color:${BRAND.muted};text-decoration:none;">${FACILITY.email}</a>
                </td>
                <td align="right" style="vertical-align:top;">
                  <a href="${FACILITY.website}" style="display:inline-block;background:${BRAND.dark};color:${BRAND.green};font-size:13px;font-weight:600;text-decoration:none;padding:8px 16px;border-radius:7px;">
                    Visit Website
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`.trim();

// ─── Booking detail block ─────────────────────────────────────────────────────

const bookingBlock = (b: BookingData): string => {
  const field = b.fieldId ? FIELD_NAMES[b.fieldId] ?? b.fieldId : null;
  const timeStr = b.startTime
    ? `${fmtTime(b.startTime)}${b.endTime ? ` – ${fmtTime(b.endTime)}` : ''}`
    : null;

  const rows: [string, string][] = [
    ['Service',  SERVICE_LABELS[b.service] ?? b.service],
    ['Date',     fmtDate(b.bookingDate)],
    ...(timeStr ? [['Time', timeStr] as [string, string]] : []),
    ...(field   ? [['Field', field]  as [string, string]] : []),
    ...(b.participants ? [['Players', String(b.participants)] as [string, string]] : []),
    ['Amount',   fmtCurrency(b.totalAmount)],
    ...(b.metadata?.child_name ? [['Child\'s Name', b.metadata.child_name] as [string, string]] : []),
    ...(b.metadata?.package    ? [['Package', b.metadata.package]          as [string, string]] : []),
    ...(b.metadata?.camp_type  ? [['Camp Type', b.metadata.camp_type]      as [string, string]] : []),
    ...(b.specialRequests      ? [['Special Requests', b.specialRequests]  as [string, string]] : []),
  ];

  return `
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#f8f9fa;border:1px solid ${BRAND.border};border-radius:10px;overflow:hidden;margin:24px 0;">
      <tr>
        <td style="background:${BRAND.dark};padding:12px 20px;">
          <span style="font-size:13px;font-weight:700;color:${BRAND.green};text-transform:uppercase;letter-spacing:0.06em;">
            Booking Details
          </span>
          <span style="float:right;font-size:11px;color:rgba(255,255,255,0.4);">
            #${b.id.slice(0, 8).toUpperCase()}
          </span>
        </td>
      </tr>
      ${rows.map(([label, value], i) => `
        <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
          <td style="padding:10px 20px;font-size:13px;color:${BRAND.muted};width:140px;font-weight:500;">${label}</td>
          <td style="padding:10px 20px;font-size:14px;color:${BRAND.text};font-weight:600;">${value}</td>
        </tr>
      `).join('')}
    </table>
  `;
};

// ─── CTA button ───────────────────────────────────────────────────────────────

const ctaButton = (label: string, url: string, secondary = false): string => `
  <a href="${url}" style="
    display:inline-block;
    background:${secondary ? 'white' : BRAND.dark};
    color:${secondary ? BRAND.text : BRAND.green};
    border:${secondary ? `1px solid ${BRAND.border}` : 'none'};
    font-size:15px;font-weight:700;text-decoration:none;
    padding:12px 28px;border-radius:8px;
  ">${label}</a>
`;

// ─── Cancellation notice ──────────────────────────────────────────────────────

const cancellationNotice = (): string => `
  <table width="100%" cellpadding="0" cellspacing="0"
    style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;margin:20px 0;">
    <tr>
      <td style="padding:14px 18px;font-size:13px;color:#92400e;line-height:1.6;">
        <strong>Need to reschedule or cancel?</strong><br/>
        Please contact us at least 24 hours in advance at
        <a href="mailto:${FACILITY.email}" style="color:#92400e;">${FACILITY.email}</a>
        or <a href="tel:${FACILITY.phone}" style="color:#92400e;">${FACILITY.phone}</a>.
        Late cancellations may be subject to a fee.
      </td>
    </tr>
  </table>
`;

// ─── Template: Booking Confirmation ──────────────────────────────────────────

export const confirmationEmail = (b: BookingData) => ({
  subject: `Booking Confirmed — ${SERVICE_LABELS[b.service] ?? b.service} on ${fmtDate(b.bookingDate)}`,
  html: baseLayout(
    `Your ${SERVICE_LABELS[b.service] ?? b.service} at Small Sided is confirmed!`,
    `
      <h1 style="font-size:24px;font-weight:800;color:${BRAND.dark};margin:0 0 8px;">
        You're all set! ✅
      </h1>
      <p style="font-size:16px;color:${BRAND.muted};margin:0 0 4px;">
        Hi ${b.customerName},
      </p>
      <p style="font-size:15px;color:${BRAND.text};line-height:1.6;margin:12px 0 0;">
        Your booking has been confirmed. We look forward to seeing you at Small Sided!
      </p>

      ${bookingBlock(b)}
      ${cancellationNotice()}

      <div style="text-align:center;margin:28px 0 8px;">
        ${ctaButton('View Our Website', FACILITY.website)}
        &nbsp;&nbsp;
        ${ctaButton('Contact Us', FACILITY.contact, true)}
      </div>
    `
  ),
});

// ─── Template: Day-Before Reminder ───────────────────────────────────────────

export const reminderEmail = (b: BookingData) => ({
  subject: `Reminder: Your ${SERVICE_LABELS[b.service] ?? b.service} is Tomorrow`,
  html: baseLayout(
    `Don't forget — your ${SERVICE_LABELS[b.service] ?? b.service} is tomorrow at Small Sided.`,
    `
      <h1 style="font-size:24px;font-weight:800;color:${BRAND.dark};margin:0 0 8px;">
        See you tomorrow! ⚽
      </h1>
      <p style="font-size:15px;color:${BRAND.text};line-height:1.6;margin:12px 0 0;">
        Hi ${b.customerName}, just a friendly reminder about your upcoming booking at Small Sided.
      </p>

      ${bookingBlock(b)}

      <table width="100%" cellpadding="0" cellspacing="0"
        style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;margin:20px 0;">
        <tr>
          <td style="padding:14px 18px;font-size:13px;color:#166534;line-height:1.6;">
            <strong>📍 Getting here:</strong> ${FACILITY.address}<br/>
            <strong>🕙 Hours:</strong> ${FACILITY.hours}<br/>
            <strong>📞 Questions?</strong>
            <a href="tel:${FACILITY.phone}" style="color:#166534;">${FACILITY.phone}</a>
          </td>
        </tr>
      </table>

      ${cancellationNotice()}

      <div style="text-align:center;margin:28px 0 8px;">
        ${ctaButton('Get Directions', `https://maps.google.com/?q=Small+Sided+Tampa+FL`)}
        &nbsp;&nbsp;
        ${ctaButton('Contact Us', FACILITY.contact, true)}
      </div>
    `
  ),
});

// ─── Template: Status Change ──────────────────────────────────────────────────

export const statusChangeEmail = (b: BookingData, newStatus: string, note?: string) => {
  const statusConfig: Record<string, { emoji: string; headline: string; color: string; bg: string }> = {
    confirmed: { emoji: '✅', headline: 'Your booking has been confirmed',  color: '#166534', bg: '#f0fdf4' },
    cancelled: { emoji: '❌', headline: 'Your booking has been cancelled',  color: '#991b1b', bg: '#fee2e2' },
    completed: { emoji: '🎉', headline: 'Thanks for visiting Small Sided!', color: '#1d4ed8', bg: '#eff6ff' },
    no_show:   { emoji: '⚠️', headline: 'We missed you today',             color: '#92400e', bg: '#fef3c7' },
  };
  const cfg = statusConfig[newStatus] ?? statusConfig.confirmed;

  return {
    subject: `Booking Update — ${SERVICE_LABELS[b.service] ?? b.service} ${cfg.emoji}`,
    html: baseLayout(
      `${cfg.headline} — ${SERVICE_LABELS[b.service] ?? b.service}`,
      `
        <h1 style="font-size:24px;font-weight:800;color:${BRAND.dark};margin:0 0 8px;">
          ${cfg.emoji} ${cfg.headline}
        </h1>
        <p style="font-size:15px;color:${BRAND.text};line-height:1.6;margin:12px 0 0;">
          Hi ${b.customerName}, your booking status has been updated.
        </p>

        ${bookingBlock(b)}

        ${note ? `
          <table width="100%" cellpadding="0" cellspacing="0"
            style="background:${cfg.bg};border-radius:8px;margin:16px 0;">
            <tr>
              <td style="padding:14px 18px;font-size:14px;color:${cfg.color};line-height:1.6;">
                <strong>Note from our team:</strong><br/>${note}
              </td>
            </tr>
          </table>
        ` : ''}

        <div style="text-align:center;margin:28px 0 8px;">
          ${ctaButton('Contact Us', FACILITY.contact)}
        </div>
      `
    ),
  };
};

// ─── Template: Follow-Up ─────────────────────────────────────────────────────

export const followUpEmail = (b: BookingData) => ({
  subject: `How was your ${SERVICE_LABELS[b.service] ?? b.service} at Small Sided?`,
  html: baseLayout(
    `We hope you had a great time at Small Sided!`,
    `
      <h1 style="font-size:24px;font-weight:800;color:${BRAND.dark};margin:0 0 8px;">
        How was it? 🌟
      </h1>
      <p style="font-size:15px;color:${BRAND.text};line-height:1.6;margin:12px 0 4px;">
        Hi ${b.customerName},
      </p>
      <p style="font-size:15px;color:${BRAND.text};line-height:1.6;margin:0 0 0;">
        We hope you enjoyed your ${SERVICE_LABELS[b.service] ?? b.service} at Small Sided.
        We'd love to hear about your experience!
      </p>

      ${bookingBlock(b)}

      <table width="100%" cellpadding="0" cellspacing="0"
        style="background:${BRAND.light};border:1px solid ${BRAND.border};border-radius:10px;margin:24px 0;padding:24px;">
        <tr>
          <td style="text-align:center;">
            <p style="font-size:15px;color:${BRAND.text};font-weight:600;margin:0 0 16px;">
              Ready to book again?
            </p>
            <div>
              ${ctaButton('Book a Field', `${FACILITY.website}/services/field-rental/book`)}
              &nbsp;&nbsp;
              ${ctaButton('View All Services', `${FACILITY.website}/services`, true)}
            </div>
          </td>
        </tr>
      </table>

      <p style="font-size:14px;color:${BRAND.muted};text-align:center;margin:0;">
        Questions or feedback? Reply to this email or
        <a href="${FACILITY.contact}" style="color:${BRAND.dark};">contact us here</a>.
      </p>
    `
  ),
});
