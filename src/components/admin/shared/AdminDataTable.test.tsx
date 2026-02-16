// src/components/admin/shared/AdminDataTable.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../../test/utils'
import AdminDataTable, { type Column } from './AdminDataTable'

interface TestData {
  id: string
  name: string
  email: string
  status: string
}

describe('AdminDataTable', () => {
  const mockData: TestData[] = [
    { id: '1', name: 'John Doe', email: 'john@test.com', status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@test.com', status: 'inactive' },
  ]

  const columns: Column<TestData>[] = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Status', accessor: 'status' },
  ]

  it('renders table with data', () => {
    render(
      <AdminDataTable
        data={mockData}
        columns={columns}
        title="Test Table"
      />
    )

    expect(screen.getByText('Test Table')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('filters data when searching', () => {
    render(
      <AdminDataTable
        data={mockData}
        columns={columns}
        title="Test Table"
        searchable
        searchFields={['name', 'email']}
      />
    )

    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: 'john' } })

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
  })

  it('calls onRowClick when row is clicked', () => {
    const handleRowClick = vi.fn()
    
    render(
      <AdminDataTable
        data={mockData}
        columns={columns}
        title="Test Table"
        onRowClick={handleRowClick}
      />
    )

    const firstRow = screen.getByText('John Doe').closest('tr')
    if (firstRow) {
      fireEvent.click(firstRow)
      expect(handleRowClick).toHaveBeenCalledWith(mockData[0])
    }
  })

  it('shows empty message when no data', () => {
    render(
      <AdminDataTable
        data={[]}
        columns={columns}
        title="Test Table"
        emptyMessage="No data found"
      />
    )

    expect(screen.getByText('No data found')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(
      <AdminDataTable
        data={[]}
        columns={columns}
        title="Test Table"
        loading={true}
      />
    )

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('applies filters correctly', () => {
    render(
      <AdminDataTable
        data={mockData}
        columns={columns}
        title="Test Table"
        filters={[
          {
            label: 'Status',
            field: 'status',
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ],
          },
        ]}
      />
    )

    const filterSelect = screen.getByRole('combobox')
    fireEvent.change(filterSelect, { target: { value: 'active' } })

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
  })

  it('sorts data when clicking column headers', () => {
    render(
      <AdminDataTable
        data={mockData}
        columns={columns}
        title="Test Table"
      />
    )

    const nameHeader = screen.getByText('Name')
    fireEvent.click(nameHeader)

    const rows = screen.getAllByRole('row')
    // First row is header, second should be Jane (sorted alphabetically)
    expect(rows[1]).toHaveTextContent('Jane Smith')
  })
})
