// src/components/admin/AdminOccupancy.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { MapPin, Clock, TrendingUp, Calendar } from '../../components/Icons/Icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import styles from './AdminOccupancy.module.scss';

// ─── Types ────────────────────────────────────────────────────────────────────

type RangePreset = '7d' | '30d' | '90d';

interface HourSlot  { hour: string; bookings: number; pct: number; }
interface DaySlot   { day: string;  bookings: number; pct: number; }
interface FieldStat { field: string; bookings: number; hours: number; pct: number; color: string; }
interface ServiceStat { service: string; bookings: number; color: string; }

// ─── Config ───────────────────────────────────────────────────────────────────

const FIELDS = [
  { id: 'field-1', aliases: ['field_1', 'field-1'], name: 'Camp Nou',     color: '#3b82f6' },
  { id: 'field-2', aliases: ['field_2', 'field-2'], name: 'Old Trafford', color: '#8b5cf6' },
  { id: 'field-3', aliases: ['field_3', 'field-3'], name: 'San Siro',     color: '#10b981' },
];

const SERVICE_COLORS: Record<string, string> = {
  field_rental: '#3b82f6', training: '#8b5cf6', camp: '#f59e0b',
  birthday: '#ec4899', league: '#10b981', pickup: '#ef4444',
};

const SERVICE_LABELS: Record<string, string> = {
  field_rental: 'Field Rental', training: 'Training', camp: 'Camp',
  birthday: 'Birthday Party', league: 'League', pickup: 'Pickup',
};

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PRESETS: { value: RangePreset; label: string }[] = [
  { value: '7d',  label: 'Last 7 days'  },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toISO = (d: Date) => {
  const y = d.getFullYear(), mo = String(d.getMonth()+1).padStart(2,'0'), dy = String(d.getDate()).padStart(2,'0');
  return `${y}-${mo}-${dy}`;
};

const getStart = (preset: RangePreset) => {
  const d = new Date();
  if (preset === '7d')  d.setDate(d.getDate() - 7);
  if (preset === '30d') d.setDate(d.getDate() - 30);
  if (preset === '90d') d.setDate(d.getDate() - 90);
  return toISO(d);
};

const normalizeField = (id: string | null): string => {
  if (!id) return 'field-1';
  const lower = id.toLowerCase().replace('_', '-');
  if (lower.includes('1')) return 'field-1';
  if (lower.includes('2')) return 'field-2';
  if (lower.includes('3')) return 'field-3';
  return 'field-1';
};

const fmtPct = (n: number) => `${n}%`;

// ─── Heatmap cell color ───────────────────────────────────────────────────────
const heatColor = (pct: number): string => {
  if (pct === 0)   return '#f3f4f6';
  if (pct <= 25)   return '#dcfce7';
  if (pct <= 50)   return '#86efac';
  if (pct <= 75)   return '#f59e0b';
  return '#ef4444';
};

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon: Icon, color }: {
  label: string; value: string; sub?: string; icon: any; color: string;
}) => (
  <div className={styles.statCard}>
    <div className={styles.statIcon} style={{ background: `${color}18`, color }}><Icon size={20} /></div>
    <div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  </div>
);

