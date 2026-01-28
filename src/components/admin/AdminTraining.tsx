import { useEffect, useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import type { SortingState, ColumnDef } from '@tanstack/react-table';
import { supabase } from '../../lib/supabase';
import { Calendar, Target, User, Shield, Mail, Phone, ArrowUpDown, Search } from 'lucide-react';
import styles from './AdminTable.module.scss';

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
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => { 
    fetchRegistrations(); 
  }, []);

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
      'individual': 'Individual',
      'small-group': 'Small Group',
      'position-specific': 'Position-Specific'
    };
    return types[type] || type;
  };

  const formatSkillLevel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  const formatFocusAreas = (areas: string[]) => {
    const areaLabels: Record<string, string> = {
      'ball-control': 'Ball Control',
      'shooting': 'Shooting',
      'passing': 'Passing',
      'dribbling': 'Dribbling',
      'defense': 'Defense',
      'fitness': 'Fitness'
    };
    return areas.map(a => areaLabels[a] || a).join(', ');
  };

  const formatDays = (days: string[]) => {
    const dayLabels: Record<string, string> = {
      'monday': 'Mon',
      'tuesday': 'Tue',
      'wednesday': 'Wed',
      'thursday': 'Thu',
      'friday': 'Fri',
      'saturday': 'Sat',
      'sunday': 'Sun'
    };
    return days.map(d => dayLabels[d] || d).join(', ');
  };

  const formatTime = (time: string) => {
    const times: Record<string, string> = {
      'morning': 'Morning (8AM-12PM)',
      'afternoon': 'Afternoon (12PM-5PM)',
      'evening': 'Evening (5PM-8PM)'
    };
    return times[time] || time;
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'confirmed': return styles.statusConfirmed;
      case 'pending': return styles.statusPending;
      case 'cancelled': return styles.statusCancelled;
      case 'completed': return styles.statusCompleted;
      default: return styles.statusPending;
    }
  };

  const columns = useMemo<ColumnDef<TrainingRegistration>[]>(
    () => [
      {
        accessorKey: 'created_at',
        header: 'Date',
        cell: ({ row }) => (
          <div className={styles.dateCell}>
            <Calendar size={16} />
            {new Date(row.original.created_at).toLocaleDateString()}
          </div>
        ),
      },
      {
        accessorKey: 'player_name',
        header: 'Player',
        cell: ({ row }) => (
          <div className={styles.playerCell}>
            <User size={16} />
            <div>
              <div className={styles.playerName}>{row.original.player_name}</div>
              <div className={styles.playerAge}>{row.original.player_age} yrs</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'training_type',
        header: 'Training Type',
        cell: ({ row }) => (
          <div className={styles.typeCell}>
            <Target size={16} />
            {formatTrainingType(row.original.training_type)}
          </div>
        ),
      },
      {
        accessorKey: 'skill_level',
        header: 'Skill Level',
        cell: ({ row }) => (
          <div className={styles.skillCell}>
            <Shield size={16} />
            {formatSkillLevel(row.original.skill_level)}
          </div>
        ),
      },
      {
        accessorKey: 'parent_name',
        header: 'Parent/Guardian',
        cell: ({ row }) => row.original.parent_name,
      },
      {
        accessorKey: 'parent_email',
        header: 'Contact',
        cell: ({ row }) => (
          <div className={styles.contactCell}>
            <div className={styles.contactItem}>
              <Mail size={14} />
              {row.original.parent_email}
            </div>
            <div className={styles.contactItem}>
              <Phone size={14} />
              {row.original.parent_phone}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'total_amount',
        header: 'Amount',
        cell: ({ row }) => <span className={styles.amount}>${row.original.total_amount}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span className={`${styles.statusBadge} ${getStatusClass(row.original.status)}`}>
            {row.original.status}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <button 
            className={styles.viewButton}
            onClick={() => setSelectedRegistration(row.original)}
          >
            View Details
          </button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: registrations,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading training registrations...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Training Registrations</h1>
          <p>{registrations.length} registration{registrations.length !== 1 ? 's' : ''}</p>
        </div>
        
        <div className={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search registrations..."
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={styles.headerCell}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <ArrowUpDown size={14} className={styles.sortIcon} />
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.emptyState}>
                  No training registrations found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, index) => (
                <tr key={row.id} className={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <button
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          className={styles.paginationButton}
        >
          First
        </button>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className={styles.paginationButton}
        >
          Previous
        </button>
        <span className={styles.paginationInfo}>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className={styles.paginationButton}
        >
          Next
        </button>
        <button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
          className={styles.paginationButton}
        >
          Last
        </button>
      </div>

      {/* Detail Modal */}
      {selectedRegistration && (
        <>
          <div 
            className={styles.modalOverlay}
            onClick={() => setSelectedRegistration(null)}
          />
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Training Registration Details</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setSelectedRegistration(null)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.detailSection}>
                <h3>Player Information</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <strong>Player Name:</strong>
                    <span>{selectedRegistration.player_name}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Age:</strong>
                    <span>{selectedRegistration.player_age} years</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Skill Level:</strong>
                    <span>{formatSkillLevel(selectedRegistration.skill_level)}</span>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>Training Details</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <strong>Training Type:</strong>
                    <span>{formatTrainingType(selectedRegistration.training_type)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Focus Areas:</strong>
                    <span>{formatFocusAreas(selectedRegistration.focus_areas)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Preferred Days:</strong>
                    <span>{formatDays(selectedRegistration.preferred_days)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Preferred Time:</strong>
                    <span>{formatTime(selectedRegistration.preferred_time)}</span>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>Parent/Guardian Information</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <strong>Name:</strong>
                    <span>{selectedRegistration.parent_name}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Email:</strong>
                    <span>{selectedRegistration.parent_email}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Phone:</strong>
                    <span>{selectedRegistration.parent_phone}</span>
                  </div>
                </div>
              </div>

              {selectedRegistration.additional_info && (
                <div className={styles.detailSection}>
                  <h3>Additional Comments</h3>
                  <p className={styles.additionalInfo}>
                    {selectedRegistration.additional_info}
                  </p>
                </div>
              )}

              <div className={styles.detailSection}>
                <h3>Payment Information</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <strong>Amount:</strong>
                    <span>${selectedRegistration.total_amount}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Payment ID:</strong>
                    <span className={styles.paymentId}>{selectedRegistration.stripe_payment_intent_id}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Status:</strong>
                    <span className={`${styles.statusBadge} ${getStatusClass(selectedRegistration.status)}`}>
                      {selectedRegistration.status}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Registered:</strong>
                    <span>{new Date(selectedRegistration.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminTraining;