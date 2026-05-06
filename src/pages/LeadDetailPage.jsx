/* ─────────────────────────────────────────────
   LOS Portal — Lead Detail Page
   Same enterprise blue system as Dashboard
───────────────────────────────────────────── */

:root {
  --ld-sidebar-top:    #1a3d6e;
  --ld-sidebar-bottom: #12305a;
  --ld-blue:           #1e5fa5;
  --ld-blue-mid:       #3578c2;
  --ld-blue-light:     #e8f0fb;
  --ld-blue-tint:      #f0f5fb;
  --ld-bg:             #edf2f8;
  --ld-card:           #ffffff;
  --ld-border:         #cfdaeb;
  --ld-border-soft:    #dfe8f2;
  --ld-text:           #1b2c41;
  --ld-muted:          #4d6882;
  --ld-soft:           #88a2bc;
  --ld-green:          #2e7d32;
  --ld-green-bg:       #e8f5e9;
  --ld-amber:          #a05c0a;
  --ld-amber-bg:       #fef3e0;
  --ld-red:            #c0392b;
  --ld-red-bg:         #fdecea;
  --ld-shadow:         0 1px 3px rgba(18,48,90,.07), 0 6px 18px rgba(18,48,90,.06);
  --ld-shadow-hover:   0 4px 10px rgba(18,48,90,.1),  0 12px 28px rgba(18,48,90,.09);
  --ld-shadow-card:    0 1px 2px rgba(18,48,90,.05),  0 4px 12px rgba(18,48,90,.05);
}

*, *::before, *::after { box-sizing: border-box; }

.lead-detail-layout {
  width: 100%;
  height: 100vh;
  display: flex;
  overflow: hidden;
  background: var(--ld-bg);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Helvetica, Arial, sans-serif;
  color: var(--ld-text);
}

/* ─── SIDEBAR (mirrors Dashboard exactly) ── */

.app-sidebar {
  position: sticky;
  top: 0;
  width: 268px;
  min-height: 100vh;
  padding: 20px 14px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  background: linear-gradient(180deg, var(--ld-sidebar-top) 0%, var(--ld-sidebar-bottom) 100%);
  color: #fff;
  border-right: 1px solid rgba(0,0,0,.12);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 4px 18px;
  border-bottom: 1px solid rgba(255,255,255,.1);
  white-space: nowrap;
}

.sidebar-logo {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.18);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .06em;
  color: #fff;
}

.sidebar-brand-text h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
}

.sidebar-brand-text p {
  margin: 3px 0 0;
  font-size: 11px;
  color: rgba(255,255,255,.48);
  white-space: nowrap;
}

.sidebar-nav {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  width: 100%;
  border: none;
  padding: 10px 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  color: rgba(255,255,255,.6);
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  position: relative;
  transition: background .16s ease, color .16s ease, transform .16s ease;
}

.nav-icon {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  display: grid;
  place-items: center;
  background: rgba(255,255,255,.08);
  font-size: 11px;
  flex-shrink: 0;
}

.nav-label {
  overflow: hidden;
  white-space: nowrap;
}

.nav-item:hover {
  background: rgba(255,255,255,.08);
  color: #fff;
  transform: translateX(2px);
}

.nav-item.active {
  background: rgba(255,255,255,.12);
  color: #fff;
  font-weight: 700;
}

.nav-item.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 7px;
  bottom: 7px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: #7db8f7;
}

.nav-item.active .nav-icon {
  background: rgba(125,184,247,.22);
  color: #a8d1ff;
}

.sidebar-insight-card {
  margin-top: 18px;
  padding: 15px;
  border-radius: 13px;
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.1);
}

.sidebar-insight-card span {
  display: block;
  margin-bottom: 7px;
  color: #a8d1ff;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
}

.sidebar-insight-card strong {
  display: block;
  color: #fff;
  font-size: 12.5px;
  font-weight: 700;
  line-height: 1.35;
}

