// src/components/admin/AdminDashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../contexts/AdminContext';
import {
  DollarSign, Calendar, TrendingUp,
  MapPin, ChevronRight
} from '../../components/Icons/Icons';
import {
  LineChart, Line, BarChart, Bar, Cell,
  PieChart, Pie, Tooltip, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid
} from 'recharts';
import styles from './AdminDashboard.module.scss';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatCard {
  label: string;
  value: string;
  sub?: string;
  icon: any;
  color: string;
}

interface RevenuePoint {
  date: string;
  revenue: number;
}

interface ServiceStat {
  service: string;
  count: number;
  revenue: number;
  color: string;
}

interface RecentBooking {
  id: string;
  customer_name: string;
  booking_type: string;
  booking_date: string;
  total_amount: number;
  booking_status: string;
  created_at: string;
}

interface TodayShift {
  id: string;
  staff_name: string;
  shift_type: string;
  start_time: string;
  end_time: string;
}

interface UpcomingBooking {
  id: string;
  customer_name: string;
  booking_type: string;
  start_time: string | null;
  field_id: string | null;
  participants: number | null;
}

interface OccupancySlot {
  hour: string;
  bookings: number;
  pct: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const SERVICE_COLORS: Record<string, string> = {
  field_rental: '#3b82f6',
  training:     '#8b5cf6',
  camp:         '#f59e0b',
  birthday:     '#ec4899',
  league:       '#10b981',
  pickup:       '#ef4444',
};

const SERVICE_LABELS: Record<string, string> = {
  field_rental: 'Field Rental',
  training:     'Training',
  camp:         'Camp',
  birthday:     'Birthday Party',
  league:       'League',
  pickup:       'Pickup',
};

const SHIFT_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  opening: { label: 'Opening', bg: '#eff6ff', color: '#1d4ed8' },
  closing:  { label: 'Closing', bg: '#fdf4ff', color: '#7e22ce' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toISO = (d: Date) => {
  const y  = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${dy}`;
};

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const fmtTime = (t: string | null) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
};

const normalizeField = (id: string | null) => {
  if (!id) return 'Camp Nou';
  const map: Record<string, string> = { 'field-1': 'Camp Nou', 'field-2': 'Old Trafford', 'field-3': 'San Siro', 'field_1': 'Camp Nou' };
  return map[id.toLowerCase()] ?? id;
};

// ─── Stat card ────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, icon: Icon, color }: StatCard) => (
  <div className={styles.statCard}>
    <div className={styles.statIcon} style={{ background: `${color}18`, color }}>
      <Icon size={22} />
    </div>
    <div className={styles.statBody}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  </div>
);

// ─── Custom tooltip for charts ────────────────────────────────────────────────

const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      <div className={styles.tooltipValue}>{fmtCurrency(payload[0].value)}</div>
    </div>
  );
};

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{SERVICE_LABELS[label] ?? label}</div>
      <div className={styles.tooltipValue}>{payload[0].value} bookings</div>
    </div>
  );
};

// ─── Date range presets ───────────────────────────────────────────────────────

type RangePreset = '7d' | '30d' | '90d' | '12m';

const PRESETS: { value: RangePreset; label: string }[] = [
  { value: '7d',  label: '7 days'   },
  { value: '30d', label: '30 days'  },
  { value: '90d', label: '90 days'  },
  { value: '12m', label: '12 months' },
];

const getStartDate = (preset: RangePreset): string => {
  const d = new Date();
  if (preset === '7d')  d.setDate(d.getDate() - 7);
  if (preset === '30d') d.setDate(d.getDate() - 30);
  if (preset === '90d') d.setDate(d.getDate() - 90);
  if (preset === '12m') d.setFullYear(d.getFullYear() - 1);
  return toISO(d);
};

const groupByPeriod = (data: { date: string; amount: number }[], preset: RangePreset): RevenuePoint[] => {
  const map: Record<string, number> = {};
  const byMonth = preset === '12m';

  data.forEach(({ date, amount }) => {
    const key = byMonth ? date.slice(0, 7) : date;
    map[key] = (map[key] ?? 0) + amount;
  });

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({
      date: byMonth
        ? new Date(date + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        : new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue,
    }));
};

// ─── Main component ───────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const { admin } = useAdmin();
  const navigate  = useNavigate();

  const [rangePreset, setRangePreset]         = useState<RangePreset>('30d');
  const [isLoading, setIsLoading]             = useState(true);

  // Stats
  const [totalRevenue, setTotalRevenue]       = useState(0);
  const [totalBookings, setTotalBookings]     = useState(0);
  const [todayBookings, setTodayBookings]     = useState(0);
  const [occupancyRate, setOccupancyRate]     = useState(0);

  // Chart data
  const [revenueData, setRevenueData]         = useState<RevenuePoint[]>([]);
  const [serviceStats, setServiceStats]       = useState<ServiceStat[]>([]);
  const [occupancyData, setOccupancyData]     = useState<OccupancySlot[]>([]);

  // Lists
  const [recentBookings, setRecentBookings]   = useState<RecentBooking[]>([]);
  const [todayUpcoming, setTodayUpcoming]     = useState<UpcomingBooking[]>([]);
  const [todayShifts, setTodayShifts]         = useState<TodayShift[]>([]);

  useEffect(() => { fetchAll(); }, [rangePreset]);

  const fetchAll = async () => {
    setIsLoading(true);
    const today     = toISO(new Date());
    const startDate = getStartDate(rangePreset);

    try {
      const [
        allBookingsRes,
        rangeBookingsRes,
        todayBookingsRes,
        recentRes,
        shiftsRes,
        staffRes,
      ] = await Promise.all([
        // All bookings for totals
        (supabase as any).from('bookings').select('total_amount, booking_type, payment_status'),
        // Range bookings for charts
        (supabase as any).from('bookings')
          .select('total_amount, booking_type, booking_date, payment_status')
          .gte('booking_date', startDate)
          .lte('booking_date', today)
          .neq('payment_status', 'refunded'),
        // Today's bookings
        (supabase as any).from('bookings')
          .select('id, customer_name, booking_type, start_time, field_id, participants, booking_status')
          .eq('booking_date', today)
          .neq('booking_status', 'cancelled')
          .order('start_time', { ascending: true }),
        // Recent bookings
        (supabase as any).from('bookings')
          .select('id, customer_name, booking_type, booking_date, total_amount, booking_status, created_at')
          .order('created_at', { ascending: false })
          .limit(8),
        // Today's shifts
        (supabase as any).from('shifts')
          .select('id, staff_id, shift_type, start_time, end_time')
          .eq('shift_date', today),
        // Staff for shift names
        (supabase as any).from('staff_members').select('id, full_name'),
      ]);

      // ── Total revenue & bookings ──
      const allPaid = (allBookingsRes.data ?? []).filter((b: any) => b.payment_status === 'paid');
      setTotalRevenue(allPaid.reduce((s: number, b: any) => s + Number(b.total_amount), 0));
      setTotalBookings((allBookingsRes.data ?? []).length);

      // ── Today's bookings count ──
      setTodayBookings((todayBookingsRes.data ?? []).length);
      setTodayUpcoming(todayBookingsRes.data ?? []);

      // ── Revenue chart (by date) ──
      const rangeData = (rangeBookingsRes.data ?? []).map((b: any) => ({
        date: b.booking_date,
        amount: Number(b.total_amount),
      }));
      setRevenueData(groupByPeriod(rangeData, rangePreset));

      // ── Service stats ──
      const serviceMap: Record<string, { count: number; revenue: number }> = {};
      (rangeBookingsRes.data ?? []).forEach((b: any) => {
        if (!serviceMap[b.booking_type]) serviceMap[b.booking_type] = { count: 0, revenue: 0 };
        serviceMap[b.booking_type].count++;
        serviceMap[b.booking_type].revenue += Number(b.total_amount);
      });
      setServiceStats(
        Object.entries(serviceMap).map(([service, { count, revenue }]) => ({
          service, count, revenue,
          color: SERVICE_COLORS[service] ?? '#667eea',
        })).sort((a, b) => b.count - a.count)
      );

      // ── Occupancy heatmap ──
      // Count bookings per hour across the range
      const hourMap: Record<number, number> = {};
      for (let h = 10; h < 24; h++) hourMap[h] = 0;
      (rangeBookingsRes.data ?? []).forEach((b: any) => {
        if (!b.start_time) return;
        const h = parseInt(b.start_time.split(':')[0]);
        if (h >= 10 && h < 24) hourMap[h]++;
      });
      const maxH = Math.max(...Object.values(hourMap), 1);
      const occupancy = Object.entries(hourMap).map(([h, count]) => {
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const display = `${hour % 12 || 12}${ampm}`;
        return { hour: display, bookings: count, pct: Math.round((count / maxH) * 100) };
      });
      setOccupancyData(occupancy);

      // ── Overall occupancy rate (today) ──
      // 3 fields × 14 hours = 42 possible hour slots
      const possibleSlots = 3 * 14;
      const usedSlots = (todayBookingsRes.data ?? []).length;
      setOccupancyRate(Math.min(100, Math.round((usedSlots / possibleSlots) * 100)));

      // ── Recent bookings ──
      setRecentBookings(recentRes.data ?? []);

      // ── Today shifts + staff names ──
      const staffMap: Record<string, string> = {};
      (staffRes.data ?? []).forEach((s: any) => { staffMap[s.id] = s.full_name; });
      setTodayShifts(
        (shiftsRes.data ?? []).map((s: any) => ({
          ...s, staff_name: staffMap[s.staff_id] ?? 'Unknown',
        }))
      );

    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const rangeRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
  const donutData    = serviceStats.map(s => ({ name: SERVICE_LABELS[s.service] ?? s.service, value: s.revenue, color: s.color }));

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className={styles.page}>

      {/* ── Greeting ─────────────────────────────────────────── */}
      <div className={styles.greeting}>
        <div>
          <h1>{greeting()}, {admin?.full_name?.split(' ')[0] ?? 'Admin'} 👋</h1>
          <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className={styles.rangePresets}>
          {PRESETS.map(p => (
            <button
              key={p.value}
              className={`${styles.rangeBtn} ${rangePreset === p.value ? styles.rangeBtnActive : ''}`}
              onClick={() => setRangePreset(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────────────── */}
      <div className={styles.statGrid}>
        <StatCard label="Total Revenue" value={fmtCurrency(totalRevenue)} sub="All time · paid bookings" icon={DollarSign} color="#10b981" />
        <StatCard label={`Revenue (${PRESETS.find(p => p.value === rangePreset)?.label})`} value={fmtCurrency(rangeRevenue)} icon={TrendingUp} color="#3b82f6" />
        <StatCard label="Total Bookings" value={totalBookings.toLocaleString()} sub="All services · all time" icon={Calendar} color="#8b5cf6" />
        <StatCard label="Today's Bookings" value={todayBookings.toString()} sub={`${occupancyRate}% field occupancy`} icon={MapPin} color="#f59e0b" />
      </div>

      {/* ── Main charts row ───────────────────────────────────── */}
      <div className={styles.chartsRow}>

        {/* Revenue line chart */}
        <div className={`${styles.card} ${styles.cardWide}`}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Revenue Over Time</h2>
              <p className={styles.cardSub}>{fmtCurrency(rangeRevenue)} in selected period</p>
            </div>
          </div>
          {isLoading ? <div className={styles.chartLoading} /> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                <Tooltip content={<RevenueTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="#98ED66" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#98ED66' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Donut chart */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Revenue by Service</h2>
          </div>
          {isLoading ? <div className={styles.chartLoading} /> : donutData.length === 0 ? (
            <div className={styles.chartEmpty}>No data for this period</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {donutData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => fmtCurrency(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.donutLegend}>
                {donutData.map((d, i) => (
                  <div key={i} className={styles.donutLegendItem}>
                    <span className={styles.donutDot} style={{ background: d.color }} />
                    <span className={styles.donutLabel}>{d.name}</span>
                    <span className={styles.donutValue}>{fmtCurrency(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Second charts row ─────────────────────────────────── */}
      <div className={styles.chartsRow}>

        {/* Bookings by service bar chart */}
        <div className={styles.card}>
          <div className={styles.cardHeader}><h2>Bookings by Service</h2></div>
          {isLoading ? <div className={styles.chartLoading} /> : serviceStats.length === 0 ? (
            <div className={styles.chartEmpty}>No bookings in this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={serviceStats.map(s => ({ name: s.service, bookings: s.count }))} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" tickFormatter={v => SERVICE_LABELS[v]?.split(' ')[0] ?? v} tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="bookings" radius={[4, 4, 0, 0]}>
                  {serviceStats.map((s, i) => <Cell key={i} fill={s.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Occupancy heatmap */}
        <div className={`${styles.card} ${styles.cardWide}`}>
          <div className={styles.cardHeader}>
            <h2>Field Occupancy by Hour</h2>
            <p className={styles.cardSub}>Booking frequency across operating hours</p>
          </div>
          {isLoading ? <div className={styles.chartLoading} /> : (
            <div className={styles.heatmap}>
              {occupancyData.map((slot, i) => (
                <div key={i} className={styles.heatmapSlot}>
                  <div
                    className={styles.heatmapBar}
                    style={{
                      height: `${Math.max(4, slot.pct)}%`,
                      background: slot.pct > 70 ? '#ef4444' : slot.pct > 40 ? '#f59e0b' : '#98ED66',
                    }}
                    title={`${slot.bookings} booking${slot.bookings !== 1 ? 's' : ''}`}
                  />
                  <span className={styles.heatmapLabel}>{slot.hour}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom row ────────────────────────────────────────── */}
      <div className={styles.bottomRow}>

        {/* Today's schedule */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Today's Bookings</h2>
            <button className={styles.viewAllBtn} onClick={() => navigate('/admin/schedule')}>
              View Schedule <ChevronRight size={14} />
            </button>
          </div>
          {todayUpcoming.length === 0 ? (
            <div className={styles.listEmpty}>No bookings today</div>
          ) : (
            <div className={styles.bookingList}>
              {todayUpcoming.map(b => (
                <div key={b.id} className={styles.bookingItem}>
                  <div className={styles.bookingDot} style={{ background: SERVICE_COLORS[b.booking_type] ?? '#667eea' }} />
                  <div className={styles.bookingInfo}>
                    <span className={styles.bookingName}>{b.customer_name}</span>
                    <span className={styles.bookingMeta}>
                      {SERVICE_LABELS[b.booking_type]}
                      {b.start_time && ` · ${fmtTime(b.start_time)}`}
                      {b.field_id && ` · ${normalizeField(b.field_id)}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Staff on shift today */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Staff On Shift Today</h2>
            <button className={styles.viewAllBtn} onClick={() => navigate('/admin/shifts')}>
              Manage Shifts <ChevronRight size={14} />
            </button>
          </div>
          {todayShifts.length === 0 ? (
            <div className={styles.listEmpty}>No shifts scheduled today</div>
          ) : (
            <div className={styles.shiftList}>
              {todayShifts.map(s => {
                const cfg = SHIFT_CONFIG[s.shift_type] ?? SHIFT_CONFIG.opening;
                return (
                  <div key={s.id} className={styles.shiftItem}>
                    <div className={styles.shiftAvatar}>{(s.staff_name ?? '?').charAt(0)}</div>
                    <div className={styles.shiftInfo}>
                      <span className={styles.shiftName}>{s.staff_name}</span>
                      <span className={styles.shiftMeta}>{fmtTime(s.start_time)} – {fmtTime(s.end_time)}</span>
                    </div>
                    <span className={styles.shiftBadge} style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Recent Bookings</h2>
            <button className={styles.viewAllBtn} onClick={() => navigate('/admin/field-rentals')}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          {recentBookings.length === 0 ? (
            <div className={styles.listEmpty}>No recent bookings</div>
          ) : (
            <div className={styles.activityList}>
              {recentBookings.map(b => (
                <div key={b.id} className={styles.activityItem}>
                  <div className={styles.activityDot} style={{ background: SERVICE_COLORS[b.booking_type] ?? '#667eea' }} />
                  <div className={styles.activityInfo}>
                    <span className={styles.activityName}>{b.customer_name}</span>
                    <span className={styles.activityMeta}>
                      {SERVICE_LABELS[b.booking_type]} · {new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <span className={styles.activityAmount}>${Number(b.total_amount).toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
