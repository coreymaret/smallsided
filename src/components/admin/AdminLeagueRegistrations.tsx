import { useEffect, useState, useCallback } from 'react';
import { useDateFilter } from '../../hooks/useDateFilter';
import DateFilterBar from './shared/DateFilterBar';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../contexts/AdminContext';
import { Trophy, User, Calendar } from '../../components/Icons/Icons';
import AdminDataTable, { type Column } from './shared/AdminDataTable';
import { CellWithIcon, ContactCell, StatusBadge } from './shared/TableCells';
import BookingDrawer, { type DrawerBooking, type BookingStatus } from './shared/BookingDrawer';
import ToastContainer from '../Toast/ToastContainer';
import { useToast } from '../../hooks/useToast';

interface LeagueRegistration {
  id: string;
  league_id: string;
  team_name: string;
  age_division: string;
  captain_name: string;
  captain_email: string;
  captain_phone: string;
  skill_level: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
  waiver_signed: boolean;
  additional_notes: string | null;
  stripe_payment_intent_id: string | null;
  leagues?: {
    name: string;
    season: string;
  };
}

const AdminLeagueRegistrations = () => {
  const { admin, can } = useAdmin();
  const [registrations, setRegistrations] = useState<LeagueRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<DrawerBooking | null>(null);
  const { toasts, showToast, removeToast } = useToast();
  const { preset, range, setPreset } = useDateFilter('upcoming');

  useEffect(() => { fetchRegistrations(); }, [range.from, range.to]);

  const fetchRegistrations = async () => {
    try {
      let query = supabase.from('league_registrations').select('*, leagues(*)');
      if (range.from) query = (query as any).gte('created_at', range.from);
if (range.to)   query = (query as any).lte('created_at', range.to);
      const { data, error } = await (query as any).order('created_at', { ascending: false });
      if (error) throw error;
      setRegistrations(data || []);
    } catch (err) {
      console.error('Error:', err);
      showToast('Failed to load league registrations.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = (r: LeagueRegistration) => {
    setSelectedBooking({
      id: r.id,
      booking_type: 'league',
      customer_name: r.captain_name,
      customer_email: r.captain_email,
      customer_phone: r.captain_phone,
      booking_date: r.created_at.split('T')[0],
      start_time: null,
      end_time: null,
      field_id: null,
      participants: null,
      total_amount: r.total_amount,
      payment_status: r.payment_status as DrawerBooking['payment_status'],
      booking_status: 'confirmed',
      special_requests: r.additional_notes,
      metadata: {
        team_name:    r.team_name,
        age_division: r.age_division,
        skill_level:  r.skill_level,
        league_name:  r.leagues?.name,
        season:       r.leagues?.season,
        waiver_signed: r.waiver_signed ? 'Yes' : 'No',
      },
      created_at: r.created_at,
      stripe_payment_intent_id: r.stripe_payment_intent_id,
    });
  };

  const handleStatusChange = useCallback((regId: string, newStatus: BookingStatus) => {
    setSelectedBooking(prev => prev?.id === regId ? { ...prev, booking_status: newStatus } : prev);
  }, []);

  const columns: Column<LeagueRegistration>[] = [
    {
      header: 'Registered',
      accessor: 'created_at',
      cell: (value) => (
        <CellWithIcon icon={Calendar}>
          {new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </CellWithIcon>
      ),
      exportFormatter: (value) => new Date(value).toLocaleDateString(),
    },
    {
      header: 'Team',
      accessor: 'team_name',
      cell: (value) => <CellWithIcon icon={Trophy}>{value}</CellWithIcon>,
    },
    {
      header: 'League',
      accessor: (row) => row.leagues?.name || row.age_division,
    },
    {
      header: 'Season',
      accessor: (row) => row.leagues?.season || '—',
    },
    {
      header: 'Captain',
      accessor: 'captain_name',
      cell: (value) => <CellWithIcon icon={User}>{value}</CellWithIcon>,
    },
    {
      header: 'Contact',
      accessor: (row) => `${row.captain_email} ${row.captain_phone}`,
      cell: (_, row) => <ContactCell email={row.captain_email} phone={row.captain_phone} />,
      sortable: false,
      exportFormatter: (_, row) => `${row.captain_email}, ${row.captain_phone}`,
    },
    {
      header: 'Experience',
      accessor: 'skill_level',
    },
    {
      header: 'Waiver',
      accessor: 'waiver_signed',
      cell: (value) => (
        <span style={{ color: value ? '#16a34a' : '#dc2626', fontWeight: 600, fontSize: '0.8125rem' }}>
          {value ? '✓ Signed' : '✗ Missing'}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessor: 'total_amount',
      cell: (value) => `$${Number(value).toFixed(2)}`,
      exportFormatter: (value) => `$${Number(value).toFixed(2)}`,
    },
    {
      header: 'Status',
      accessor: 'payment_status',
      cell: (value) => <StatusBadge status={value || 'paid'} />,
    },
  ];

  return (
    <>
      <DateFilterBar preset={preset} onChange={setPreset} resultCount={registrations.length} />
      <AdminDataTable
        data={registrations}
        columns={columns}
        title="League Registrations"
        subtitle={`${registrations.length} teams`}
        searchable
        searchPlaceholder="Search teams..."
        searchFields={['team_name', 'captain_name', 'captain_email']}
        exportable
        exportFilename="league-registrations"
        loading={isLoading}
        emptyMessage="No league registrations found"
        filters={[
          {
            label: 'All Statuses',
            field: 'payment_status',
            options: [
              { label: 'Paid',     value: 'paid'     },
              { label: 'Pending',  value: 'pending'  },
              { label: 'Refunded', value: 'refunded' },
              { label: 'Failed',   value: 'failed'   },
            ],
          },
          {
            label: 'Waiver',
            field: 'waiver_signed',
            options: [
              { label: 'Signed',  value: 'true'  },
              { label: 'Missing', value: 'false' },
            ],
          },
        ]}
        onRowClick={handleRowClick}
      />
      <BookingDrawer
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onStatusChange={handleStatusChange}
        showToast={showToast}
        canChangeStatus={can('change_booking_status')}
        canAddNotes={can('add_booking_notes')}
        adminName={admin?.full_name ?? ''}
        adminId={admin?.id ?? ''}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};

export default AdminLeagueRegistrations;
