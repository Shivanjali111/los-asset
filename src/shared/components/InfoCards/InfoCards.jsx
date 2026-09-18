/**
 * SUMMARY CARD GRID: Dashboard passes the metrics returned by mapDashboard().
 * Each item contains id, label, value, description, icon and optional note/tone/emphasis.
 * map() renders one card per item; key={item.id} lets React keep track of each card.
 * Values are already prepared for display. This component does not fetch or calculate loan totals.
 */
import AppIcon from "../../icons/AppIcon";

export default function InfoCards({ items, label = "Summary metrics" }) {
  return (
    <section className="kpi-grid" aria-label={label}>
      {/* Stable IDs identify cards across renders; labels/values are supplied by the mapper. */}
      {items.map((item) => (
        <div
          key={item.id}
          className={`kpi-card ${item.emphasis ? "primary-kpi" : ""}`}
        >
          <div className="kpi-content">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.description}</p>
            {item.note && (
              <div className={`kpi-trend ${item.tone || "neutral"}`}>
                {item.note}
              </div>
            )}
          </div>
          <div className="kpi-icon">
            <AppIcon name={item.icon} size={21} />
          </div>
        </div>
      ))}
    </section>
  );
}
