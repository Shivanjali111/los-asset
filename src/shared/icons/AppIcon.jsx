/**
 * CENTRAL ICON REGISTRY: all migrated dashboard SVG artwork lives in this file.
 * Callers use <AppIcon name="plus" size={16} /> instead of copying SVG markup.
 * name selects ICON_PATHS; size controls dimensions; className allows stylesheet styling.
 * currentColor makes an icon inherit its parent color, so it follows the theme automatically.
 * Icons are decorative. The surrounding button must supply visible text or an accessible label.
 */
const ICON_PATHS = {
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </>
  ),
  collapse: <polyline points="15 18 9 12 15 6" />,
  expand: <polyline points="9 18 15 12 9 6" />,
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  "gold-loan": (
    <>
      <path d="M6.5 4h11l3 5-8.5 11L3.5 9l3-5Z" />
      <path d="m3.5 9 8.5 3 8.5-3M8.5 4 12 12 15.5 4" />
    </>
  ),
  appraisal: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4M8.5 11l1.7 1.7 3.5-3.7" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 7v5h-5" />
      <path d="M18.2 16a8 8 0 1 1 .8-8.9L20 12" />
    </>
  ),
  sanction: (
    <>
      <path d="M12 3 4.5 6v5.5c0 4.7 3.2 7.7 7.5 9.5 4.3-1.8 7.5-4.8 7.5-9.5V6L12 3Z" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </>
  ),
  disbursement: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18M7 15h3" />
    </>
  ),
  branch: (
    <>
      <path d="m3 9 9-5 9 5" />
      <path d="M5 9h14M6 9v8M10 9v8M14 9v8M18 9v8M4 20h16" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6" />
    </>
  ),
  broker: (
    <>
      <path d="M4 11.5 8.5 7l3 3 4.5-4.5L20 9.5" />
      <path d="M3 18h18M5 15l3-3 3 2 5-4 3 3" />
    </>
  ),
  check: <path d="m5 12.5 4.2 4.2L19.5 6.5" />,
  rupee: (
    <>
      <path d="M6 5h12M6 9h12M7 5c5.5 0 7.5 1.8 7.5 4.5S12.5 14 7 14l8 6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  download: (
    <>
      <path d="M12 3v12" />
      <path d="m7.5 10.5 4.5 4.5 4.5-4.5M5 21h14" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
};

const AppIcon = ({ name, size = 18, className = "" }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {ICON_PATHS[name]}
  </svg>
);

export default AppIcon;