// ─── Tooltip ─────────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      <div className={styles.tooltipValue}>{payload[0].value} bookings</div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const AdminOccupancy = () => {
  const [preset, setPreset]           = useState<RangePreset>('30d');
  const [isLoading, setIsLoading]     = useState(true);
  const [hourSlots, setHourSlots]     = useState<HourSlot[]>([]);
  const [daySlots, setDaySlots]       = useState<DaySlot[]>([]);
  const [fieldStats, setFieldStats]   = useState<FieldStat[]>([]);
  const [serviceStats, setServiceStats] = useState<ServiceStat[]>([]);
  const [totalBookings, setTotal]     = useState(0);
  const [peakHour, setPeakHour]       = useState('—');
  const [peakDay, setPeakDay]         = useState('—');
  const [avgPerDay, setAvgPerDay]     = useState(0);

  useEffect(() => { fetchData(); }, [preset]);

  const fetchData = async () => {
    setIsLoading(true);
    const start = getStart(preset);
    const today = toISO(new Date());
    try {
      const { data, error } = await (supabase as any)
        .from('bookings')
        .select('id, booking_date, start_time, end_time, field_id, booking_type, booking_status')
        .gte('booking_date', start)
        .lte('booking_date', today)
        .neq('booking_status', 'cancelled');
      if (error) throw error;
      const bookings = data ?? [];
      setTotal(bookings.length);

      // ── By hour ──
      const hourMap: Record<number, number> = {};
      for (let h = 10; h < 24; h++) hourMap[h] = 0;
      bookings.forEach((b: any) => {
        if (!b.start_time) return;
        const h = parseInt(b.start_time.split(':')[0]);
        if (h >= 10 && h < 24) hourMap[h]++;
      });
      const maxHour = Math.max(...Object.values(hourMap), 1);
      const hourData = Object.entries(hourMap).map(([h, count]) => {
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        return { hour: `${hour % 12 || 12}${ampm}`, bookings: count, pct: Math.round((count / maxHour) * 100) };
      });
      setHourSlots(hourData);
      const peakH = hourData.reduce((a, b) => b.bookings > a.bookings ? b : a, hourData[0]);
      setPeakHour(peakH?.bookings > 0 ? peakH.hour : '—');

      // ── By day of week ──
      const dayMap: Record<number, number> = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 };
      bookings.forEach((b: any) => {
        const dow = new Date(b.booking_date + 'T00:00:00').getDay();
        dayMap[dow]++;
      });
      const maxDay = Math.max(...Object.values(dayMap), 1);
      const dayData = DAYS_OF_WEEK.map((day, i) => ({
        day, bookings: dayMap[i], pct: Math.round((dayMap[i] / maxDay) * 100),
      }));
      setDaySlots(dayData);
      const peakD = dayData.reduce((a, b) => b.bookings > a.bookings ? b : a, dayData[0]);
      setPeakDay(peakD?.bookings > 0 ? peakD.day : '—');

      // ── By field ──
      const fieldMap: Record<string, number> = { 'field-1': 0, 'field-2': 0, 'field-3': 0 };
      bookings.forEach((b: any) => { fieldMap[normalizeField(b.field_id)]++; });
      const maxField = Math.max(...Object.values(fieldMap), 1);
      setFieldStats(FIELDS.map(f => ({
        field:    f.name,
        bookings: fieldMap[f.id],
        hours:    fieldMap[f.id], // proxy for hours
        pct:      Math.round((fieldMap[f.id] / maxField) * 100),
        color:    f.color,
      })));

      // ── By service ──
      const svcMap: Record<string, number> = {};
      bookings.forEach((b: any) => { svcMap[b.booking_type] = (svcMap[b.booking_type] ?? 0) + 1; });
      setServiceStats(
        Object.entries(svcMap)
          .map(([service, count]) => ({ service, bookings: count, color: SERVICE_COLORS[service] ?? '#667eea' }))
          .sort((a, b) => b.bookings - a.bookings)
      );

      // ── Avg per day ──
      const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 90;
      setAvgPerDay(Math.round(bookings.length / days * 10) / 10);

    } catch (err) {
      console.error('Occupancy fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>Occupancy</h1>
          <p>Field utilization and booking patterns</p>
        </div>
        <div className={styles.presets}>
          {PRESETS.map(p => (
            <button key={p.value}
              className={`${styles.presetBtn} ${preset === p.value ? styles.presetBtnActive : ''}`}
              onClick={() => setPreset(p.value)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className={styles.statGrid}>
        <StatCard label="Total Bookings" value={totalBookings.toString()} sub={`In last ${preset === '7d' ? '7' : preset === '30d' ? '30' : '90'} days`} icon={Calendar} color="#3b82f6" />
        <StatCard label="Avg Bookings/Day" value={avgPerDay.toString()} icon={TrendingUp} color="#10b981" />
        <StatCard label="Peak Hour" value={peakHour} sub="Most popular booking time" icon={Clock} color="#f59e0b" />
        <StatCard label="Peak Day" value={peakDay} sub="Busiest day of the week" icon={MapPin} color="#8b5cf6" />
      </div>

      {/* Hour heatmap + Day of week */}
      <div className={styles.chartsRow}>

        {/* Hourly heatmap */}
        <div className={`${styles.card} ${styles.cardWide}`}>
          <div className={styles.cardHeader}>
            <h2>Bookings by Hour</h2>
            <p className={styles.cardSub}>Operating hours 10am – midnight</p>
          </div>
          {isLoading ? <div className={styles.chartLoading} /> : (
            <div className={styles.heatmapGrid}>
              {hourSlots.map((slot, i) => (
                <div key={i} className={styles.heatmapCell}>
                  <div
                    className={styles.heatmapBlock}
                    style={{ background: heatColor(slot.pct) }}
                    title={`${slot.bookings} bookings`}
                  >
                    {slot.bookings > 0 && <span className={styles.heatmapCount}>{slot.bookings}</span>}
                  </div>
                  <span className={styles.heatmapHour}>{slot.hour}</span>
                </div>
              ))}
            </div>
          )}
          <div className={styles.heatLegend}>
            <span className={styles.heatLegendLabel}>Low</span>
            {['#f3f4f6','#dcfce7','#86efac','#f59e0b','#ef4444'].map((c, i) => (
              <span key={i} className={styles.heatLegendSwatch} style={{ background: c }} />
            ))}
            <span className={styles.heatLegendLabel}>High</span>
          </div>
        </div>

        {/* Day of week bar chart */}
        <div className={styles.card}>
          <div className={styles.cardHeader}><h2>Bookings by Day</h2></div>
          {isLoading ? <div className={styles.chartLoading} /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={daySlots} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="bookings" radius={[4, 4, 0, 0]}>
                  {daySlots.map((slot, i) => (
                    <Cell key={i} fill={slot.pct >= 100 ? '#ef4444' : slot.pct >= 60 ? '#f59e0b' : '#98ED66'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Field utilization + Service mix */}
      <div className={styles.chartsRow}>

        {/* Field utilization */}
        <div className={styles.card}>
          <div className={styles.cardHeader}><h2>Field Utilization</h2></div>
          {isLoading ? <div className={styles.chartLoading} /> : (
            <div className={styles.fieldBars}>
              {fieldStats.map(f => (
                <div key={f.field} className={styles.fieldRow}>
                  <div className={styles.fieldName}>{f.field}</div>
                  <div className={styles.fieldBarWrap}>
                    <div className={styles.fieldBarTrack}>
                      <div
                        className={styles.fieldBarFill}
                        style={{ width: `${f.pct}%`, background: f.color }}
                      />
                    </div>
                    <span className={styles.fieldCount}>{f.bookings} bookings</span>
                  </div>
                </div>
              ))}
              {fieldStats.length === 0 && <div className={styles.chartEmpty}>No data</div>}
            </div>
          )}
        </div>

        {/* Service mix */}
        <div className={styles.card}>
          <div className={styles.cardHeader}><h2>Service Mix</h2></div>
          {isLoading ? <div className={styles.chartLoading} /> : serviceStats.length === 0 ? (
            <div className={styles.chartEmpty}>No bookings in this period</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={serviceStats.map(s => ({ name: s.service, bookings: s.bookings }))}
                  layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name"
                    tickFormatter={v => SERVICE_LABELS[v]?.split(' ')[0] ?? v}
                    tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={60} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="bookings" radius={[0, 4, 4, 0]}>
                    {serviceStats.map((s, i) => <Cell key={i} fill={s.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className={styles.serviceLegend}>
                {serviceStats.map(s => (
                  <div key={s.service} className={styles.serviceLegendItem}>
                    <span className={styles.serviceDot} style={{ background: s.color }} />
                    <span>{SERVICE_LABELS[s.service] ?? s.service}</span>
                    <span className={styles.serviceLegendCount}>{s.bookings}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>

      {/* Weekly heatmap grid — bookings per day across the range */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Activity Grid</h2>
          <p className={styles.cardSub}>Each cell = one day · color = booking intensity</p>
        </div>
        {isLoading ? <div className={styles.chartLoading} /> : (
          <ActivityGrid preset={preset} />
        )}
      </div>

    </div>
  );
};

// ─── Activity grid (GitHub-style contribution graph) ──────────────────────────

const ActivityGrid = ({ preset }: { preset: RangePreset }) => {
  const [grid, setGrid] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 90;
    const today = new Date();
    const dates = Array.from({ length: days }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (days - 1 - i));
      return toISO(d);
    });

    const fetchCounts = async () => {
      const start = dates[0];
      const end   = dates[dates.length - 1];
      const { data } = await (supabase as any)
        .from('bookings')
        .select('booking_date')
        .gte('booking_date', start)
        .lte('booking_date', end)
        .neq('booking_status', 'cancelled');

      const countMap: Record<string, number> = {};
      (data ?? []).forEach((b: any) => {
        countMap[b.booking_date] = (countMap[b.booking_date] ?? 0) + 1;
      });
      setGrid(dates.map(date => ({ date, count: countMap[date] ?? 0 })));
    };

    fetchCounts();
  }, [preset]);

  if (!grid.length) return null;
  const max = Math.max(...grid.map(g => g.count), 1);

  return (
    <div className={styles.activityGrid}>
      {grid.map(({ date, count }) => {
        const pct = Math.round((count / max) * 100);
        return (
          <div
            key={date}
            className={styles.activityCell}
            style={{ background: heatColor(pct) }}
            title={`${date}: ${count} booking${count !== 1 ? 's' : ''}`}
          />
        );
      })}
    </div>
  );
};

export default AdminOccupancy;
