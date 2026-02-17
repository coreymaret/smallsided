import { useState, useEffect, ReactNode } from 'react';
import { Search, Download, ArrowUpDown } from '../../../components/Icons/Icons';
import styles from '../AdminTable.module.scss';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => any);
  sortable?: boolean;
  cell?: (value: any, row: T) => ReactNode;
  exportFormatter?: (value: any, row: T) => string;
}

export interface FilterOption {
  label: string;
  value: string;
}

interface AdminDataTableProps<T> {
  // Data
  data: T[];
  columns: Column<T>[];
  
  // Header
  title: string;
  subtitle?: string;
  
  // Features
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  
  exportable?: boolean;
  exportFilename?: string;
  
  filters?: {
    label: string;
    field: keyof T;
    options: FilterOption[];
  }[];
  
  // State
  loading?: boolean;
  emptyMessage?: string;
  
  // Actions
  onRowClick?: (row: T) => void;
  
  // Styling
  className?: string;
}

function AdminDataTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  subtitle,
  searchable = true,
  searchPlaceholder = 'Search...',
  searchFields,
  exportable = false,
  exportFilename,
  filters,
  loading = false,
  emptyMessage = 'No data found',
  onRowClick,
  className,
}: AdminDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });
  const [filteredData, setFilteredData] = useState<T[]>(data);

  // Update filtered data when search, filters, or source data changes
  useEffect(() => {
    let result = [...data];

    // Apply search
    if (searchTerm && searchable) {
      result = result.filter(row => {
        const fieldsToSearch = searchFields || (Object.keys(row) as (keyof T)[]);
        return fieldsToSearch.some(field => {
          const value = row[field];
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([field, filterValue]) => {
      if (filterValue !== 'all') {
        result = result.filter(row => row[field as keyof T] === filterValue);
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key!];
        const bVal = b[sortConfig.key!];
        
        if (aVal === bVal) return 0;
        
        const comparison = aVal < bVal ? -1 : 1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    setFilteredData(result);
  }, [data, searchTerm, activeFilters, sortConfig, searchable, searchFields]);

  const handleSort = (accessor: keyof T | ((row: T) => any)) => {
    // Only sort if accessor is a key, not a function
    if (typeof accessor === 'function') return;

    setSortConfig(prev => ({
      key: accessor,
      direction: prev.key === accessor && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleFilterChange = (field: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const exportToCSV = () => {
    const headers = columns.map(col => col.header);
    const rows = filteredData.map(row =>
      columns.map(col => {
        const accessor = col.accessor;
        const value = typeof accessor === 'function' ? accessor(row) : row[accessor];
        
        if (col.exportFormatter) {
          return col.exportFormatter(value, row);
        }
        
        // Default formatting
        if (value === null || value === undefined) return '';
        if (Array.isArray(value)) return value.join('; ');
        return value.toString();
      })
    );

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFilename || `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getCellValue = (row: T, column: Column<T>) => {
    const accessor = column.accessor;
    const value = typeof accessor === 'function' ? accessor(row) : row[accessor];
    
    if (column.cell) {
      return column.cell(value, row);
    }
    
    return value;
  };

  if (loading) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <div className={styles.loading}>Loading {title.toLowerCase()}...</div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
          {!subtitle && <p>{filteredData.length} {filteredData.length === 1 ? 'item' : 'items'}</p>}
        </div>
        {exportable && (
          <button onClick={exportToCSV} className={styles.exportButton}>
            <Download size={18} />
            Export CSV
          </button>
        )}
      </div>

      {/* Filters */}
      {(searchable || filters) && (
        <div className={styles.filters}>
          {searchable && (
            <div className={styles.searchBox}>
              <Search size={18} />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          {filters?.map(filter => (
            <select
              key={String(filter.field)}
              value={activeFilters[String(filter.field)] || 'all'}
              onChange={(e) => handleFilterChange(String(filter.field), e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">{filter.label}</option>
              {filter.options.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  onClick={() => column.sortable !== false && handleSort(column.accessor)}
                  className={column.sortable !== false ? styles.sortable : ''}
                >
                  <div className={styles.headerCell}>
                    {column.header}
                    {column.sortable !== false && (
                      <ArrowUpDown
                        size={14}
                        className={
                          sortConfig.key === column.accessor
                            ? styles.sortIconActive
                            : styles.sortIcon
                        }
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.noData}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={onRowClick ? styles.clickableRow : ''}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex}>
                      {getCellValue(row, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDataTable;
