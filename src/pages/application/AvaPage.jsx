//_______________This Code was generated using GenAI tool: Codify, Please check for accuracy_______________//

import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./AvaPage.css";

/* ── API Config ─────────────────────────────────────────────── */

const TODAY_LEADS_API = "https://xx8ep3p2ue.execute-api.ap-south-1.amazonaws.com/prod/leads/today";

/* ── Static Lead Data ───────────────────────────────────────── */

const INITIAL_LEADS = [
  {
    id: "LD-10245",
    customer: "Rohan Mehta",
    product: "Home Loan",
    amount: "₹48L",
    amountFull: "₹48,00,000",
    location: "Mumbai",
    branch: "Andheri",
    signal: "New lead created",
    decision: "Trigger verification",
    status: "New",
    next: "Send email + mobile OTP",
    priority: "High priority",
    readiness: 42,
    verification: "Pending",
    docs: "Not requested",
    avaState: "Completeness check completed · action pending",
    recommendation:
      "Mobile and email verification are pending, but basic lead data is complete. Ava can trigger verification and monitor customer response.",
    decisionColor: "blue",
    statusColor: "amber",
    initials: "RM",
    mobile: "+91 98XXXXXX21",
    email: "rohan.m@email.com",
    employment: "Salaried",
    income: "₹1,85,000",
    risk: "Low",
  },
  {
    id: "LD-10241",
    customer: "Anika Shah",
    product: "LAP",
    amount: "₹72L",
    amountFull: "₹72,00,000",
    location: "Pune",
    branch: "Kothrud",
    signal: "Verification complete",
    decision: "Convert lead",
    status: "Verified",
    next: "Create loan application",
    priority: "Ready to progress",
    readiness: 76,
    verification: "Complete",
    docs: "Checklist pending",
    avaState: "Verification complete · ready to convert",
    recommendation:
      "Verification has passed and required profile fields are available. Ava can convert the lead and create the application record.",
    decisionColor: "green",
    statusColor: "green",
    initials: "AS",
    mobile: "+91 99XXXXXX42",
    email: "anika.shah@email.com",
    employment: "Self-employed",
    income: "₹2,40,000",
    risk: "Low",
  },
  {
    id: "LD-10239",
    customer: "Sameer Patil",
    product: "Home Loan",
    amount: "₹35L",
    amountFull: "₹35,00,000",
    location: "Thane",
    branch: "Thane West",
    signal: "Possible duplicate found",
    decision: "Pause and escalate",
    status: "Blocked",
    next: "Human review required",
    priority: "Exception",
    readiness: 35,
    verification: "Blocked",
    docs: "Not requested",
    avaState: "Journey paused · human approval needed",
    recommendation:
      "A possible duplicate customer was found. Ava should not convert this lead until human review is completed.",
    decisionColor: "red",
    statusColor: "red",
    initials: "SP",
    mobile: "+91 97XXXXXX19",
    email: "sameer.patil@email.com",
    employment: "Salaried",
    income: "₹1,20,000",
    risk: "High",
  },
  {
    id: "LD-10230",
    customer: "Priya Nair",
    product: "Balance Transfer",
    amount: "₹56L",
    amountFull: "₹56,00,000",
    location: "Bengaluru",
    branch: "Indiranagar",
    signal: "No activity for 48 hours",
    decision: "Follow up",
    status: "Stale",
    next: "Send reminder + create task",
    priority: "SLA watch",
    readiness: 38,
    verification: "Pending",
    docs: "Not requested",
    avaState: "Customer inactive · follow-up recommended",
    recommendation:
      "Customer has not responded for 48 hours. Ava can send a reminder and create a relationship manager follow-up task.",
    decisionColor: "amber",
    statusColor: "amber",
    initials: "PN",
    mobile: "+91 96XXXXXX82",
    email: "priya.nair@email.com",
    employment: "Salaried",
    income: "₹1,65,000",
    risk: "Medium",
  },
];

const INITIAL_FEED = [
  {
    icon: "!",
    title: "Compliance routing applied",
    body: "Documents will be collected through secure LOS links, not through Teams upload.",
    time: "09:14 AM",
  },
  {
    icon: "✓",
    title: "Verification pending",
    body: "Mobile and email are not verified. Ava is ready to trigger customer communication.",
    time: "09:13 AM",
  },
  {
    icon: "AI",
    title: "Lead LD-10245 picked up",
    body: "Ava detected a new lead and started completeness checks automatically.",
    time: "09:12 AM",
  },
];

