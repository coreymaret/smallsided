import { useEffect, useState, useCallback } from 'react';
import { useDateFilter } from '../../hooks/useDateFilter';
import DateFilterBar from './shared/DateFilterBar';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../contexts/AdminContext';
import { Calendar, Target, User, Shield, Mail, Phone } from '../../components/Icons/Icons';
import AdminDataTable, { type Column } from './shared/AdminDataTable';
import { CellWithIcon, ArrayCell, StatusBadge, InlineStatusBadge, type BookingStatus as InlineStatus } from './shared/TableCells';
import BookingDrawer, { type DrawerBooking, type BookingStatus } from './shared/BookingDrawer';
import ToastContainer from '../Toast/ToastContainer';
import { useToast } from '../../hooks/useToast';
import styles from './AdminTraining.module.scss';

interface TrainingRegistration {
  id: string;
  training_type: string;
  player_name: string;
  player_age: number;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  skill_level: string;
  focus_areas: string[];
  preferred_days: string[];
  preferred_time: string;
  additional_info: string | null;
  total_amount: number;
  status: string;
  created_at: string;
  stripe_payment_intent_id: string;
}

const formatTrainingType = (type: string) => {
  const types: Record<string, string> = {
    individual: 'Individual',
    'small-group': 'Small Group',
    'position-specific': 'Position-Specific',
  };
  return types[type] || type;
};

const formatSkillLevel = (level: string) =>
  level ? level.charAt(0).toUpperCase() + level.slice(1) : level;

const formatFocusAreas = (areas: string[]) => {
  const areaLabels: Record<string, string> = {
    'ball-control': 'Ball Control',
    shooting: 'Shooting',
    passing: 'Passing',
    dribbling: 'Dribbling',
    defense: 'Defense',
    fitness: 'Fitness',
  };
  return (areas || []).map(a => areaLabels[a] || a);
};

const formatDays = (days: string[]) => {
  const dayLabels: Record<string, string> = {
    monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
    thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
  };
  return (days || []).map(d => dayLabels[d] || d);
};

const formatTime = (time: string) => {
  const times: Record<string, string> = {
    morning: 'Morning (8AM–12PM)',
    afternoon: 'Afternoon (12PM–5PM)',
    evening: 'Evening (5PM–8PM)',
  };
  return times[time] || time;
};