.sidebar-insight-card p {
  margin: 6px 0 0;
  color: rgba(255,255,255,.5);
  font-size: 11px;
  line-height: 1.5;
}

.sidebar-footer {
  margin-top: auto;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.09);
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  white-space: nowrap;
}

.sidebar-footer-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(125,184,247,.22);
  border: 1.5px solid rgba(125,184,247,.4);
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
  color: #a8d1ff;
  flex-shrink: 0;
}

.sidebar-footer-info p {
  margin: 0 0 2px;
  font-size: 10.5px;
  color: rgba(255,255,255,.46);
}

.sidebar-footer-info strong {
  font-size: 12.5px;
  font-weight: 700;
  color: #fff;
}

/* ─── MAIN ───────────────────────────────── */

.lead-detail-main {
  flex: 1;
  min-width: 0;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 26px 36px;
  background: var(--ld-bg);
}

/* ─── TOPBAR ─────────────────────────────── */

.record-topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  margin: 0 -26px 20px;
  padding: 14px 26px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  background: rgba(237,242,248,.92);
  border-bottom: 1px solid var(--ld-border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.record-topbar-left { min-width: 0; }

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  color: var(--ld-blue);
  font-size: 12.5px;
  font-weight: 700;
  font-family: inherit;
  padding: 0;
  margin-bottom: 12px;
  cursor: pointer;
  transition: color .14s ease;
}

.back-btn:hover {
  color: var(--ld-sidebar-top);
  text-decoration: underline;
}

.record-title-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.record-avatar {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  font-size: 18px;
  font-weight: 760;
  color: #fff;
  background: linear-gradient(135deg, var(--ld-sidebar-top) 0%, var(--ld-blue-mid) 100%);
  box-shadow: 0 6px 18px rgba(21,87,168,.25);
}

.page-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  color: var(--ld-blue);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
}

.page-eyebrow::before {
  content: "";
  display: inline-block;
  width: 14px;
  height: 2px;
  border-radius: 2px;
  background: var(--ld-blue);
  opacity: .6;
}

.record-title-line {
  display: flex;
  align-items: center;
  gap: 9px;
}

.record-title-line h1 {
  margin: 0;
  color: var(--ld-text);
  font-size: 24px;
  font-weight: 760;
  letter-spacing: -.5px;
}

.title-edit-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--ld-border);
  border-radius: 8px;
  background: var(--ld-card);
  color: var(--ld-soft);
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;
  font-family: inherit;
  transition: background .14s ease, color .14s ease, border-color .14s ease;
}

.title-edit-btn:hover {
  background: var(--ld-blue-light);
  color: var(--ld-blue);
  border-color: rgba(30,95,165,.2);
}

.record-meta {
  margin: 5px 0 0;
  color: var(--ld-muted);
  font-size: 12.5px;
  line-height: 1.45;
}

/* ── Topbar actions ── */
.record-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
  flex-shrink: 0;
}

.record-action-logout {
  height: 36px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 9px;
  border: 1px solid var(--ld-border);
  background: var(--ld-card);
  color: var(--ld-muted);
  font-size: 12px;
  font-weight: 650;
  font-family: inherit;
  cursor: pointer;
  box-shadow: var(--ld-shadow-card);
  transition: background .15s ease, border-color .15s ease, color .15s ease;
}

.record-action-logout:hover {
  background: var(--ld-red-bg);
  border-color: rgba(192,57,43,.25);
  color: var(--ld-red);
}

.record-action-outline {
  height: 36px;
  padding: 0 13px;
  display: inline-flex;
  align-items: center;
  border-radius: 9px;
  border: 1px solid var(--ld-border);
  background: var(--ld-card);
  color: var(--ld-blue);
  font-size: 12px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  box-shadow: var(--ld-shadow-card);
  transition: background .15s ease, border-color .15s ease, transform .15s ease;
}

