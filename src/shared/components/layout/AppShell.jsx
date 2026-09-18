/**
 * PAGE FRAME: used by Dashboard to place the main parts of the screen.
 * sidebar, header and overlay are named slots: the parent passes already-composed JSX into them.
 * children is React's name for content nested between <AppShell> and </AppShell>.
 * style contains theme CSS variables; descendants, including the drawer, inherit them.
 * This component arranges content only; it does not load records or decide permissions.
 */
export default function AppShell({
  sidebar,
  header,
  overlay,
  style,
  children,
}) {
  return (
    <div className="dashboard-page" style={style}>
      {sidebar}
      <main className="dashboard-main">
        {header}
        {children}
      </main>
      {overlay}
    </div>
  );
}
