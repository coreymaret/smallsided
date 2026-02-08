import { useEffect, useState } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { supabase } from '../../lib/supabase';
import { Calendar, Trophy, DollarSign, TrendingUp } from 'lucide-react';
import styles from './AdminDashboard.module.scss';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
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
  resource: {
    type: 'field_rental' | 'training' | 'camp' | 'birthday' | 'league' | 'pickup';
    data: Booking;
  };
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all bookings from different tables
      const [fieldRentals, training, leagues, pickupGames] = await Promise.all([
        supabase.from('bookings').select('*'),
        supabase.from('training_registrations').select('*'),
        supabase.from('league_registrations').select('*'),
        supabase.from('pickup_game_registrations').select('*'),
      ]);

      // Transform to unified booking format
      const allBookings: Booking[] = [];
      
      if (fieldRentals.data) {
        fieldRentals.data.forEach((b: any) => {
          allBookings.push({
            id: b.id,
            booking_date: b.booking_date,
            start_time: b.start_time,
            end_time: b.end_time,
            customer_name: b.name,
            customer_email: b.email,
            customer_phone: b.phone,
            total_amount: b.total_amount,
            status: b.status,
            booking_type: 'field_rental',
          });
        });
      }
      
      if (training.data) {
        training.data.forEach((b: any) => {
          allBookings.push({
            id: b.id,
            booking_date: b.created_at,
            start_time: b.preferred_time || '09:00',
            end_time: '',
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
            booking_date: b.created_at,
            start_time: '18:00',
            end_time: '19:00',
            customer_name: b.team_name,
            customer_email: b.contact_email,
            customer_phone: b.contact_phone,
            total_amount: b.total_amount,
            status: b.status,
            booking_type: 'league',
          });
        });
      }
      
      if (pickupGames.data) {
        pickupGames.data.forEach((b: any) => {
          allBookings.push({
            id: b.id,
            booking_date: b.game_date,
            start_time: b.game_time,
            end_time: '',
            customer_name: b.player_name,
            customer_email: b.player_email,
            customer_phone: b.player_phone,
            total_amount: b.total_amount || 0,
            status: b.status,
            booking_type: 'pickup',
          });
        });
      }

      setBookings(allBookings);

      // Convert to calendar events
      const calendarEvents: CalendarEvent[] = allBookings.map(booking => {
        const startDateTime = moment(`${booking.booking_date} ${booking.start_time}`).toDate();
        const endDateTime = booking.end_time 
          ? moment(`${booking.booking_date} ${booking.end_time}`).toDate()
          : moment(startDateTime).add(1, 'hour').toDate();

        return {
          id: booking.id,
          title: `${booking.customer_name} - ${booking.booking_type.replace('_', ' ')}`,
          start: startDateTime,
          end: endDateTime,
          resource: {
            type: booking.booking_type,
            data: booking,
          },
        };
      });

      setEvents(calendarEvents);

      // Calculate stats
      setStats({
        totalBookings: allBookings.length,
        totalRevenue: allBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0),
        activeLeagues: (leagues.data || []).filter((l: any) => l.status === 'active').length,
        upcomingEvents: allBookings.filter(b => moment(b.booking_date).isAfter(moment())).length,
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setIsLoading(false);
    }
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
    const today = new Date();
    const isToday = moment(date).isSame(today, 'day');
    
    return {
      className: isToday ? 'rbc-today' : '',
    };
  };

  const CustomHeader = ({ date }: { date: Date }) => {
    const today = new Date();
    const isToday = moment(date).isSame(today, 'day');
    const dayNumber = moment(date).format('D');
    const dayName = moment(date).format('ddd');
    
    if (isToday) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#666', fontWeight: 500 }}>{dayName}</span>
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#15141a',
            color: '#98ED66',
            fontWeight: 600,
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

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedBooking(event);
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

      {/* Calendar Section */}
      <div className={styles.calendarSection}>
        <div className={styles.calendarHeader}>
          <h2>Booking Calendar</h2>
          <div className={styles.calendarLegend}>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{ backgroundColor: '#3b82f6' }}></span>
              Field Rentals
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{ backgroundColor: '#8b5cf6' }}></span>
              Training
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{ backgroundColor: '#f59e0b' }}></span>
              Camps
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{ backgroundColor: '#ec4899' }}></span>
              Birthday Parties
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{ backgroundColor: '#10b981' }}></span>
              Leagues
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{ backgroundColor: '#ef4444' }}></span>
              Pickup Games
            </div>
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
            onSelectEvent={handleSelectEvent}
            views={['month', 'week', 'day']}
            dayPropGetter={customDayPropGetter}
            step={30}
            timeslots={2}
            formats={{
              timeGutterFormat: (date: Date) => moment(date).format('h A'),
            }}
            components={{
              week: {
                header: CustomHeader,
              },
              day: {
                header: CustomHeader,
              },
            }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Calendar size={24} color="#98ED66" />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Bookings</p>
            <p className={styles.statValue}>{stats.totalBookings}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <DollarSign size={24} color="#98ED66" />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Revenue</p>
            <p className={styles.statValue}>${stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Trophy size={24} color="#98ED66" />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Active Leagues</p>
            <p className={styles.statValue}>{stats.activeLeagues}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp size={24} color="#98ED66" />
          </div>
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
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Booking Details</h2>
              <button className={styles.closeButton} onClick={() => setSelectedBooking(null)}>×</button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Customer:</span>
                  <span className={styles.detailValue}>{selectedBooking.resource.data.customer_name}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Email:</span>
                  <span className={styles.detailValue}>{selectedBooking.resource.data.customer_email}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Phone:</span>
                  <span className={styles.detailValue}>{selectedBooking.resource.data.customer_phone}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Date:</span>
                  <span className={styles.detailValue}>
                    {moment(selectedBooking.start).format('MMMM D, YYYY')}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Time:</span>
                  <span className={styles.detailValue}>
                    {moment(selectedBooking.start).format('h:mm A')} - {moment(selectedBooking.end).format('h:mm A')}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Amount:</span>
                  <span className={styles.detailValue}>
                    ${selectedBooking.resource.data.total_amount?.toFixed(2) || '0.00'}
                  </span>
                </div>
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