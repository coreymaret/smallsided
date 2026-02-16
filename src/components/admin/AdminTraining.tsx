import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, Target, User, Shield, Mail, Phone } from 'lucide-react';
import AdminDataTable, { type Column } from './shared/AdminDataTable';
import { CellWithIcon, ArrayCell, StatusBadge } from './shared/TableCells';

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

const AdminTraining = () => {
  const [registrations, setRegistrations] = useState<TrainingRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<TrainingRegistration | null>(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedRegistration) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [selectedRegistration]);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('training_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching training registrations:', error);
      } else {
        setRegistrations(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTrainingType = (type: string) => {
    const types: Record<string, string> = {
      individual: 'Individual',
      'small-group': 'Small Group',
      'position-specific': 'Position-Specific',
    };
    return types[type] || type;
  };

  const formatSkillLevel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  const formatFocusAreas = (areas: string[]) => {
    const areaLabels: Record<string, string> = {
      'ball-control': 'Ball Control',
      shooting: 'Shooting',
      passing: 'Passing',
      dribbling: 'Dribbling',
      defense: 'Defense',
      fitness: 'Fitness',
    };
    return areas.map((a) => areaLabels[a] || a);
  };

  const formatDays = (days: string[]) => {
    const dayLabels: Record<string, string> = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun',
    };
    return days.map((d) => dayLabels[d] || d);
  };

  const formatTime = (time: string) => {
    const times: Record<string, string> = {
      morning: 'Morning (8AM-12PM)',
      afternoon: 'Afternoon (12PM-5PM)',
      evening: 'Evening (5PM-8PM)',
    };
    return times[time] || time;
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
            <div style={{ fontSize: '0.85em', color: '#666' }}>{row.player_age} yrs</div>
          </div>
        </CellWithIcon>
      ),
      exportFormatter: (value, row) => `${value} (${row.player_age} yrs)`,
    },
    {
      header: 'Training Type',
      accessor: 'training_type',
      cell: (value) => (
        <CellWithIcon icon={Target}>
          {formatTrainingType(value)}
        </CellWithIcon>
      ),
      exportFormatter: (value) => formatTrainingType(value),
    },
    {
      header: 'Skill Level',
      accessor: 'skill_level',
      cell: (value) => (
        <CellWithIcon icon={Shield}>
          {formatSkillLevel(value)}
        </CellWithIcon>
      ),
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
        <div>
          <div>{value}</div>
          <div style={{ fontSize: '0.85em', color: '#666' }}>
            <CellWithIcon icon={Mail} iconSize={12}>
              {row.parent_email}
            </CellWithIcon>
          </div>
          <div style={{ fontSize: '0.85em', color: '#666' }}>
            <CellWithIcon icon={Phone} iconSize={12}>
              {row.parent_phone}
            </CellWithIcon>
          </div>
        </div>
      ),
      sortable: false,
      exportFormatter: (value, row) => `${value} - ${row.parent_email} - ${row.parent_phone}`,
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
      cell: (value) => `$${value}`,
      exportFormatter: (value) => `$${value}`,
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (value) => <StatusBadge status={value} />,
    },
  ];

  return (
    <>
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
              { label: 'Individual', value: 'individual' },
              { label: 'Small Group', value: 'small-group' },
              { label: 'Position-Specific', value: 'position-specific' },
            ],
          },
          {
            label: 'All Skill Levels',
            field: 'skill_level',
            options: [
              { label: 'Beginner', value: 'beginner' },
              { label: 'Intermediate', value: 'intermediate' },
              { label: 'Advanced', value: 'advanced' },
            ],
          },
          {
            label: 'All Statuses',
            field: 'status',
            options: [
              { label: 'Confirmed', value: 'confirmed' },
              { label: 'Pending', value: 'pending' },
              { label: 'Cancelled', value: 'cancelled' },
              { label: 'Completed', value: 'completed' },
            ],
          },
        ]}
        loading={isLoading}
        emptyMessage="No training registrations found"
        onRowClick={(row) => setSelectedRegistration(row)}
      />

      {/* Modal for detailed view */}
      {selectedRegistration && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedRegistration(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Training Registration Details</h2>
            <div style={{ marginTop: '1rem' }}>
              <p>
                <strong>Player:</strong> {selectedRegistration.player_name} (
                {selectedRegistration.player_age} yrs)
              </p>
              <p>
                <strong>Training Type:</strong>{' '}
                {formatTrainingType(selectedRegistration.training_type)}
              </p>
              <p>
                <strong>Skill Level:</strong>{' '}
                {formatSkillLevel(selectedRegistration.skill_level)}
              </p>
              <p>
                <strong>Focus Areas:</strong>{' '}
                {formatFocusAreas(selectedRegistration.focus_areas).join(', ')}
              </p>
              <p>
                <strong>Parent:</strong> {selectedRegistration.parent_name}
              </p>
              <p>
                <strong>Email:</strong> {selectedRegistration.parent_email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedRegistration.parent_phone}
              </p>
              <p>
                <strong>Preferred Days:</strong>{' '}
                {formatDays(selectedRegistration.preferred_days).join(', ')}
              </p>
              <p>
                <strong>Preferred Time:</strong>{' '}
                {formatTime(selectedRegistration.preferred_time)}
              </p>
              {selectedRegistration.additional_info && (
                <p>
                  <strong>Additional Info:</strong> {selectedRegistration.additional_info}
                </p>
              )}
              <p>
                <strong>Amount:</strong> ${selectedRegistration.total_amount}
              </p>
              <p>
                <strong>Status:</strong> {selectedRegistration.status}
              </p>
            </div>
            <button
              onClick={() => setSelectedRegistration(null)}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#15141a',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminTraining;
