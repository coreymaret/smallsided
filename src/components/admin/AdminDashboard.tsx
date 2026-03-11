import { useEffect, useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isAfter, addHours, isSameDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { supabase } from '../../lib/supabase';
import { Calendar, Trophy, DollarSign, TrendingUp } from '../../components/Icons/Icons';
import styles from './AdminDashboard.module.scss';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS },
});

interface Booking {
  id: string;
  booking_date: string;
  start_time: string | null;
  end_time: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  status: string;
  booking_type: 'field_rental' | 'training' | 'camp' | 'birthday' | 'league' | 'pickup';
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource: {
    type: 'field_rental' | 'training' | 'camp' | 'birthday' | 'league' | 'pickup';
    data: Booking;
  };
}

interface FetchError {
  source: string;
  message: string;
}

const AdminDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeLeagues: 0,
    upcomingEvents: 0,
  });
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchErrors, setFetchErrors] = useState<FetchError[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const errors: FetchError[] = [];

    const [fieldRentals, training, leagues, pickupGames] = await Promise.all([
      supabase.from('bookings').select('*'),
      supabase.from('training_registrations').select('*'),
      supabase.from('league_registrations').select('*'),
      supabase.from('bookings').select('*').eq('booking_type', 'pickup'),
    ]);

    // Check each result individually
    if (fieldRentals.error) {
      errors.push({ source: 'Field Rentals', message: fieldRentals.error.message });
    }
    if (training.error) {
      errors.push({ source: 'Training', message: training.error.message });
    }
    if (leagues.error) {
      errors.push({ source: 'Leagues', message: leagues.error.message });
    }
    if (pickupGames.error) {
      errors.push({ source: 'Pickup Games', message: pickupGames.error.message });
    }

    if (errors.length > 0) {
      setFetchErrors(errors);
    }

    const allBookings: Booking[] = [];

    if (fieldRentals.data) {
      fieldRentals.data.forEach((b: any) => {
        allBookings.push({
          id: b.id,
          booking_date: b.booking_date,
          start_time: b.start_time ?? null,
          end_time: b.end_time ?? null,
          customer_name: b.customer_name ?? b.name,
          customer_email: b.customer_email ?? b.email,
          customer_phone: b.customer_phone ?? b.phone,
          total_amount: b.total_amount,
          status: b.payment_status ?? b.status,
          booking_type: 'field_rental',
        });
      });
    }

    if (training.data) {
      training.data.forEach((b: any) => {
        allBookings.push({
          id: b.id,
          // Use actual session date if available, otherwise created_at
          booking_date: b.session_date ?? b.created_at?.split('T')[0] ?? '',
          start_time: b.preferred_time ?? null, // null = no confirmed time yet
          end_time: null,
          customer_name: b.parent_name,
          customer_email: b.parent_email,
          customer_phone: b.parent_phone,
          total_amount: b.total_amount,
          status: b.status,
          booking_type: 'training',
        });
      });
    }

    if (leagues.data) {
      leagues.data.forEach((b: any) => {
        allBookings.push({
          id: b.id,
          booking_date: b.registration_date ?? b.created_at?.split('T')[0] ?? '',
          start_time: null, // League registrations have no single event time
          end_time: null,
          customer_name: b.team_name,
          customer_email: b.contact_email ?? b.captain_email,
          customer_phone: b.contact_phone ?? b.captain_phone,
          total_amount: b.total_amount,
          status: b.payment_status ?? b.status,
          booking_type: 'league',
        });
      });
    }

    if (pickupGames.data) {
      pickupGames.data.forEach((b: any) => {
        allBookings.push({
          id: b.id,
          booking_date: b.booking_date,
          start_time: b.start_time ?? null,
          end_time: b.end_time ?? null,
          customer_name: b.customer_name,
          customer_email: b.customer_email,
          customer_phone: b.customer_phone,
          total_amount: b.total_amount ?? 0,
          status: b.payment_status ?? b.status,
          booking_type: 'pickup',
        });
      });
    }

    setBookings(allBookings);

    // Convert to calendar events — only create timed events when we have real times
    const calendarEvents: CalendarEvent[] = allBookings
      .filter(booking => booking.booking_date) // skip bookings with no date
      .map(booking => {
        const hasTime = booking.start_time && booking.start_time.match(/^\d{2}:\d{2}/);

        if (hasTime) {
          const startDateTime = parse(
            `${booking.booking_date} ${booking.start_time}`,
            'yyyy-MM-dd HH:mm',
            new Date()
          );
          const endDateTime = booking.end_time
            ? parse(`${booking.booking_date} ${booking.end_time}`, 'yyyy-MM-dd HH:mm', new Date())
            : addHours(startDateTime, 1);

          return {
            id: booking.id,
            title: `${booking.customer_name} — ${booking.booking_type.replace('_', ' ')}`,
            start: startDateTime,
            end: endDateTime,
            allDay: false,
            resource: { type: booking.booking_type, data: booking },
          };
        }

        // No confirmed time — show as all-day event so it doesn't appear at a fake time
        const eventDate = parse(booking.booking_date, 'yyyy-MM-dd', new Date());
        return {
          id: booking.id,
          title: `${booking.customer_name} — ${booking.booking_type.replace('_', ' ')}`,
          start: eventDate,
          end: eventDate,
          allDay: true,
          resource: { type: booking.booking_type, data: booking },
        };
      });

    setEvents(calendarEvents);

    setStats({
      totalBookings: allBookings.length,
      totalRevenue: allBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0),
      activeLeagues: (leagues.data || []).filter((l: any) => l.status === 'active').length,
      upcomingEvents: allBookings.filter(b =>
        b.booking_date && isAfter(parse(b.booking_date, 'yyyy-MM-dd', new Date()), new Date())
      ).length,
    });

    setIsLoading(false);
  };

  const handleViewChange = (view: string) => {
    setCalendarView(view as 'month' | 'week' | 'day');
  };

  const handleNavigate = (date: Date) => {
    setCalendarDate(date);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const colors: Record<string, string> = {
      field_rental: '#3b82f6',
      training: '#8b5cf6',
      camp: '#f59e0b',
      birthday: '#ec4899',
      league: '#10b981',
      pickup: '#ef4444',
    };

    return {
      style: {
        backgroundColor: colors[event.resource.type] || '#667eea',
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
      },
    };
  };

  const customDayPropGetter = (date: Date) => {
    const isToday = isSameDay(date, new Date());
    return { className: isToday ? 'rbc-today' : '' };
  };

  const CustomHeader = ({ date }: { date: Date }) => {
    const isToday = isSameDay(date, new Date());
    const dayNumber = format(date, 'd');
    const dayName = format(date, 'EEE');

    if (isToday) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#666', fontWeight: 500 }}>{dayName}</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '32px', height: '32px', borderRadius: '50%',
            background: '#15141a', color: '#98ED66', fontWeight: 600,
          }}>{dayNumber}</span>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
        <span style={{ fontSize: '0.75rem', color: '#666', fontWeight: 500 }}>{dayName}</span>
        <span style={{ fontWeight: 600 }}>{dayNumber}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loading}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Dashboard</h1>
        <p>Overview of all bookings and registrations</p>
      </header>

      {/* Fetch error banner — shown when one or more sources fail but others succeed */}
      {fetchErrors.length > 0 && (
        <div className={styles.errorBanner}>
          <strong>Some data could not be loaded:</strong>{' '}
          {fetchErrors.map(e => e.source).join(', ')}. The rest of the dashboard is still accurate.
        </div>
      )}

      {/* Calendar Section */}
      <div className={styles.calendarSection}>
        <div className={styles.calendarHeader}>
          <h2>Booking Calendar</h2>
          <div className={styles.calendarLegend}>
            {[
              { label: 'Field Rentals', color: '#3b82f6' },
              { label: 'Training', color: '#8b5cf6' },
              { label: 'Camps', color: '#f59e0b' },
              { label: 'Birthday Parties', color: '#ec4899' },
              { label: 'Leagues', color: '#10b981' },
              { label: 'Pickup Games', color: '#ef4444' },
            ].map(({ label, color }) => (
              <div key={label} className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.calendarWrapper}>
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            view={calendarView}
            onView={handleViewChange}
            date={calendarDate}
            onNavigate={handleNavigate}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={setSelectedBooking}
            views={['month', 'week', 'day']}
            dayPropGetter={customDayPropGetter}
            step={30}
            timeslots={2}
            formats={{ timeGutterFormat: (date: Date) => format(date, 'h a') }}
            components={{
              week: { header: CustomHeader },
              day: { header: CustomHeader },
            }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Calendar size={24} color="#98ED66" /></div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Bookings</p>
            <p className={styles.statValue}>{stats.totalBookings}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><DollarSign size={24} color="#98ED66" /></div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Revenue</p>
            <p className={styles.statValue}>${stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Trophy size={24} color="#98ED66" /></div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Active Leagues</p>
            <p className={styles.statValue}>{stats.activeLeagues}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><TrendingUp size={24} color="#98ED66" /></div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Upcoming Events</p>
            <p className={styles.statValue}>{stats.upcomingEvents}</p>
          </div>
        </div>
      </div>

      {/* Booking Breakdown */}
      <div className={styles.bookingBreakdown}>
        <h2>Booking Breakdown by Service</h2>
        <div className={styles.breakdownGrid}>
          {Object.entries(
            bookings.reduce((acc, booking) => {
              acc[booking.booking_type] = (acc[booking.booking_type] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([type, count]) => (
            <div key={type} className={styles.breakdownItem}>
              <span className={styles.breakdownLabel}>
                {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              <span className={styles.breakdownValue}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className={styles.modalOverlay} onClick={() => setSelectedBooking(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Booking Details</h2>
              <button className={styles.closeButton} onClick={() => setSelectedBooking(null)}>×</button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.detailGrid}>
                {[
                  ['Customer', selectedBooking.resource.data.customer_name],
                  ['Email', selectedBooking.resource.data.customer_email],
                  ['Phone', selectedBooking.resource.data.customer_phone],
                  ['Date', format(selectedBooking.start, 'MMMM d, yyyy')],
                  ['Time', selectedBooking.allDay
                    ? 'Time not yet assigned'
                    : `${format(selectedBooking.start, 'h:mm a')} – ${format(selectedBooking.end, 'h:mm a')}`
                  ],
                  ['Amount', `$${selectedBooking.resource.data.total_amount?.toFixed(2) ?? '0.00'}`],
                ].map(([label, value]) => (
                  <div key={label} className={styles.detailItem}>
                    <span className={styles.detailLabel}>{label}:</span>
                    <span className={styles.detailValue}>{value}</span>
                  </div>
                ))}
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Status:</span>
                  <span className={`${styles.statusBadge} ${styles[selectedBooking.resource.data.status]}`}>
                    {selectedBooking.resource.data.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
