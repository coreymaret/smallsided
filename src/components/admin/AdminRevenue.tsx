// src/components/admin/AdminRevenue.tsx
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../contexts/AdminContext';
import { DollarSign, TrendingUp, Download, Calendar } from '../../components/Icons/Icons';
import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import styles from './AdminRevenue.module.scss';

// ─── Types ────────────────────────────────────────────────────────────────────

type RangePreset = '7d' | '30d' | '90d' | '12m' | 'all';

interface RevenueRow {
  date: string;
  service: string;
  amount: number;
  status: string;
  customer: string;
  bookingId: string;
}

interface ServiceTotal {
  service: string;
  total: number;
  count: number;
  avg: number;
  pct: number;
  color: string;
}

interface DailyPoint {
  date: string;
  revenue: number;
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

const PRESETS: { value: RangePreset; label: string }[] = [
  { value: '7d',  label: 'Last 7 days'   },
  { value: '30d', label: 'Last 30 days'  },
  { value: '90d', label: 'Last 90 days'  },
  { value: '12m', label: 'Last 12 months' },
  { value: 'all', label: 'All time'      },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toISO = (d: Date) => {
  const y  = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${dy}`;
};

const getStartDate = (preset: RangePreset): string | null => {
  if (preset === 'all') return null;
  const d = new Date();
  if (preset === '7d')  d.setDate(d.getDate() - 7);
  if (preset === '30d') d.setDate(d.getDate() - 30);
  if (preset === '90d') d.setDate(d.getDate() - 90);
  if (preset === '12m') d.setFullYear(d.getFullYear() - 1);
  return toISO(d);
};

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const groupByPeriod = (rows: RevenueRow[], preset: RangePreset): DailyPoint[] => {
  const map: Record<string, number> = {};
  const byMonth = preset === '12m' || preset === 'all';
  rows.forEach(r => {
    const key = byMonth ? r.date.slice(0, 7) : r.date;
    map[key] = (map[key] ?? 0) + r.amount;
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

const exportCSV = (rows: RevenueRow[], preset: string) => {
  const header = 'Date,Service,Customer,Amount,Status,Booking ID';
  const lines = rows.map(r =>
    `${r.date},${SERVICE_LABELS[r.service] ?? r.service},"${r.customer}",${r.amount},${r.status},${r.bookingId}`
  );
  const csv  = [header, ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `revenue-${preset}-${toISO(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── Stat card ────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, color, icon: Icon }: {
  label: string; value: string; sub?: string; color: string; icon: any;
}) => (
  <div className={styles.statCard}>
    <div className={styles.statIcon} style={{ background: `${color}18`, color }}>
      <Icon size={20} />
    </div>
    <div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  </div>
);

// ─── Custom tooltip ───────────────────────────────────────────────────────────

const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      <div className={styles.tooltipValue}>{fmtCurrency(payload[0].value)}</div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const AdminRevenue = () => {
  const { can } = useAdmin();
  const [preset, setPreset]               = useState<RangePreset>('30d');
  const [isLoading, setIsLoading]         = useState(true);
  const [rows, setRows]                   = useState<RevenueRow[]>([]);
  const [chartData, setChartData]         = useState<DailyPoint[]>([]);
  const [serviceTotals, setServiceTotals] = useState<ServiceTotal[]>([]);
  const [filterService, setFilterService] = useState<string>('all');
  const [sortBy, setSortBy]               = useState<'date' | 'amount'>('date');

  useEffect(() => { fetchRevenue(); }, [preset]);

  const fetchRevenue = async () => {
    setIsLoading(true);
    const startDate = getStartDate(preset);
    try {
      let query = (supabase as any)
        .from('bookings')
        .select('id, booking_date, booking_type, customer_name, total_amount, payment_status')
        .neq('payment_status', 'refunded')
        .order('booking_date', { ascending: false });
      if (startDate) query = query.gte('booking_date', startDate);

      const { data, error } = await query;
      if (error) throw error;

      const mapped: RevenueRow[] = (data ?? []).map((b: any) => ({
        date:      b.booking_date,
        service:   b.booking_type,
        amount:    Number(b.total_amount),
        status:    b.payment_status,
        customer:  b.customer_name,
        bookingId: b.id,
      }));

      setRows(mapped);

      // Chart — only paid bookings
      const paid = mapped.filter(r => r.status === 'paid');
      setChartData(groupByPeriod(paid, preset));

      // Service totals
      const svcMap: Record<string, { total: number; count: number }> = {};
      paid.forEach(r => {
        if (!svcMap[r.service]) svcMap[r.service] = { total: 0, count: 0 };
        svcMap[r.service].total += r.amount;
        svcMap[r.service].count++;
      });
      const grandTotal = Object.values(svcMap).reduce((s, v) => s + v.total, 0) || 1;
      setServiceTotals(
        Object.entries(svcMap)
          .map(([service, { total, count }]) => ({
            service, total, count,
            avg:   count > 0 ? total / count : 0,
            pct:   Math.round((total / grandTotal) * 100),
            color: SERVICE_COLORS[service] ?? '#667eea',
          }))
          .sort((a, b) => b.total - a.total)
      );
    } catch (err) {
      console.error('Revenue fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const paidRows = rows.filter(r => r.status === 'paid');
  const totalRevenue  = paidRows.reduce((s, r) => s + r.amount, 0);
  const totalBookings = rows.length;
  const paidBookings  = paidRows.length;
  const avgBooking    = paidBookings > 0 ? totalRevenue / paidBookings : 0;
  const pendingRev    = rows.filter(r => r.status === 'pending').reduce((s, r) => s + r.amount, 0);

  const filteredRows = rows
    .filter(r => filterService === 'all' || r.service === filterService)
    .sort((a, b) => sortBy === 'amount' ? b.amount - a.amount : b.date.localeCompare(a.date));

  return (
    <div className={styles.page}>

      {/* ── Header ───────────────────────────────────────────── */}
      <div className={styles.header}>
        <div>
          <h1>Revenue</h1>
          <p>Financial overview across all services</p>
        </div>
        <div className={styles.headerActions}>
          {can('export_data') && (
            <button
              className={styles.exportBtn}
              onClick={() => exportCSV(filteredRows, preset)}
              disabled={isLoading || rows.length === 0}
            >
              <Download size={15} />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* ── Range presets ─────────────────────────────────────── */}
      <div className={styles.presets}>
        {PRESETS.map(p => (
          <button
            key={p.value}
            className={`${styles.presetBtn} ${preset === p.value ? styles.presetBtnActive : ''}`}
            onClick={() => setPreset(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Stat cards ───────────────────────────────────────── */}
      <div className={styles.statGrid}>
        <StatCard label="Total Revenue" value={fmtCurrency(totalRevenue)} sub={`${paidBookings} paid bookings`} color="#10b981" icon={DollarSign} />
        <StatCard label="Average Booking" value={fmtCurrency(avgBooking)} sub="Per paid booking" color="#3b82f6" icon={TrendingUp} />
        <StatCard label="Pending Revenue" value={fmtCurrency(pendingRev)} sub={`${rows.filter(r => r.status === 'pending').length} unpaid`} color="#f59e0b" icon={Calendar} />
        <StatCard label="Total Bookings" value={totalBookings.toString()} sub={`${paidBookings} paid · ${rows.filter(r => r.status === 'pending').length} pending`} color="#8b5cf6" icon={DollarSign} />
      </div>

      {/* ── Charts ───────────────────────────────────────────── */}
      <div className={styles.chartsRow}>

        {/* Area chart */}
        <div className={`${styles.card} ${styles.cardWide}`}>
          <div className={styles.cardHeader}>
            <h2>Revenue Over Time</h2>
            <p className={styles.cardSub}>Paid bookings only</p>
          </div>
          {isLoading ? <div className={styles.chartLoading} /> : chartData.length === 0 ? (
            <div className={styles.chartEmpty}>No paid bookings in this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#98ED66" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#98ED66" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                <Tooltip content={<RevenueTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#98ED66" strokeWidth={2.5} fill="url(#revenueGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Service breakdown */}
        <div className={styles.card}>
          <div className={styles.cardHeader}><h2>By Service</h2></div>
          {isLoading ? <div className={styles.chartLoading} /> : serviceTotals.length === 0 ? (
            <div className={styles.chartEmpty}>No data</div>
          ) : (
            <div className={styles.serviceBreakdown}>
              {serviceTotals.map(s => (
                <div key={s.service} className={styles.serviceRow}>
                  <div className={styles.serviceTop}>
                    <span className={styles.serviceName}>{SERVICE_LABELS[s.service] ?? s.service}</span>
                    <span className={styles.serviceTotal}>{fmtCurrency(s.total)}</span>
                  </div>
                  <div className={styles.serviceBar}>
                    <div className={styles.serviceBarFill} style={{ width: `${s.pct}%`, background: s.color }} />
                  </div>
                  <div className={styles.serviceMeta}>
                    <span>{s.count} bookings</span>
                    <span>avg {fmtCurrency(s.avg)}</span>
                    <span>{s.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Transactions table ────────────────────────────────── */}
      <div className={styles.card}>
        <div className={styles.tableHeader}>
          <h2>Transactions</h2>
          <div className={styles.tableFilters}>
            <select
              className={styles.filterSelect}
              value={filterService}
              onChange={e => setFilterService(e.target.value)}
            >
              <option value="all">All Services</option>
              {Object.entries(SERVICE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            <select
              className={styles.filterSelect}
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.tableLoading}>Loading transactions…</div>
        ) : filteredRows.length === 0 ? (
          <div className={styles.tableEmpty}>No transactions found</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th className={styles.thRight}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map(r => (
                  <tr key={r.bookingId}>
                    <td className={styles.tdMuted}>{fmtDate(r.date)}</td>
                    <td className={styles.tdBold}>{r.customer}</td>
                    <td>
                      <span
                        className={styles.servicePill}
                        style={{ background: `${SERVICE_COLORS[r.service]}18`, color: SERVICE_COLORS[r.service] ?? '#374151' }}
                      >
                        {SERVICE_LABELS[r.service] ?? r.service}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusPill} ${styles[`status_${r.status}`]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className={`${styles.tdRight} ${styles.tdBold}`}>{fmtCurrency(r.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className={styles.tfootLabel}>Total shown</td>
                  <td className={`${styles.tdRight} ${styles.tfootTotal}`}>
                    {fmtCurrency(filteredRows.filter(r => r.status === 'paid').reduce((s, r) => s + r.amount, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminRevenue;