const AdminTraining = () => {
  const { admin, can } = useAdmin();
  const [registrations, setRegistrations] = useState<TrainingRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<DrawerBooking | null>(null);
  const { toasts, showToast, removeToast } = useToast();
  const { preset, range, setPreset } = useDateFilter('all');

  useEffect(() => { fetchRegistrations(); }, [range.from, range.to]);

  const fetchRegistrations = async () => {
    try {
      let query = supabase
        .from('training_registrations')
        .select('*');
      if (range.from) query = (query as any).gte('created_at', range.from);
      if (range.to)   query = (query as any).lte('created_at', range.to + 'T23:59:59');
      const { data, error } = await (query as any).order('created_at', { ascending: false });
      if (error) throw error;
      setRegistrations(data || []);
    } catch (err) {
      console.error('Error fetching training registrations:', err);
      showToast('Failed to load training registrations.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = useCallback((regId: string, newStatus: BookingStatus) => {
    setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status: newStatus } : r));
    setSelectedBooking(prev => prev?.id === regId ? { ...prev, booking_status: newStatus } : prev);
  }, []);

  const handleInlineStatusChange = async (regId: string, newStatus: InlineStatus) => {
    setRegistrations(prev =>
      prev.map(r => r.id === regId ? { ...r, status: newStatus } : r)
    );
    const { error } = await (supabase as any)
      .from('training_registrations')
      .update({ status: newStatus })
      .eq('id', regId);
    if (error) {
      fetchRegistrations();
      showToast('Failed to update status.', 'error');
    } else {
      showToast(`Status updated to ${newStatus.replace('_', ' ')}`, 'success');
    }
  };

  const handleRowClick = (r: TrainingRegistration) => {
    setSelectedBooking({
      id: r.id,
      booking_type: 'training',
      customer_name: r.parent_name,
      customer_email: r.parent_email,
      customer_phone: r.parent_phone,
      booking_date: r.created_at.split('T')[0],
      start_time: null,
      end_time: null,
      field_id: null,
      participants: null,
      total_amount: r.total_amount,
      payment_status: 'paid', // training registrations go through Stripe
      booking_status: (r.status as BookingStatus) ?? 'pending',
      special_requests: r.additional_info,
      metadata: {
        player_name: r.player_name,
        player_age: r.player_age,
        training_type: formatTrainingType(r.training_type),
        skill_level: formatSkillLevel(r.skill_level),
        focus_areas: formatFocusAreas(r.focus_areas).join(', '),
        preferred_days: formatDays(r.preferred_days).join(', '),
        preferred_time: formatTime(r.preferred_time),
      },
      created_at: r.created_at,
      stripe_payment_intent_id: r.stripe_payment_intent_id,
    });
  };

  const columns: Column<TrainingRegistration>[] = [
    {
      header: 'Date',
      accessor: 'created_at',
      cell: (value) => (
        <CellWithIcon icon={Calendar}>
          {new Date(value).toLocaleDateString()}
        </CellWithIcon>
      ),
      exportFormatter: (value) => new Date(value).toLocaleDateString(),
    },
    {
      header: 'Player',
      accessor: 'player_name',
      cell: (value, row) => (
        <CellWithIcon icon={User}>
          <div>
            <div>{value}</div>
            <div className={styles.subText}>{row.player_age} yrs</div>
          </div>
        </CellWithIcon>
      ),
      exportFormatter: (value, row) => `${value} (${row.player_age} yrs)`,
    },
    {
      header: 'Training Type',
      accessor: 'training_type',
      cell: (value) => <CellWithIcon icon={Target}>{formatTrainingType(value)}</CellWithIcon>,
      exportFormatter: (value) => formatTrainingType(value),
    },
    {
      header: 'Skill Level',
      accessor: 'skill_level',
      cell: (value) => <CellWithIcon icon={Shield}>{formatSkillLevel(value)}</CellWithIcon>,
      exportFormatter: (value) => formatSkillLevel(value),
    },
    {
      header: 'Focus Areas',
      accessor: 'focus_areas',
      cell: (value) => <ArrayCell items={formatFocusAreas(value)} maxItems={2} />,
      exportFormatter: (value) => formatFocusAreas(value).join(', '),
    },
    {
      header: 'Parent',
      accessor: 'parent_name',
      cell: (value, row) => (
        <div className={styles.parentCell}>
          <div>{value}</div>
          <div className={styles.contactLine}>
            <CellWithIcon icon={Mail} iconSize={12}>{row.parent_email}</CellWithIcon>
          </div>
          <div className={styles.contactLine}>
            <CellWithIcon icon={Phone} iconSize={12}>{row.parent_phone}</CellWithIcon>
          </div>
        </div>
      ),
      sortable: false,
      exportFormatter: (value, row) => `${value} — ${row.parent_email} — ${row.parent_phone}`,
    },
    {
      header: 'Preferred Days',
      accessor: 'preferred_days',
      cell: (value) => <ArrayCell items={formatDays(value)} />,
      exportFormatter: (value) => formatDays(value).join(', '),
    },
    {
      header: 'Time',
      accessor: 'preferred_time',
      cell: (value) => formatTime(value),
      exportFormatter: (value) => formatTime(value),
    },
    {
      header: 'Amount',
      accessor: 'total_amount',
      cell: (value) => `$${Number(value).toFixed(2)}`,
      exportFormatter: (value) => `$${Number(value).toFixed(2)}`,
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (value, row) => (
        <InlineStatusBadge
          status={value ?? 'pending'}
          onStatusChange={can('change_booking_status') ? (newStatus) => {
            handleInlineStatusChange(row.id, newStatus);
          } : undefined}
        />
      ),
      sortable: false,
    },
  ];

  return (
    <>
      <DateFilterBar preset={preset} onChange={setPreset} resultCount={registrations.length} />
      <AdminDataTable
        data={registrations}
        columns={columns}
        title="Training Registrations"
        subtitle={`${registrations.length} registrations`}
        searchable
        searchPlaceholder="Search by player or parent name..."
        searchFields={['player_name', 'parent_name', 'parent_email']}
        exportable
        exportFilename="training-registrations"
        filters={[
          {
            label: 'All Training Types',
            field: 'training_type',
            options: [
              { label: 'Individual',        value: 'individual'        },
              { label: 'Small Group',       value: 'small-group'       },
              { label: 'Position-Specific', value: 'position-specific' },
            ],
          },
          {
            label: 'All Skill Levels',
            field: 'skill_level',
            options: [
              { label: 'Beginner',     value: 'beginner'     },
              { label: 'Intermediate', value: 'intermediate' },
              { label: 'Advanced',     value: 'advanced'     },
            ],
          },
          {
            label: 'All Statuses',
            field: 'status',
            options: [
              { label: 'Confirmed', value: 'confirmed' },
              { label: 'Pending',   value: 'pending'   },
              { label: 'Cancelled', value: 'cancelled' },
              { label: 'Completed', value: 'completed' },
            ],
          },
        ]}
        loading={isLoading}
        emptyMessage="No training registrations found"
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

export default AdminTraining;
