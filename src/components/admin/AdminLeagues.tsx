import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trophy, User } from '../../components/Icons/Icons';
import AdminDataTable, { type Column } from './shared/AdminDataTable';
import { CellWithIcon, ContactCell, StatusBadge } from './shared/TableCells';

interface LeagueRegistration {
  id: string;
  team_name: string;
  age_division: string;
  captain_name: string;
  captain_email: string;
  captain_phone: string;
  skill_level: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
  leagues?: {
    name: string;
    season: string;
  };
}

const AdminLeagues = () => {
  const [registrations, setRegistrations] = useState<LeagueRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('league_registrations')
        .select('*, leagues(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<LeagueRegistration>[] = [
    {
      header: 'Team',
      accessor: 'team_name',
      cell: (value) => (
        <CellWithIcon icon={Trophy}>
          {value}
        </CellWithIcon>
      ),
    },
    {
      header: 'League',
      accessor: 'age_division',
    },
    {
      header: 'Captain',
      accessor: 'captain_name',
      cell: (value) => (
        <CellWithIcon icon={User}>
          {value}
        </CellWithIcon>
      ),
    },
    {
      header: 'Contact',
      accessor: (row) => `${row.captain_email} ${row.captain_phone}`,
      cell: (_, row) => (
        <ContactCell email={row.captain_email} phone={row.captain_phone} />
      ),
      sortable: false,
      exportFormatter: (_, row) => `${row.captain_email}, ${row.captain_phone}`,
    },
    {
      header: 'Experience',
      accessor: 'skill_level',
    },
    {
      header: 'Amount',
      accessor: 'total_amount',
      cell: (value) => `$${value}`,
      exportFormatter: (value) => `$${value}`,
    },
    {
      header: 'Status',
      accessor: 'payment_status',
      cell: (value) => <StatusBadge status={value || 'paid'} />,
    },
  ];

  return (
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
    />
  );
};

export default AdminLeagues;
