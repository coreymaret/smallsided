import { useEffect, useState } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { supabase } from '../../lib/supabase';
import { Calendar, Trophy, DollarSign, TrendingUp } from 'lucide-react';
import styles from './AdminDashboard.module.scss';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface Stats {
  totalBookings: number;
  totalRevenue: number;
  activeLeagues: number;
  upcomingEvents: number;
  fieldRentals: number;
  leagueRegistrations: number;
  pickupGames: number;
  birthdayParties: number;
  trainingSessions: number;
  campRegistrations: number;
}

interface BookingData {
  booking_type: string;
  total_amount: number;
  booking_date?: string;
  start_time?: string;
  end_time?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  field?: string;
  party_size?: number;
  status?: string;
  id: string;
}

interface TrainingData {
  total_amount: number;
  player_name: string;
  parent_email: string;
  parent_phone: string;
  training_type: string;
  preferred_days?: string[];
  created_at: string;
  id: string;
}

interface LeagueData {
  team_name: string;
  division: string;
  start_date?: string;
  contact_email: string;
  contact_phone: string;
  created_at: string;
  id: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    type: 'field_rental' | 'training' | 'camp' | 'birthday' | 'league' | 'pickup';
    data: BookingData | TrainingData | LeagueData;
  };
}

interface SelectedEvent {
  event: CalendarEvent;
  type: 'field_rental' | 'training' | 'camp' | 'birthday' | 'league' | 'pickup';
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    totalRevenue: 0,
    activeLeagues: 0,
    upcomingEvents: 0,
    fieldRentals: 0,
    leagueRegistrations: 0,
    pickupGames: 0,
    birthdayParties: 0,
    trainingSessions: 0,
    campRegistrations: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null);

  useEffect(() => {
    fetchStats();
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    try {
      // Fetch all bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .order('booking_date', { ascending: true });

      // Fetch training registrations
      const { data: training } = await supabase
        .from('training_registrations')
        .select('*')
        .order('created_at', { ascending: true });

      // Fetch league registrations
      const { data: leagues } = await supabase
        .from('league_registrations')
        .select('*')
        .order('created_at', { ascending: true });

      const calendarEvents: CalendarEvent[] = [];

      // Process bookings
      if (bookings) {
        bookings.forEach((booking: BookingData) => {
          if (booking.booking_date) {
            const startDate = new Date(`${booking.booking_date}T${booking.start_time || '09:00'}`);
            const endDate = new Date(`${booking.booking_date}T${booking.end_time || '10:00'}`);
            
            let title = '';
            switch (booking.booking_type) {
              case 'field_rental':
                title = `Field Rental - ${booking.customer_name}`;
                break;
              case 'birthday':
                title = `Birthday Party - ${booking.customer_name}`;
                break;
              case 'camp':
                title = `Camp - ${booking.customer_name}`;
                break;
              case 'pickup':
                title = `Pickup Game - ${booking.party_size || 0} players`;
                break;
              default:
                title = `${booking.booking_type} - ${booking.customer_name}`;
            }

            calendarEvents.push({
              id: booking.id,
              title,
              start: startDate,
              end: endDate,
              resource: {
                type: booking.booking_type as any,
                data: booking,
              },
            });
          }
        });
      }

      // Process training registrations
      if (training) {
        training.forEach((session: TrainingData) => {
          // Use created date for training since they don't have scheduled dates
          const startDate = new Date(session.created_at);
          const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

          calendarEvents.push({
            id: session.id,
            title: `Training - ${session.player_name}`,
            start: startDate,
            end: endDate,
            resource: {
              type: 'training',
              data: session,
            },
          });
        });
      }

      // Process league registrations
      if (leagues) {
        leagues.forEach((league: LeagueData) => {
          const startDate = league.start_date ? new Date(league.start_date) : new Date(league.created_at);
          const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hour duration

          calendarEvents.push({
            id: league.id,
            title: `League - ${league.team_name}`,
            start: startDate,
            end: endDate,
            resource: {
              type: 'league',
              data: league,
            },
          });
        });
      }

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { count: bookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

      const { data: bookings } = await supabase
        .from('bookings')
        .select('booking_type, total_amount');

      const { count: leaguesCount } = await supabase
        .from('league_registrations')
        .select('*', { count: 'exact', head: true });

      const { count: activeLeaguesCount } = await supabase
        .from('leagues')
        .select('*', { count: 'exact', head: true });

      const { data: trainingData, count: trainingCount } = await supabase
        .from('training_registrations')
        .select('total_amount', { count: 'exact' });

      const typedBookings = (bookings || []) as BookingData[];
      
      const bookingsByType = typedBookings.reduce((acc, booking) => {
        acc[booking.booking_type] = (acc[booking.booking_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const bookingsRevenue = typedBookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0);
      const typedTrainingData = (trainingData || []) as TrainingData[];
      const trainingRevenue = typedTrainingData.reduce((sum, training) => sum + (training.total_amount || 0), 0);
      const totalRevenue = bookingsRevenue + trainingRevenue;

      const statsData = {
        totalBookings: (bookingsCount || 0) + (trainingCount || 0),
        totalRevenue,
        activeLeagues: activeLeaguesCount || 0,
        upcomingEvents: bookingsCount || 0,
        fieldRentals: bookingsByType['field_rental'] || 0,
        leagueRegistrations: leaguesCount || 0,
        pickupGames: bookingsByType['pickup'] || 0,
        birthdayParties: bookingsByType['birthday'] || 0,
        trainingSessions: trainingCount || 0,
        campRegistrations: bookingsByType['camp'] || 0,
      };

      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
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

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent({
      event,
      type: event.resource.type,
    });
  };

  const handleNavigate = (date: Date) => {
    setCalendarDate(date);
  };

  const handleViewChange = (view: string) => {
    setCalendarView(view as 'month' | 'week' | 'day');
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
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Calendar size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>Total Bookings</h3>
            <p className={styles.statValue}>{stats.totalBookings}</p>
            <span className={styles.statLabel}>All time</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <DollarSign size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>Total Revenue</h3>
            <p className={styles.statValue}>${stats.totalRevenue.toLocaleString()}</p>
            <span className={styles.statLabel}>All time</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Trophy size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>Active Leagues</h3>
            <p className={styles.statValue}>{stats.activeLeagues}</p>
            <span className={styles.statLabel}>Currently running</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>Upcoming Events</h3>
            <p className={styles.statValue}>{stats.upcomingEvents}</p>
            <span className={styles.statLabel}>Next 30 days</span>
          </div>
        </div>
      </div>

      {/* Bookings Breakdown */}
      <div className={styles.bookingBreakdown}>
        <h2>Bookings by Type</h2>
        <div className={styles.breakdownGrid}>
          <div className={styles.breakdownCard}>
            <h3>Field Rentals</h3>
            <p className={styles.breakdownValue}>{stats.fieldRentals}</p>
          </div>
          <div className={styles.breakdownCard}>
            <h3>League Registrations</h3>
            <p className={styles.breakdownValue}>{stats.leagueRegistrations}</p>
          </div>
          <div className={styles.breakdownCard}>
            <h3>Pickup Games</h3>
            <p className={styles.breakdownValue}>{stats.pickupGames}</p>
          </div>
          <div className={styles.breakdownCard}>
            <h3>Birthday Parties</h3>
            <p className={styles.breakdownValue}>{stats.birthdayParties}</p>
          </div>
          <div className={styles.breakdownCard}>
            <h3>Training Sessions</h3>
            <p className={styles.breakdownValue}>{stats.trainingSessions}</p>
          </div>
          <div className={styles.breakdownCard}>
            <h3>Camp Registrations</h3>
            <p className={styles.breakdownValue}>{stats.campRegistrations}</p>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <>
          <div 
            className={styles.modalOverlay}
            onClick={() => setSelectedEvent(null)}
          />
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Booking Details</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setSelectedEvent(null)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalContent}>
              {selectedEvent.type === 'field_rental' || 
               selectedEvent.type === 'birthday' || 
               selectedEvent.type === 'camp' || 
               selectedEvent.type === 'pickup' ? (
                <>
                  <div className={styles.detailSection}>
                    <h3>Booking Information</h3>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <strong>Type:</strong>
                        <span>{selectedEvent.type.replace('_', ' ').toUpperCase()}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Customer:</strong>
                        <span>{(selectedEvent.event.resource.data as BookingData).customer_name}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Date:</strong>
                        <span>{moment(selectedEvent.event.start).format('MMMM D, YYYY')}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Time:</strong>
                        <span>{moment(selectedEvent.event.start).format('h:mm A')} - {moment(selectedEvent.event.end).format('h:mm A')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.detailSection}>
                    <h3>Contact Information</h3>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <strong>Email:</strong>
                        <span>{(selectedEvent.event.resource.data as BookingData).customer_email}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Phone:</strong>
                        <span>{(selectedEvent.event.resource.data as BookingData).customer_phone}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Amount:</strong>
                        <span>${(selectedEvent.event.resource.data as BookingData).total_amount}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Status:</strong>
                        <span className={styles.statusBadge}>
                          {(selectedEvent.event.resource.data as BookingData).status || 'confirmed'}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : selectedEvent.type === 'training' ? (
                <>
                  <div className={styles.detailSection}>
                    <h3>Training Information</h3>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <strong>Player:</strong>
                        <span>{(selectedEvent.event.resource.data as TrainingData).player_name}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Type:</strong>
                        <span>{(selectedEvent.event.resource.data as TrainingData).training_type}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Contact Email:</strong>
                        <span>{(selectedEvent.event.resource.data as TrainingData).parent_email}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Contact Phone:</strong>
                        <span>{(selectedEvent.event.resource.data as TrainingData).parent_phone}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.detailSection}>
                    <h3>League Information</h3>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <strong>Team:</strong>
                        <span>{(selectedEvent.event.resource.data as LeagueData).team_name}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Division:</strong>
                        <span>{(selectedEvent.event.resource.data as LeagueData).division}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Contact Email:</strong>
                        <span>{(selectedEvent.event.resource.data as LeagueData).contact_email}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Contact Phone:</strong>
                        <span>{(selectedEvent.event.resource.data as LeagueData).contact_phone}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;