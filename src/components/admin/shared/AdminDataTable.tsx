import { useState, useEffect, ReactNode } from 'react';
import { Search, Download, ArrowUpDown, ChevronLeft, ChevronRight } from '../../../components/Icons/Icons';
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

const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;
type PageSize = typeof PAGE_SIZE_OPTIONS[number];

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(25);

  // Reset to page 1 whenever filters/search/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilters, sortConfig]);

  // Filter + sort pipeline (client-side on the full dataset)
  useEffect(() => {
    let result = [...data];

    if (searchTerm && searchable) {
      const normalised = searchTerm.toLowerCase();
      result = result.filter(row => {
        const fieldsToSearch = searchFields || (Object.keys(row) as (keyof T)[]);
        return fieldsToSearch.some(field => {
          const value = row[field];
          return value?.toString().toLowerCase().includes(normalised);
        });
      });
    }

    Object.entries(activeFilters).forEach(([field, filterValue]) => {
      if (filterValue !== 'all') {
        result = result.filter(row => row[field as keyof T] === filterValue);
      }
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key!];
        const bVal = b[sortConfig.key!];
        if (aVal === bVal) return 0;
        const cmp = aVal < bVal ? -1 : 1;
        return sortConfig.direction === 'asc' ? cmp : -cmp;
      });
    }

    setFilteredData(result);
  }, [data, searchTerm, activeFilters, sortConfig, searchable, searchFields]);

  // Pagination derived values
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, filteredData.length);
  const pageData = filteredData.slice(pageStart, pageEnd);

  const handleSort = (accessor: keyof T | ((row: T) => any)) => {
    if (typeof accessor === 'function') return;
    setSortConfig(prev => ({
      key: accessor,
      direction: prev.key === accessor && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleFilterChange = (field: string, value: string) => {
    setActiveFilters(prev => ({ ...prev, [field]: value }));
  };

  const exportToCSV = () => {
    const headers = columns.map(col => col.header);
    const rows = filteredData.map(row =>
      columns.map(col => {
        const accessor = col.accessor;
        const value = typeof accessor === 'function' ? accessor(row) : row[accessor];
        if (col.exportFormatter) return col.exportFormatter(value, row);
        if (value === null || value === undefined) return '';
        if (Array.isArray(value)) return value.join('; ');
        return value.toString();
      })
    );

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFilename
      ? `${exportFilename}-${new Date().toISOString().split('T')[0]}.csv`
      : `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getCellValue = (row: T, column: Column<T>) => {
    const accessor = column.accessor;
    const value = typeof accessor === 'function' ? accessor(row) : row[accessor];
    return column.cell ? column.cell(value, row) : value;
  };

  if (loading) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <div className={styles.loading}>Loading {title.toLowerCase()}…</div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>{title}</h1>
          {subtitle
            ? <p>{subtitle}</p>
            : <p>
                {filteredData.length !== data.length
                  ? `${filteredData.length} of ${data.length} ${data.length === 1 ? 'item' : 'items'}`
                  : `${data.length} ${data.length === 1 ? 'item' : 'items'}`
                }
              </p>
          }
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
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          {filters?.map(filter => (
            <select
              key={String(filter.field)}
              value={activeFilters[String(filter.field)] || 'all'}
              onChange={e => handleFilterChange(String(filter.field), e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">{filter.label}</option>
              {filter.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
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
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.noData}>
                  {filteredData.length === 0 && data.length > 0
                    ? 'No results match your search or filters.'
                    : emptyMessage
                  }
                </td>
              </tr>
            ) : (
              pageData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={onRowClick ? styles.clickableRow : ''}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex}>{getCellValue(row, column)}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationButton}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={safeCurrentPage === 1}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          <span className={styles.paginationInfo}>
            {pageStart + 1}–{pageEnd} of {filteredData.length}
          </span>

          <button
            className={styles.paginationButton}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage === totalPages}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>

          <select
            className={styles.filterSelect}
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value) as PageSize);
              setCurrentPage(1);
            }}
            aria-label="Rows per page"
            style={{ minWidth: 'unset', width: 'auto' }}
          >
            {PAGE_SIZE_OPTIONS.map(size => (
              <option key={size} value={size}>{size} / page</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default AdminDataTable;
