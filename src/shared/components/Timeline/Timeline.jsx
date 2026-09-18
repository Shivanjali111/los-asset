/**
 * ACTIVITY LIST: RecentActivityPanel supplies items from the dashboard model.
 * Each item has id, title, subtitle, time and icon. id gives React a stable list key.
 * time is already display text; this component does not maintain a live clock or create audit events.
 */
import AppIcon from "../../icons/AppIcon";
import EmptyState from "../EmptyState/EmptyState";

export default function Timeline({ items }) {
  if (!items.length) return <EmptyState message="No recent activity." />;
  return (
    <div className="activity-list">
      {items.map((item) => (
        <div className="activity-item" key={item.id}>
          <div className="activity-icon">
            <AppIcon name={item.icon} size={17} />
          </div>
          <div>
            <strong>{item.title}</strong>
            <p>{item.subtitle}</p>
            <span>{item.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
