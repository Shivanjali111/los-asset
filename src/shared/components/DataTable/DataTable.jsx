/**
 * GENERIC TABLE: ProcessingRegister supplies business-specific columns and records.
 * columns: [{ id, label, render? }]. A render(row) function customizes a cell, such as a record link.
 * Without render, the cell displays row[column.id]. rowKey identifies each row, defaulting to id.
 * loading/error/empty states share EmptyState; onRetry is a callback supplied by the data hook.
 * The table renders supplied rows only; it does not fetch, filter or paginate records itself.
 */
import EmptyState from "../EmptyState/EmptyState";

export default function DataTable({
  columns,
  rows,
  rowKey = "id",
  loading,
  error,
  onRetry,
  label,
  emptyMessage = "No records found.",
}) {
  // Column render callbacks allow rich cells while keeping this table independent of loans.
  return (
    <div className="table-wrapper compact-table-wrapper">
      <table
        className="lead-table"
        aria-label={label}
        aria-busy={loading || undefined}
      >
        <thead>
          <tr>
            {columns.map((column) => (
              <th scope="col" key={column.id}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading || error || !rows.length ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState
                  message={
                    loading ? "Loading records..." : error || emptyMessage
                  }
                  error={!!error && !loading}
                  onRetry={!loading && error ? onRetry : undefined}
                />
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row[rowKey]}>
                {columns.map((column) => (
                  <td key={column.id}>
                    {column.render ? column.render(row) : row[column.id]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
