import React, { useState } from 'react';

// ─── Mock data ───────────────────────────────────────────────────────────────
const MOCK_COLUMNS = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: false },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: false },
];

const MOCK_ROWS = [
  { id: 'U001', name: 'Nguyen Van A', email: 'a@stallbox.com', role: 'Admin', status: 'active' },
  { id: 'U002', name: 'Tran Thi B', email: 'b@stallbox.com', role: 'Manager', status: 'active' },
  { id: 'U003', name: 'Le Van C', email: 'c@stallbox.com', role: 'Staff', status: 'inactive' },
  { id: 'U004', name: 'Pham Thi D', email: 'd@stallbox.com', role: 'Staff', status: 'active' },
];

/**
 * DataTable – generic sortable table
 *
 * Props:
 *   columns      {Array<{key, label, sortable?, render?}>}
 *   rows         {Array<object>}
 *   isLoading    {boolean}
 *   emptyMessage {string}
 *   onRowClick   {fn}   – (row) => void
 *   renderCell   {fn}   – (key, value, row) => ReactNode  (custom cell override)
 */
const DataTable = ({
  columns = MOCK_COLUMNS,
  rows = MOCK_ROWS,
  isLoading = false,
  emptyMessage = 'No data available.',
  onRowClick,
  renderCell,
}) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedRows = React.useMemo(() => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      const av = String(a[sortKey] ?? '').toLowerCase();
      const bv = String(b[sortKey] ?? '').toLowerCase();
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [rows, sortKey, sortDir]);

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest shadow-soft">
      <table className="w-full text-left border-collapse">
        {/* Head */}
        <thead className="bg-surface-container border-b border-outline-variant">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                className={`px-5 py-3.5 text-label-md text-on-surface-variant uppercase tracking-wider select-none ${col.sortable ? 'cursor-pointer hover:text-on-surface transition-colors' : ''
                  }`}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <span className="material-symbols-outlined text-[14px]">
                      {sortKey === col.key
                        ? sortDir === 'asc'
                          ? 'arrow_upward'
                          : 'arrow_downward'
                        : 'unfold_more'}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center text-on-surface-variant text-body-sm">
                <span className="material-symbols-outlined animate-spin text-primary text-[32px]">progress_activity</span>
                <p className="mt-3">Loading...</p>
              </td>
            </tr>
          ) : sortedRows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center text-on-surface-variant text-body-sm">
                <span className="material-symbols-outlined text-[40px] text-outline">inbox</span>
                <p className="mt-2">{emptyMessage}</p>
              </td>
            </tr>
          ) : (
            sortedRows.map((row, idx) => (
              <tr
                key={row.id ?? idx}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-outline-variant/50 transition-colors duration-100 ${onRowClick ? 'cursor-pointer hover:bg-surface-container-low' : 'hover:bg-surface-container/40'
                  }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-3.5 text-body-sm text-on-surface">
                    {renderCell
                      ? renderCell(col.key, row[col.key], row)
                      : String(row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