const INITIAL_REVIEW_ITEMS = [
  {
    type: "Duplicate Check",
    title: "LD-10239 · Sameer Patil",
    body: "Possible duplicate customer found. Ava paused conversion and routed for review.",
    color: "red",
  },
  {
    type: "No Response",
    title: "LD-10230 · Priya Nair",
    body: "Customer inactive for 48 hours. Ava sent reminder and created follow-up task.",
    color: "amber",
  },
];

/* ── Helpers ────────────────────────────────────────────────── */

function makeLeadNextKpi(lead) {
  if (lead.decision.includes("Convert")) return "Convert";
  if (lead.decision.includes("escalate")) return "Review";
  if (lead.decision.includes("Follow")) return "Follow-up";
  return "Verify";
}

/* ── Sub-components ─────────────────────────────────────────── */

function Pill({ color, children }) {
  return <span className={`ap-pill ${color}`}>{children}</span>;
}

function Toast({ toasts }) {
  return (
    <div className="ap-toast-stack">
      {toasts.map((t) => (
        <div className="ap-toast" key={t.id}>
          <strong>{t.title}</strong>
          <p>{t.body}</p>
        </div>
      ))}
    </div>
  );
}

function WorkflowStrip({ steps }) {
  return (
    <div className="ap-workflow-strip">
      {steps.map((s) => (
        <div className={`ap-workflow-step ${s.state}`} key={s.id}>
          <div className="ap-step-num">{s.label}</div>
          <strong>{s.title}</strong>
          <span>{s.desc}</span>
        </div>
      ))}
    </div>
  );
}

/* ── API Lead Mapper ────────────────────────────────────────── */

function mapApiLeadToAvaLead(lead) {
  const fullName = `${lead.first_name || ""} ${lead.last_name || ""}`.trim();
  const initials =
    (lead.first_name?.[0] || "") + (lead.last_name?.[0] || "");
  return {
    id: lead.leadnumber || `LD-${lead.id}`,
    customer: fullName || "Unknown",
    product: lead.product || "Home Loan",
    amount: "—",
    amountFull: "—",
    location: lead.city || "—",
    branch: lead.branch || "—",
    signal: "New lead created today",
    decision: "Trigger verification",
    status: lead.stage || "New",
    next: "Send email + mobile OTP",
    priority: "New lead",
    readiness: 10,
    verification: "Pending",
    docs: "Not requested",
    avaState: "New lead detected · completeness check pending",
    recommendation:
      "This lead was created today. Basic information is available — Ava can trigger verification and monitor customer response.",
    decisionColor: "blue",
    statusColor: "amber",
    initials: initials || "??",
    mobile: lead.mobile || "—",
    email: lead.email || "—",
    employment: lead.employment_type || "—",
    income: lead.monthly_income ? `₹${lead.monthly_income}` : "—",
    risk: "Low",
    isFromApi: true,
  };
}

/* ── Main Component ─────────────────────────────────────────── */

