/**
 * REUSABLE SIDEBAR: composed by Dashboard inside AppShell's sidebar slot.
 * brand feeds BrandLogo; items supplies navigation labels/icons; user supplies display identity.
 * collapsed is controlled by the parent. onToggle asks that parent to change its state.
 * onNavigate receives the clicked item; the dashboard decides whether that item has a route.
 * children supplies optional sidebar content (currently ServiceLevelSummary).
 */
import AppIcon from "../../icons/AppIcon";
import Button from "../Button/Button";
import BrandLogo from "../BrandLogo/BrandLogo";

export default function Sidebar({
  brand,
  items,
  collapsed,
  onToggle,
  onNavigate,
  user,
  children,
}) {
  return (
    <aside className={`app-sidebar${collapsed ? " collapsed" : ""}`}>
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <BrandLogo
            brand={brand}
            compact={collapsed}
            className="sidebar-logo-img"
          />
        </div>
        <div className="sidebar-brand-text">
          <h2>{brand.applicationName}</h2>
          <p>{brand.tagline}</p>
        </div>
      </div>
      <Button
        className="sidebar-collapse-btn"
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <span className="sidebar-collapse-icon">
          <AppIcon name={collapsed ? "expand" : "collapse"} size={14} />
        </span>
        <span className="nav-label">Collapse</span>
      </Button>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {items.map((item) => (
          <Button
            key={item.id}
            className={`nav-item${item.active ? " active" : ""}`}
            title={item.label}
            data-label={item.label}
            aria-current={item.active ? "page" : undefined}
            onClick={() => onNavigate?.(item)}
          >
            <span className="nav-icon">
              <AppIcon name={item.icon} size={16} />
            </span>
            <span className="nav-label">{item.label}</span>
          </Button>
        ))}
      </nav>
      {children}
      <div className="sidebar-footer">
        <div className="sidebar-footer-avatar" title={user.label}>
          {user.initials}
        </div>
        <div className="sidebar-footer-info">
          <p>Logged in as</p>
          <strong>{user.label}</strong>
        </div>
      </div>
    </aside>
  );
}
