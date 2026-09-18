/**
 * SHARED FEEDBACK: used by the dashboard, table and charts when content cannot be displayed.
 * message is user-facing text; error chooses an alert role; onRetry optionally adds a Retry button.
 * Retry calls the supplied function. This component knows nothing about the underlying API.
 */
import Button from "../Button/Button";

export default function EmptyState({ message, error = false, onRetry }) {
  return (
    <div className="table-empty-state" role={error ? "alert" : "status"}>
      <p>{message}</p>
      {onRetry && (
        <Button className="small-action-button" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