function AvaPage() {
  const navigate = useNavigate();

  /* ── State ── */
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [feed, setFeed] = useState(INITIAL_FEED);
  const [reviewItems, setReviewItems] = useState(INITIAL_REVIEW_ITEMS);
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const [kpis, setKpis] = useState({
    leadCount: 7,
    actionCount: 18,
    appCount: 4,
    reviewCount: 2,
  });

  const [workflowStates, setWorkflowStates] = useState({
    wfSignal: "active",
    wfDecision: "",
    wfAction: "",
    wfCompliance: "",
    wfNotify: "",
  });

  const [teamsPreview, setTeamsPreview] = useState({
    title: "Teams update preview",
    body: "Ava will post operational status only. No sensitive customer documents will be shared in Teams.",
  });

  const [progressBars, setProgressBars] = useState({
    verifyWidth: "58%",
    convertedWidth: "35%",
    docsWidth: "42%",
    verifyCount: 7,
    convertedCount: 4,
    docCount: 5,
  });

  /* ── Fetch today's leads and prepend to queue ── */
  useEffect(() => {
    const fetchTodayLeads = async () => {
      try {
        const response = await fetch(TODAY_LEADS_API);
        const data = await response.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const apiLeads = data.data.map(mapApiLeadToAvaLead);
          setLeads([...apiLeads, ...INITIAL_LEADS]);
        }
      } catch (error) {
        console.error("Ava Work Queue — failed to fetch today's leads:", error);
      }
    };
    fetchTodayLeads();
  }, []);

  /* ── Toast helper ── */
  const pushToast = useCallback((title, body) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, title, body }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4200);
  }, []);

  /* ── Feed helper ── */
  const addFeed = useCallback((icon, title, body, time = "Now") => {
    setFeed((prev) => [{ icon, title, body, time }, ...prev]);
  }, []);

  /* ── KPI updater ── */
  const updateKpis = useCallback((patch) => {
    setKpis((prev) => {
      const next = { ...prev, ...patch };
      setProgressBars({
        verifyWidth: Math.min(92, next.actionCount * 3.4) + "%",
        convertedWidth: Math.min(88, next.appCount * 9) + "%",
        docsWidth: Math.min(80, (next.appCount + 1) * 8) + "%",
        verifyCount: Math.min(next.actionCount, 11),
        convertedCount: next.appCount,
        docCount: Math.max(5, next.appCount + 1),
      });
      return next;
    });
  }, []);

  /* ── Workflow helper ── */
  const setWorkflowForLead = useCallback((lead) => {
    setWorkflowStates({
      wfSignal: "done",
      wfDecision: "active",
      wfAction: lead.decisionColor === "red" ? "blocked" : "",
      wfCompliance: "",
      wfNotify: "",
    });
  }, []);

  /* ── Select lead ── */
  const selectLead = useCallback(
    (index, showToast = true) => {
      setSelectedIdx(index);
      const lead = leads[index];
      setTeamsPreview({
        title: "Teams update preview",
        body: `Ava: ${lead.id} is currently marked as ${lead.status}. Next action: ${lead.next}. Sensitive documents will remain inside LOS.`,
      });
      setWorkflowForLead(lead);
      if (showToast) pushToast("Lead selected", `${lead.id} · ${lead.customer}`);
    },
    [leads, setWorkflowForLead, pushToast]
  );

  /* ── Workflow strip data ── */
  const workflowStripData = [
    { id: "wfSignal", label: "Signal Detected", title: "Lead signal identified", desc: "New lead, stale lead, verified lead or exception detected", state: workflowStates.wfSignal },
    { id: "wfDecision", label: "Decision Made", title: "Next best action selected", desc: "Ava decides verify, convert, follow up, or escalate", state: workflowStates.wfDecision },
    { id: "wfAction", label: "Action Executed", title: "Approved workflow step", desc: "Trigger OTP, update LOS, create task, send reminder", state: workflowStates.wfAction },
    { id: "wfCompliance", label: "Compliance Check", title: "Secure handoff applied", desc: "Documents and consent remain inside governed LOS flow", state: workflowStates.wfCompliance },
    { id: "wfNotify", label: "Teams Update", title: "Operational status posted", desc: "Teams receives status only, not customer documents", state: workflowStates.wfNotify },
  ];

  /* ── Dashboard actions ── */
  function handleExecuteSelectedAction() {
    const lead = leads[selectedIdx];
    setWorkflowStates((prev) => ({
      ...prev,
      wfDecision: "done",
      wfAction: lead.decisionColor === "red" ? "blocked" : "done",
      wfCompliance: "done",
      wfNotify: "active",
    }));

    setLeads((prev) => {
      const next = prev.map((l, i) => {
        if (i !== selectedIdx) return l;
        if (l.id === "LD-10245") {
          return { ...l, status: "Verification sent", statusColor: "blue", decision: "Monitor response", decisionColor: "blue", next: "Wait for customer verification", readiness: 55, verification: "Triggered", avaState: "Verification triggered · monitoring response", recommendation: "Ava has triggered verification and is now monitoring customer response before conversion." };
        }
        if (l.id === "LD-10241") {
          return { ...l, status: "Application Created", statusColor: "green", decision: "Track documents", decisionColor: "green", next: "Send secure upload link", readiness: 82, docs: "Link ready", avaState: "Application created · document handoff ready" };
        }
        if (l.id === "LD-10239") {
          return { ...l, status: "Human Review", statusColor: "red", next: "Review duplicate match", avaState: "Journey paused · duplicate review pending" };
        }
        return { ...l, status: "Reminder Sent", statusColor: "blue", decision: "Follow-up active", decisionColor: "blue", next: "Track customer response", avaState: "Reminder sent · task created" };
      });

      const updated = next[selectedIdx];
      setTeamsPreview({
        title: "Teams update preview",
        body: `Ava: ${updated.id} is currently marked as ${updated.status}. Next action: ${updated.next}. Sensitive documents will remain inside LOS.`,
      });

      if (lead.id === "LD-10245") {
        addFeed("✓", "Verification triggered", "Ava sent mobile OTP and email verification to Rohan Mehta.");
        updateKpis({ actionCount: kpis.actionCount + 2 });
      } else if (lead.id === "LD-10241") {
        addFeed("↗", "Lead converted", "Ava converted LD-10241 and created a loan application record.");
        updateKpis({ actionCount: kpis.actionCount + 3, appCount: kpis.appCount + 1 });
      } else if (lead.id === "LD-10239") {
        addFeed("!", "Exception escalated", "Ava paused LD-10239 due to a possible duplicate and created a human review task.");
        setReviewItems((prev) => [{ type: "Duplicate Check", title: `${lead.id} · ${lead.customer}`, body: "Possible duplicate customer found. Ava paused conversion and routed for review.", color: "red" }, ...prev]);
        updateKpis({ reviewCount: kpis.reviewCount + 1, actionCount: kpis.actionCount + 1 });
      } else {
        addFeed("→", "Reminder sent", "Ava sent a follow-up reminder and created a task for Priya Nair.");
        updateKpis({ actionCount: kpis.actionCount + 2 });
      }

      pushToast("Action executed", `${updated.id}: ${updated.status}`);
      return next;
    });
  }

  function handleRunAgentSweep() {
    updateKpis({ leadCount: 9, actionCount: 27, appCount: 6, reviewCount: 3 });
    setWorkflowStates({ wfSignal: "done", wfDecision: "done", wfAction: "done", wfCompliance: "done", wfNotify: "active" });
    setTeamsPreview({ title: "Teams summary posted", body: "Ava: Queue sweep complete. 9 leads reviewed, 6 verification journeys triggered, 2 leads converted, 3 exceptions routed for review." });
    addFeed("AI", "Agent sweep completed", "Ava processed 9 leads, triggered 6 verification journeys, converted 2 ready leads, and escalated 3 exceptions.");
    addFeed("T", "Teams summary posted", "Ava posted an operational summary to Teams without sharing customer documents.");
    pushToast("Agent sweep complete", "Ava independently processed the lead queue.");
  }

  function handleSimulateNewLead() {
    const newLead = {
      id: "LD-10258", customer: "Neha Kulkarni", product: "Home Loan", amount: "₹64L", amountFull: "₹64,00,000",
      location: "Navi Mumbai", branch: "Vashi", signal: "New digital lead", decision: "Trigger verification",
      status: "New", next: "Send email + mobile OTP", priority: "New lead", readiness: 44,
      verification: "Pending", docs: "Not requested", avaState: "New lead detected · completeness check started",
      recommendation: "Ava detected a new digital lead. Basic information is available, so verification can be triggered.",
      decisionColor: "blue", statusColor: "amber", initials: "NK", mobile: "+91 95XXXXXX88",
      email: "neha.kulkarni@email.com", employment: "Salaried", income: "₹2,05,000", risk: "Low",
    };
    setLeads((prev) => [newLead, ...prev]);
    setSelectedIdx(0);
    updateKpis({ leadCount: kpis.leadCount + 1, actionCount: kpis.actionCount + 1 });
    addFeed("AI", "New lead detected", "Ava picked up LD-10258 from the digital lead queue and started completeness checks.");
    pushToast("New lead simulated", "LD-10258 added to the work queue.");
  }

  function handlePostTeamsUpdate() {
    const lead = leads[selectedIdx];
    setTeamsPreview({ title: "Teams update posted", body: `Ava: ${lead.id} update posted to LOS Operations. Status: ${lead.status}. Next action: ${lead.next}. Sensitive documents remain inside LOS.` });
    addFeed("T", "Teams update posted", `Ava posted status for ${lead.id} with no sensitive documents attached.`);
    updateKpis({ actionCount: kpis.actionCount + 1 });
    pushToast("Teams update posted", "Operational status shared safely.");
  }

  /* ── Derived values ── */
  const selectedLead = leads[selectedIdx] || leads[0];
  const leadNextKpi = makeLeadNextKpi(selectedLead);

  /* ── Render ── */
  return (
    <div className="ap-page">

      {/* ══ HEADER ══════════════════════════════════════════════ */}
      <header className="ap-header">
        <div className="ap-title">
          <h2>Morning Coffee View</h2>
          <span>Dashboard-first view of Ava working on leads before humans intervene</span>
        </div>
        <div className="ap-header-actions">
          <div className="ap-agent-live">
            <span className="ap-pulse" />
            Ava is actively monitoring leads
          </div>
        </div>
      </header>

      {/* ══ DASHBOARD ═══════════════════════════════════════════ */}
      <div className="ap-content">

        {/* Hero */}
        <div className="ap-hero">
          <div>
            <div className="ap-hero-kicker">Autonomous Loan Operations</div>
            <h3>Ava has already started the day&apos;s lead work</h3>
            <p>The dashboard shows the agent detecting lead signals, deciding next-best actions, executing approved steps, routing sensitive actions through LOS, and notifying Teams only where appropriate.</p>
          </div>
          <div className="ap-hero-actions">
            <button className="ap-btn green" onClick={handleRunAgentSweep}>Run Agent Sweep</button>
            <button className="ap-btn secondary" onClick={handleSimulateNewLead}>Simulate New Lead</button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="ap-grid-4">
          <div className="ap-kpi green">
            <div className="ap-kpi-label">Leads picked by Ava</div>
            <div className="ap-kpi-value">{kpis.leadCount}</div>
            <div className="ap-kpi-note">New and stale leads monitored from LOS</div>
          </div>
          <div className="ap-kpi">
            <div className="ap-kpi-label">Autonomous actions completed</div>
            <div className="ap-kpi-value">{kpis.actionCount}</div>
            <div className="ap-kpi-note">Verification, reminders, updates and routing</div>
          </div>
          <div className="ap-kpi amber">
            <div className="ap-kpi-label">Applications progressed</div>
            <div className="ap-kpi-value">{kpis.appCount}</div>
            <div className="ap-kpi-note">Lead-to-application movement</div>
          </div>
          <div className="ap-kpi red">
            <div className="ap-kpi-label">Human review required</div>
            <div className="ap-kpi-value">{kpis.reviewCount}</div>
            <div className="ap-kpi-note">Only exceptions require manual intervention</div>
          </div>
        </div>

        {/* Main grid: table + focus panel */}
        <div className="ap-grid-main">
          {/* Ava Work Queue */}
          <div className="ap-panel">
            <div className="ap-panel-head">
              <div>
                <h3>Ava Work Queue</h3>
                <span className="ap-panel-sub">Click a lead to see Ava&apos;s decision, reason and next action</span>
              </div>
              <Pill color="green">Live monitoring</Pill>
            </div>
            <div className="ap-panel-body" style={{ padding: 0 }}>
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>Customer</th>
                    <th>Signal Detected</th>
                    <th>Ava Decision</th>
                    <th>Current Status</th>
                    <th>Next Action</th>
                    <th>Open</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, index) => (
                    <tr
                      key={lead.id}
                      className={`ap-tr-clickable${index === selectedIdx ? " selected" : ""}`}
                      onClick={() => selectLead(index)}
                    >
                      <td>
                        <strong>{lead.id}</strong>
                        <br />
                        <span className="ap-td-muted">{lead.product}</span>
                      </td>
                      <td>
                        {lead.customer}
                        <br />
                        <span className="ap-td-muted">{lead.amount} · {lead.location}</span>
                      </td>
                      <td>{lead.signal}</td>
                      <td><Pill color={lead.decisionColor}>{lead.decision}</Pill></td>
                      <td><Pill color={lead.statusColor}>{lead.status}</Pill></td>
                      <td>{lead.next}</td>
                      <td>
                        <button
                          className="ap-btn secondary small"
                          onClick={(e) => { e.stopPropagation(); navigate(`/leads/${lead.id}`); }}
                        >
                          View Lead
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ava Focus Panel */}
          <div className="ap-panel">
            <div className="ap-panel-head">
              <div>
                <h3>Ava Focus</h3>
                <span className="ap-panel-sub">Embedded agent view, not a separate chatbot tab</span>
              </div>
              <Pill color={selectedLead.decisionColor}>{selectedLead.priority}</Pill>
            </div>
            <div className="ap-panel-body">
              <div className="ap-agent-focus">
                <div className="ap-ava-profile">
                  <div className="ap-ava-avatar">A</div>
                  <div>
                    <strong>Ava is working on selected lead</strong>
                    <span>{selectedLead.avaState}</span>
                  </div>
                </div>
                <div className="ap-focus-card">
                  <div className="ap-mini-label">Selected lead</div>
                  <strong>{selectedLead.id} · {selectedLead.customer}</strong>
                  <p>{selectedLead.product} · {selectedLead.amount} · {selectedLead.location}</p>
                </div>
                <div className="ap-mini-grid">
                  <div className="ap-field"><label>Readiness</label><strong>{selectedLead.readiness}%</strong></div>
                  <div className="ap-field"><label>Owner</label><strong>Ava</strong></div>
                  <div className="ap-field"><label>Verification</label><strong>{selectedLead.verification}</strong></div>
                  <div className="ap-field"><label>Documents</label><strong>{selectedLead.docs}</strong></div>
                </div>
                <div className="ap-agent-message">
                  <strong>Why Ava chose this action</strong>
                  <p>{selectedLead.recommendation}</p>
                </div>
                <div className="ap-focus-actions">
                  <button className="ap-btn small" onClick={handleExecuteSelectedAction}>Execute Next Action</button>
                  <button className="ap-btn ghost small" onClick={handlePostTeamsUpdate}>Post Teams Update</button>
                  <button className="ap-btn secondary small" onClick={() => navigate(`/leads/${selectedLead.id}`)}>View Lead</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Strip */}
        <div className="ap-panel">
          <div className="ap-panel-head">
            <div>
              <h3>Autonomous Workflow Progress</h3>
              <span className="ap-panel-sub">Signal Detected → Decision Made → Action Executed → Compliance Check → Teams Update</span>
            </div>
            <Pill color={selectedLead.decisionColor}>{selectedLead.decision}</Pill>
          </div>
          <div className="ap-panel-body">
            <WorkflowStrip steps={workflowStripData} />
          </div>
        </div>

        {/* Bottom grid */}
        <div className="ap-bottom-grid">
          {/* Live Activity Feed */}
          <div className="ap-panel">
            <div className="ap-panel-head">
              <div>
                <h3>Live Agent Activity</h3>
                <span className="ap-panel-sub">This is the dashboard storytelling area: Ava is visibly working</span>
              </div>
            </div>
            <div className="ap-panel-body">
              <div className="ap-feed">
                {feed.map((item, i) => (
                  <div className="ap-feed-item" key={i}>
                    <div className="ap-feed-icon">{item.icon}</div>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.body}</p>
                      <div className="ap-feed-time">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Teams Preview + Progress */}
          <div className="ap-panel">
            <div className="ap-panel-head">
              <div>
                <h3>Teams Update Preview</h3>
                <span className="ap-panel-sub">Collaboration without document capture</span>
              </div>
            </div>
            <div className="ap-panel-body">
              <div className="ap-teams-preview">
                <strong>{teamsPreview.title}</strong>
                <p>{teamsPreview.body}</p>
              </div>
              <div className="ap-progress-wrap">
                <div className="ap-progress-row">
                  <span>Verification</span>
                  <div className="ap-progress-bar"><div style={{ width: progressBars.verifyWidth }} /></div>
                  <strong>{progressBars.verifyCount}</strong>
                </div>
                <div className="ap-progress-row">
                  <span>Converted</span>
                  <div className="ap-progress-bar"><div style={{ width: progressBars.convertedWidth }} /></div>
                  <strong>{progressBars.convertedCount}</strong>
                </div>
                <div className="ap-progress-row">
                  <span>Doc links</span>
                  <div className="ap-progress-bar"><div style={{ width: progressBars.docsWidth }} /></div>
                  <strong>{progressBars.docCount}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Needs Human Attention */}
          <div className="ap-panel">
            <div className="ap-panel-head">
              <div>
                <h3>Needs Human Attention</h3>
                <span className="ap-panel-sub">Governed autonomy: exceptions only</span>
              </div>
              <Pill color="red">{kpis.reviewCount} Open</Pill>
            </div>
            <div className="ap-panel-body">
              <div className="ap-review-list">
                {reviewItems.map((item, i) => (
                  <div className="ap-review-item" key={i}>
                    <Pill color={item.color}>{item.type}</Pill>
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ TOAST STACK ═════════════════════════════════════════ */}
      <Toast toasts={toasts} />
    </div>
  );
}

export default AvaPage;

//__________________________GenAI: Generated code ends here______________________________//