.record-action-outline:hover {
  background: var(--ld-blue-light);
  border-color: rgba(30,95,165,.22);
  transform: translateY(-1px);
}

.record-action-primary {
  height: 36px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border-radius: 9px;
  border: none;
  background: linear-gradient(135deg, #1557a8 0%, #2a7de1 100%);
  color: #fff;
  font-size: 12.5px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(21,87,168,.28), 0 6px 16px rgba(21,87,168,.2);
  transition: transform .15s ease, box-shadow .15s ease, background .15s ease;
}

.record-action-primary:hover {
  transform: translateY(-1px);
  background: linear-gradient(135deg, #1663bf 0%, #3189f0 100%);
  box-shadow: 0 4px 10px rgba(21,87,168,.32), 0 10px 24px rgba(21,87,168,.22);
}

.record-action-primary:active { transform: translateY(0); }

/* ─── SUMMARY STRIP ──────────────────────── */

.record-summary-strip {
  display: grid;
  grid-template-columns: repeat(5, minmax(140px, 1fr));
  gap: 0;
  margin-bottom: 20px;
  border-radius: 16px;
  overflow: hidden;
  background: var(--ld-card);
  border: 1px solid var(--ld-border);
  box-shadow: var(--ld-shadow-card);
}

.summary-item {
  padding: 16px 18px;
  border-right: 1px solid var(--ld-border-soft);
  transition: background .16s ease;
}

.summary-item:last-child { border-right: none; }
.summary-item:hover { background: var(--ld-blue-tint); }

.summary-item span {
  display: block;
  margin-bottom: 6px;
  color: var(--ld-muted);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
}

.summary-item strong {
  color: var(--ld-text);
  font-size: 14px;
  font-weight: 720;
}

.text-green  { color: var(--ld-green)  !important; }
.text-amber  { color: var(--ld-amber)  !important; }
.text-red    { color: var(--ld-red)    !important; }

/* ─── PAGE GRID ──────────────────────────── */

.record-page-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 20px;
  align-items: flex-start;
}

.record-main-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.record-side-col {
  position: sticky;
  top: 105px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ─── RECORD SECTION ─────────────────────── */

.record-section {
  border-radius: 18px;
  background: var(--ld-card);
  border: 1px solid var(--ld-border);
  box-shadow: var(--ld-shadow-card);
  overflow: hidden;
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}

.record-section:hover {
  transform: translateY(-1px);
  border-color: #b8cade;
  box-shadow: var(--ld-shadow-hover);
}

.record-section-header {
  padding: 16px 20px 13px;
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
  border-bottom: 1px solid var(--ld-border-soft);
  background: #fafcff;
}

.record-section-header h3 {
  margin: 0;
  color: var(--ld-text);
  font-size: 14.5px;
  font-weight: 760;
  letter-spacing: -.1px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.record-section-header h3::before {
  content: "";
  display: inline-block;
  width: 3px;
  height: 14px;
  border-radius: 2px;
  background: var(--ld-blue);
}

.record-section-header p {
  margin: 4px 0 0;
  color: var(--ld-muted);
  font-size: 11.5px;
  line-height: 1.45;
}

.section-edit-btn {
  height: 30px;
  padding: 0 11px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 8px;
  border: 1px solid var(--ld-border);
  background: var(--ld-card);
  color: var(--ld-muted);
  font-size: 11.5px;
  font-weight: 650;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background .14s ease, color .14s ease, border-color .14s ease;
}

.section-edit-btn:hover {
  background: var(--ld-blue-light);
  color: var(--ld-blue);
  border-color: rgba(30,95,165,.2);
}

/* ── Field grid ── */
.record-field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.record-field {
  min-height: 70px;
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  border-bottom: 1px solid var(--ld-border-soft);
  transition: background .14s ease;
}

.record-field:nth-child(odd)  { border-right: 1px solid var(--ld-border-soft); }
.record-field:last-child,
.record-field:nth-last-child(2):nth-child(odd) { border-bottom: none; }

.record-field:hover { background: var(--ld-blue-tint); }

.record-field-content { min-width: 0; }

.record-field span {
  display: block;
  margin-bottom: 5px;
  color: var(--ld-muted);
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
}

.record-field strong {
  display: block;
  color: var(--ld-text);
  font-size: 13.5px;
  font-weight: 700;
  line-height: 1.4;
  word-break: break-word;
}

.field-edit-btn {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: var(--ld-soft);
  display: grid;
  place-items: center;
  cursor: pointer;
  font-family: inherit;
  opacity: 0;
  transition: opacity .14s ease, background .14s ease, color .14s ease, border-color .14s ease;
}

.record-field:hover .field-edit-btn {
  opacity: 1;
}

.field-edit-btn:hover {
  background: var(--ld-blue-light);
  border-color: rgba(30,95,165,.18);
  color: var(--ld-blue);
}

/* ─── SIDE CARD ──────────────────────────── */

.side-card {
  padding: 18px;
  border-radius: 18px;
  background: var(--ld-card);
  border: 1px solid var(--ld-border);
  box-shadow: var(--ld-shadow-card);
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}

.side-card:hover {
  transform: translateY(-1px);
  border-color: #b8cade;
  box-shadow: var(--ld-shadow-hover);
}

.side-card h3 {
  margin: 0 0 14px;
  color: var(--ld-text);
  font-size: 14px;
  font-weight: 760;
  letter-spacing: -.1px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.side-card h3::before {
  content: "";
  display: inline-block;
  width: 3px;
  height: 13px;
  border-radius: 2px;
  background: var(--ld-blue);
}

/* ── Verification rows ── */
.verify-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 11px;
  background: var(--ld-bg);
  border: 1px solid var(--ld-border-soft);
  margin-bottom: 10px;
  transition: background .15s ease, border-color .15s ease;
}

.verify-row:last-child { margin-bottom: 0; }
.verify-row:hover { background: var(--ld-blue-tint); border-color: var(--ld-border); }

.verify-row span {
  display: block;
  margin-bottom: 3px;
  color: var(--ld-muted);
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
}

.verify-row strong {
  display: block;
  color: var(--ld-text);
  font-size: 13px;
  font-weight: 700;
}

.verify-row p {
  margin: 3px 0 0;
  color: var(--ld-muted);
  font-size: 11.5px;
}

.verify-chip {
  height: 30px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid var(--ld-border);
  background: var(--ld-card);
  color: var(--ld-blue);
  font-size: 11.5px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background .14s ease, border-color .14s ease, transform .14s ease;
}

.verify-chip:hover {
  background: var(--ld-blue-light);
  border-color: rgba(30,95,165,.22);
  transform: translateY(-1px);
}

/* ── Journey ── */
.journey-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.journey-step {
  display: flex;
  gap: 12px;
  position: relative;
}

.journey-step:not(:last-child)::after {
  content: "";
  position: absolute;
  left: 14px;
  top: 36px;
  width: 2px;
  height: 20px;
  background: var(--ld-border);
  border-radius: 2px;
}

.journey-num {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: 9px;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 760;
  background: var(--ld-blue-light);
  color: var(--ld-blue);
  border: 1px solid rgba(30,95,165,.15);
}

.journey-step.active .journey-num {
  background: linear-gradient(135deg, var(--ld-sidebar-top) 0%, var(--ld-blue-mid) 100%);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 10px rgba(21,87,168,.22);
}

.journey-step strong {
  display: block;
  color: var(--ld-text);
  font-size: 12.5px;
  font-weight: 700;
  margin-bottom: 3px;
}

.journey-step p {
  margin: 0;
  color: var(--ld-muted);
  font-size: 12px;
  line-height: 1.45;
}

/* ── Quick actions ── */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-btn {
  width: 100%;
  height: 38px;
  border-radius: 10px;
  border: 1px solid var(--ld-border);
  background: var(--ld-card);
  color: var(--ld-text);
  font-size: 12.5px;
  font-weight: 650;
  font-family: inherit;
  cursor: pointer;
  transition: background .14s ease, border-color .14s ease, transform .14s ease, color .14s ease;
}

.quick-btn:hover {
  background: var(--ld-blue-tint);
  border-color: var(--ld-border);
  color: var(--ld-blue);
  transform: translateY(-1px);
}

.quick-btn.primary {
  border: none;
  background: linear-gradient(135deg, #1557a8 0%, #2a7de1 100%);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(21,87,168,.25), 0 6px 14px rgba(21,87,168,.18);
}

.quick-btn.primary:hover {
  background: linear-gradient(135deg, #1663bf 0%, #3189f0 100%);
  box-shadow: 0 4px 10px rgba(21,87,168,.3), 0 10px 22px rgba(21,87,168,.2);
  transform: translateY(-1px);
}

/* ─── STATUS PILLS ───────────────────────── */

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 9px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 700;
}

.status-pill.new         { background: var(--ld-blue-light); color: var(--ld-blue); border: 1px solid rgba(30,95,165,.15); }
.status-pill.in-progress { background: var(--ld-amber-bg);   color: var(--ld-amber); border: 1px solid rgba(160,92,10,.15); }
.status-pill.converted   { background: var(--ld-green-bg);   color: var(--ld-green); border: 1px solid rgba(46,125,50,.15); }
.status-pill.disqualified{ background: var(--ld-red-bg);     color: var(--ld-red);   border: 1px solid rgba(192,57,43,.15); }

/* ─── SCROLLBAR ──────────────────────────── */

.lead-detail-main::-webkit-scrollbar { width: 5px; }
.lead-detail-main::-webkit-scrollbar-track { background: transparent; }
.lead-detail-main::-webkit-scrollbar-thumb { background: #b8cade; border-radius: 999px; }
.lead-detail-main::-webkit-scrollbar-thumb:hover { background: var(--ld-blue-mid); }

/* ─── RESPONSIVE ─────────────────────────── */

@media (max-width: 1280px) {
  .record-summary-strip { grid-template-columns: repeat(3, 1fr); }
  .record-page-grid     { grid-template-columns: 1fr; }
  .record-side-col      { position: static; }
}

@media (max-width: 1100px) {
  .lead-detail-layout   { flex-direction: column; height: auto; overflow: visible; }
  .lead-detail-main     { height: auto; overflow: visible; }
  .app-sidebar {
    position: relative;
    width: 100%;
    min-height: auto;
    padding: 14px 16px;
    overflow: visible;
  }
  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    margin-top: 10px;
    gap: 4px;
  }
  .nav-item { min-width: max-content; padding: 8px 12px; }
  .nav-item.active::before {
    top: auto; bottom: 0; left: 8px; right: 8px;
    width: auto; height: 2px; border-radius: 2px 2px 0 0;
  }
  .sidebar-insight-card,
  .sidebar-footer { display: none; }
}

@media (max-width: 760px) {
  .lead-detail-main     { padding: 0 16px 28px; }
  .record-topbar {
    margin: 0 -16px 16px;
    padding: 12px 16px;
    flex-direction: column;
    gap: 12px;
  }
  .record-actions { width: 100%; justify-content: flex-start; flex-wrap: wrap; }
  .record-actions button { flex: 1; min-width: 120px; justify-content: center; }
  .record-title-line h1 { font-size: 20px; }
  .record-summary-strip { grid-template-columns: 1fr 1fr; }
  .record-field-grid    { grid-template-columns: 1fr; }
  .record-field:nth-child(odd) { border-right: none; }
  .record-field:last-child { border-bottom: none; }
  .field-edit-btn { opacity: 1; }
}

@media (max-width: 480px) {
  .record-summary-strip { grid-template-columns: 1fr; }
  .record-actions button { flex: 1 1 45%; }
}
